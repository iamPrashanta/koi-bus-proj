import { Request, Response, NextFunction } from 'express';
import { RoutingEngine } from './engine/routing-engine';
import { DirectRouteStrategy } from './strategies/direct-route.strategy';
import { TransferRouteStrategy } from './strategies/transfer-route.strategy';
import { routeRankingService } from './route-ranking.service';
import { searchValidator } from './search.validator';
import { prisma } from '../../config/prisma';

export class SearchController {
  async searchRoutes(req: Request, res: Response, next: NextFunction) {
    try {
      const { from, to } = req.query as any;
      if (!from || !to) throw new Error('From and To stops required');

      const fromStop = await prisma.stop.findFirst({ where: { name: from } });
      const toStop = await prisma.stop.findFirst({ where: { name: to } });

      if (!fromStop || !toStop) throw new Error('Stop not found');

      const engine = new RoutingEngine(new DirectRouteStrategy());
      const routes = [];

      // Try Direct
      try {
        const directRoute = await engine.executeStrategy(fromStop.id, toStop.id);
        directRoute.transfers = 0;
        routes.push(directRoute);
      } catch (e) {}

      // Try 1-Transfer
      try {
        engine.setStrategy(new TransferRouteStrategy());
        const transferRoute = await engine.executeStrategy(fromStop.id, toStop.id);
        routes.push(transferRoute);
      } catch (e) {}

      const rankedRoutes = routeRankingService.rankRoutes(routes);

      return res.json({
        success: true,
        data: rankedRoutes
      });
    } catch (error) {
      next(error);
    }
  }

  async searchNearbyBuses(req: Request, res: Response, next: NextFunction) {
    try {
      const { lat, lng, radius } = req.query as any;
      
      if (!lat || !lng) {
        return res.status(400).json({ error: 'Latitude and Longitude required' });
      }

      const searchRadius = parseFloat(radius) || 5; // Default 5 km
      
      // We need to import redisClient. Since it's in config, we can import it at the top of the file.
      // But we will inline the require to avoid changing lines 1-8 if possible, or add it safely.
      const { redisClient } = require('../../config/redis');

      // Use Redis GEOSEARCH
      const nearbyBusIds = await redisClient.geoSearch(
        'buses:geo:active',
        { latitude: parseFloat(lat), longitude: parseFloat(lng) },
        { radius: searchRadius, unit: 'km' }
      );

      // Fetch the details from Redis Hashes
      const buses = [];
      for (const tripId of nearbyBusIds) {
        const tripData = await redisClient.hGetAll(`trip:active:${tripId}`);
        if (tripData) {
          buses.push({
            tripId,
            ...tripData
          });
        }
      }

      return res.json({
        success: true,
        data: buses
      });
    } catch (error) {
      next(error);
    }
  }
}

export const searchController = new SearchController();
