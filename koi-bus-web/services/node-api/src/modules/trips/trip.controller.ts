import { Request, Response, NextFunction } from 'express';
import { tripService } from './trip.service';
import { tripValidator } from './trip.validator';

export class TripController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const trips = await tripService.getAllTrips();
      res.json({ success: true, data: trips });
    } catch (error) {
      next(error);
    }
  }

  async getActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { prisma } = require('../../config/prisma');
      const activeTrips = await prisma.trip.findMany({
        where: { status: 'ONGOING' },
        include: { route: true }
      });
      res.json({ success: true, data: activeTrips });
    } catch (error) {
      next(error);
    }
  }

  async getActiveBuses(req: Request, res: Response, next: NextFunction) {
    try {
      const { prisma } = require('../../config/prisma');
      const assignments = await prisma.tripAssignment.findMany({
        where: { isActive: true, trip: { status: 'ONGOING' }, bus: { isNot: null } },
        include: { bus: true, trip: true }
      });
      
      const buses = assignments.map((a: any) => ({
        ...a.bus,
        trip: a.trip
      }));
      res.json({ success: true, data: buses });
    } catch (error) {
      next(error);
    }
  }

  async getDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const { prisma } = require('../../config/prisma');
      
      const trip = await prisma.trip.findUnique({
        where: { id },
        include: { route: true }
      });

      if (!trip) return res.status(404).json({ error: 'Trip not found' });

      const assignment = await prisma.tripAssignment.findFirst({
        where: { tripId: id, isActive: true },
        include: { driver: true, bus: true, device: true }
      });

      const { redisClient } = require('../../config/redis');
      const latestLocation = await redisClient.hGetAll(`trip:active:${id}`);

      res.json({
        success: true,
        data: {
          trip,
          route: trip.route,
          assignment,
          driver: assignment?.driver || null,
          bus: assignment?.bus || null,
          device: assignment?.device || null,
          latestLocation: Object.keys(latestLocation).length > 0 ? latestLocation : null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = tripValidator.getTripParams.parse(req);
      const trip = await tripService.getTripById(params.id);
      res.json({ success: true, data: trip });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = tripValidator.createTrip.parse(req);
      const trip = await tripService.createTrip(body);
      res.status(201).json({ success: true, data: trip });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { params, body } = tripValidator.updateTrip.parse(req);
      const trip = await tripService.updateTrip(params.id, body);
      res.json({ success: true, data: trip });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = tripValidator.getTripParams.parse(req);
      await tripService.deleteTrip(params.id);
      res.json({ success: true, message: 'Trip deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  async start(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const trip = await tripService.updateTripStatus(id, 'ONGOING');
      
      const { prisma } = require('../../config/prisma');
      const session = await prisma.activeTripSession.create({
        data: {
          tripId: id,
          status: 'ONGOING'
        }
      });
      
      const io = req.app.get('io');
      if (io) {
        io.emit('trip:started', { version: 1, tripId: id, timestamp: new Date().toISOString(), sessionUuid: session.sessionUuid });
      }
      
      res.json({ success: true, data: trip, session });
    } catch (error) {
      next(error);
    }
  }

  async pause(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const trip = await tripService.updateTripStatus(id, 'SCHEDULED');
      
      const { prisma } = require('../../config/prisma');
      const session = await prisma.activeTripSession.findFirst({ where: { tripId: id, status: 'ONGOING' }, orderBy: { id: 'desc' } });
      if (session) {
        await prisma.activeTripSession.update({ where: { id: session.id }, data: { status: 'SCHEDULED' } });
      }

      const io = req.app.get('io');
      if (io) {
        io.emit('trip:paused', { version: 1, tripId: id, timestamp: new Date().toISOString() });
      }
      
      res.json({ success: true, data: trip });
    } catch (error) {
      next(error);
    }
  }

  async resume(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const trip = await tripService.updateTripStatus(id, 'ONGOING');
      
      const { prisma } = require('../../config/prisma');
      const session = await prisma.activeTripSession.findFirst({ where: { tripId: id, status: 'SCHEDULED' }, orderBy: { id: 'desc' } });
      if (session) {
        await prisma.activeTripSession.update({ where: { id: session.id }, data: { status: 'ONGOING' } });
      }

      const io = req.app.get('io');
      if (io) {
        io.emit('trip:resumed', { version: 1, tripId: id, timestamp: new Date().toISOString() });
      }

      res.json({ success: true, data: trip });
    } catch (error) {
      next(error);
    }
  }

  async end(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const trip = await tripService.updateTripStatus(id, 'COMPLETED');
      
      const { prisma } = require('../../config/prisma');
      const session = await prisma.activeTripSession.findFirst({ where: { tripId: id, status: 'ONGOING' }, orderBy: { id: 'desc' } });
      if (session) {
        await prisma.activeTripSession.update({ where: { id: session.id }, data: { status: 'COMPLETED', endTime: new Date() } });
      }

      // Cleanup Redis
      const { redisClient } = require('../../config/redis');
      await redisClient.del(`trip:active:${id}`);
      await redisClient.zRem('buses:geo:active', id.toString());
      
      const io = req.app.get('io');
      if (io) {
        io.emit('trip:ended', { version: 1, tripId: id, timestamp: new Date().toISOString() });
      }

      res.json({ success: true, data: trip });
    } catch (error) {
      next(error);
    }
  }

  async live(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const { redisClient } = require('../../config/redis');
      const data = await redisClient.hGetAll(`trip:active:${id}`);
      if (!data || Object.keys(data).length === 0) {
        return res.status(404).json({ success: false, error: 'Live data not found' });
      }
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async replay(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id as string);
      const sessionId = req.query.sessionId as string;
      
      const { prisma } = require('../../config/prisma');
      let history = [];

      if (sessionId) {
        const session = await prisma.activeTripSession.findUnique({ where: { sessionUuid: sessionId } });
        if (!session) {
          return res.status(404).json({ success: false, error: 'Session not found' });
        }
        history = await prisma.tripLocation.findMany({
          where: { tripId: id, sessionId: session.id },
          orderBy: { capturedAt: 'asc' }
        });
      } else {
        history = await tripService.getTripHistory(id);
      }

      // Map BigInt to string so JSON.stringify doesn't fail
      const mapped = history.map((h: any) => ({
        ...h,
        id: h.id.toString()
      }));
      res.json({ success: true, data: mapped });
    } catch (error) {
      next(error);
    }
  }
}

export const tripController = new TripController();
