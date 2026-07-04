import { Request, Response, NextFunction } from 'express';
import { stopService } from './stop.service';
import { stopValidator } from './stop.validator';

export class StopController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const stops = await stopService.getAllStops();
      res.json({ success: true, data: stops });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = stopValidator.getStopParams.parse(req);
      const stop = await stopService.getStopById(params.id);
      res.json({ success: true, data: stop });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = stopValidator.createStop.parse(req);
      const stop = await stopService.createStop(body);
      res.status(201).json({ success: true, data: stop });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { params, body } = stopValidator.updateStop.parse(req);
      const stop = await stopService.updateStop(params.id, body);
      res.json({ success: true, data: stop });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = stopValidator.getStopParams.parse(req);
      await stopService.deleteStop(params.id);
      res.json({ success: true, message: 'Stop deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const stopController = new StopController();
