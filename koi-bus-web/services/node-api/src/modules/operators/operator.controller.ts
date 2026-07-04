import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';
import { redisClient } from '../../config/redis';

export class OperatorController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const operatorId = parseInt(req.params.id as string);
      
      const activeTripsCount = await prisma.trip.count({
        where: { route: { operatorId }, status: 'ONGOING' }
      });

      // To calculate active drivers, buses, and devices, we can query active assignments
      const activeAssignments = await prisma.tripAssignment.findMany({
        where: {
          trip: { route: { operatorId }, status: 'ONGOING' },
          isActive: true
        }
      });

      const activeDrivers = new Set(activeAssignments.map(a => a.driverId).filter(Boolean)).size;
      const activeBuses = new Set(activeAssignments.map(a => a.busId).filter(Boolean)).size;
      
      // For devices, we can check assignments + Redis last seen
      // Since it's a simple dashboard count, we'll just count assigned devices
      const onlineDevices = new Set(activeAssignments.map(a => a.deviceId).filter(Boolean)).size;

      res.json({
        success: true,
        data: {
          activeTrips: activeTripsCount,
          activeDrivers,
          activeBuses,
          onlineDevices
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getLiveMap(req: Request, res: Response, next: NextFunction) {
    try {
      const operatorId = parseInt(req.params.id as string);
      
      // Get all active trips for this operator
      const activeTrips = await prisma.trip.findMany({
        where: { route: { operatorId }, status: 'ONGOING' },
        select: { id: true, routeId: true }
      });

      const tripsData = await Promise.all(activeTrips.map(async (trip) => {
        const data = await redisClient.hGetAll(`trip:active:${trip.id}`);
        if (!data || Object.keys(data).length === 0) return null;

        const capturedAt = data.capturedAt ? new Date(data.capturedAt) : new Date();
        const diffSecs = (Date.now() - capturedAt.getTime()) / 1000;
        
        let status: 'ONLINE' | 'STALE' | 'OFFLINE' = 'ONLINE';
        if (diffSecs >= 300) status = 'OFFLINE';
        else if (diffSecs >= 60) status = 'STALE';

        return {
          tripId: trip.id,
          routeId: trip.routeId,
          lat: parseFloat(data.latitude || '0'),
          lng: parseFloat(data.longitude || '0'),
          speed: parseFloat(data.speed || '0'),
          heading: parseFloat(data.heading || '0'),
          status
        };
      }));

      res.json({
        success: true,
        data: {
          trips: tripsData.filter(Boolean)
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const operatorController = new OperatorController();
