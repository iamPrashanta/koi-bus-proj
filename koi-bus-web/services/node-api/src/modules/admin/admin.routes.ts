import { Router, Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { redisClient } from '../../config/redis';

export const adminRoutes = Router();

adminRoutes.get('/stats', async (req: Request, res: Response) => {
  try {
    // 1. Fetch all trip:active:* keys from Redis
    const keys = await redisClient.keys('trip:active:*');
    
    // 2. Fetch the data for each active trip
    const activeTrips = await Promise.all(
      keys.map(async (key) => {
        const tripId = key.replace('trip:active:', '');
        const data = await redisClient.hGetAll(key);
        
        // Also fetch from DB to get status
        const dbTrip = await prisma.trip.findUnique({ where: { id: parseInt(tripId) } });
        
        return {
          id: tripId,
          status: dbTrip?.status || 'UNKNOWN',
          lat: parseFloat(data.lat || '0'),
          lng: parseFloat(data.lng || '0'),
          speed: parseFloat(data.speed || '0')
        };
      })
    );

    res.json({
      success: true,
      data: {
        activeTrips,
        stats: {
          connectedDrivers: keys.length, // Simplified proxy for now
          activeBuses: keys.length, // Simplified proxy for now
          redisKeys: keys.length
        }
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
