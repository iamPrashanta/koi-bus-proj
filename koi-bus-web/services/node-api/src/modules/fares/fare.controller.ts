import { Request, Response, NextFunction } from 'express';
import { fareService } from './fare.service';
import { fareValidator } from './fare.validator';

export class FareController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const fares = await fareService.getAllFares();
      res.json({ success: true, data: fares });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = fareValidator.getFareParams.parse(req);
      const fare = await fareService.getFareById(params.id);
      res.json({ success: true, data: fare });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = fareValidator.createFare.parse(req);
      const fare = await fareService.createFare(body);
      res.status(201).json({ success: true, data: fare });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { params, body } = fareValidator.updateFare.parse(req);
      const fare = await fareService.updateFare(params.id, body);
      res.json({ success: true, data: fare });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = fareValidator.getFareParams.parse(req);
      await fareService.deleteFare(params.id);
      res.json({ success: true, message: 'Fare deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const fareController = new FareController();
