import { Router, Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { redisClient } from '../../config/redis';

export const healthRoutes = Router();

healthRoutes.get('/system/health', async (req: Request, res: Response) => {
  const health: any = {};
  
  // DB Check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.database = { status: 'healthy', latencyMs: Date.now() - dbStart };
  } catch (err) {
    health.database = { status: 'unhealthy', latencyMs: -1 };
  }

  // Redis Check
  try {
    const redisStart = Date.now();
    await redisClient.ping();
    health.redis = { status: 'healthy', latencyMs: Date.now() - redisStart };
  } catch (err) {
    health.redis = { status: 'unhealthy', latencyMs: -1 };
  }

  // Socket.io check (simplistic)
  try {
    const io = req.app.get('io');
    health.websocket = { status: io ? 'healthy' : 'unhealthy' };
  } catch (err) {
    health.websocket = { status: 'unhealthy' };
  }

  res.json(health);
});

healthRoutes.get('/simulator/status', async (req: Request, res: Response) => {
  try {
    const data = await redisClient.get('simulator:status');
    if (data) {
      res.json(JSON.parse(data));
    } else {
      res.json({ running: false, tripId: null, pointsProcessed: 0 });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to check simulator status' });
  }
});
