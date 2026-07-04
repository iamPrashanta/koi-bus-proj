import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { redisClient } from '../../config/redis';

const prisma = new PrismaClient();

// Helper to update Redis live state and broadcast
async function updateLiveState(ping: any, req: Request) {
  const io = req.app.get('io');

  // 1. Update trip state hash
  await redisClient.hSet(`trip:active:${ping.tripId}`, {
    lat: ping.latitude.toString(),
    lng: ping.longitude.toString(),
    speed: (ping.speed || 0).toString(),
    heading: (ping.heading || 0).toString(),
    updated_at: ping.capturedAt.toString()
  });

  // 2. Update GEO index
  await redisClient.geoAdd('buses:geo:active', {
    longitude: ping.longitude,
    latitude: ping.latitude,
    member: ping.tripId.toString()
  });

  // 3. Broadcast to rooms
  // To avoid hitting DB on every ping, we could cache trip info in Redis when trip starts.
  // For now, let's fetch routeId to broadcast to the route room.
  const trip = await prisma.trip.findUnique({
    where: { id: ping.tripId },
    select: { routeId: true, route: { select: { operatorId: true } } }
  });

  if (trip) {
    const payload = {
      version: 1,
      tripId: ping.tripId,
      lat: ping.latitude,
      lng: ping.longitude,
      speed: ping.speed,
      heading: ping.heading,
      timestamp: ping.capturedAt.toISOString ? ping.capturedAt.toISOString() : new Date(ping.capturedAt).toISOString()
    };
    
    // Broadcast to the trip's specific room
    if (io) {
      io.to(`trip:${ping.tripId}`).emit('location:update', payload);
      io.to(`route:${trip.routeId}`).emit('location:update', payload);
      if (trip.route.operatorId) {
        io.to(`operator:${trip.route.operatorId}`).emit('location:update', payload);
      }
    }
  }
}

export const liveTelemetry = async (req: Request, res: Response) => {
  try {
    const { tripId, latitude, longitude, speed, heading, accuracy, capturedAt } = req.body;
    
    if (!tripId || !latitude || !longitude || !capturedAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const ping = { tripId, latitude, longitude, speed, heading, accuracy, capturedAt };

    // 1. Instantly update Redis Cache for live map
    await updateLiveState(ping, req);

    // 2. Fetch active session
    const session = await prisma.activeTripSession.findFirst({
      where: { tripId, status: 'ONGOING' },
      orderBy: { id: 'desc' }
    });

    // 3. Fire-and-forget log to Database (optional: batch this later)
    await prisma.tripLocation.create({
      data: {
        tripId,
        sessionId: session?.id,
        latitude,
        longitude,
        speed,
        heading,
        accuracy,
        capturedAt: new Date(capturedAt)
      }
    });

    // 4. Update ActiveTripSession telemetry count
    if (session) {
      await prisma.activeTripSession.update({
        where: { id: session.id },
        data: {
          telemetryCount: { increment: 1 },
          lastSeenAt: new Date()
        }
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Live telemetry error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const bulkTelemetry = async (req: Request, res: Response) => {
  try {
    const { pings } = req.body; // Array of location points

    if (!pings || pings.length === 0) {
      return res.status(400).json({ error: 'Empty batch' });
    }

    // 1. Identify newest ping in batch
    const newestPing = pings.reduce((max: any, p: any) => p.capturedAt > max.capturedAt ? p : max, pings[0]);

    // 2. Update Redis with the newest ping
    await updateLiveState(newestPing, req);

    // 3. Find active sessions for all unique tripIds
    const uniqueTripIds = [...new Set(pings.map((p: any) => p.tripId))] as number[];
    const sessions = await prisma.activeTripSession.findMany({
      where: { tripId: { in: uniqueTripIds }, status: 'ONGOING' },
      orderBy: { id: 'desc' }
    });
    
    // Map tripId -> sessionId
    const sessionMap: Record<number, number> = {};
    sessions.forEach(s => {
      if (!sessionMap[s.tripId]) sessionMap[s.tripId] = s.id;
    });

    // 4. Bulk insert all pings to Prisma
    await prisma.tripLocation.createMany({
      data: pings.map((p: any) => ({
        tripId: p.tripId,
        sessionId: sessionMap[p.tripId] || null,
        latitude: p.latitude,
        longitude: p.longitude,
        speed: p.speed,
        heading: p.heading,
        accuracy: p.accuracy,
        capturedAt: new Date(p.capturedAt)
      }))
    });

    res.status(200).json({ success: true, processed: pings.length });
  } catch (error) {
    console.error('Bulk telemetry error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
