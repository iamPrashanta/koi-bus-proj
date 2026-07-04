import { Request, Response, NextFunction } from 'express';
import { busService } from './bus.service';
import { busValidator } from './bus.validator';

export class BusController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const buses = await busService.getAllBuses();
      res.json({ success: true, data: buses });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = busValidator.getBusParams.parse(req);
      const bus = await busService.getBusById(params.id);
      res.json({ success: true, data: bus });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = busValidator.createBus.parse(req);
      const bus = await busService.createBus(body);
      res.status(201).json({ success: true, data: bus });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { params, body } = busValidator.updateBus.parse(req);
      const bus = await busService.updateBus(params.id, body);
      res.json({ success: true, data: bus });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = busValidator.getBusParams.parse(req);
      await busService.deleteBus(params.id);
      res.json({ success: true, message: 'Bus deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

}

export const busController = new BusController();
