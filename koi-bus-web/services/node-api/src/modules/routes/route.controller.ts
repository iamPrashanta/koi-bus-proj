import { Request, Response, NextFunction } from 'express';
import { routeService } from './route.service';
import { routeValidator } from './route.validator';

export class RouteController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const routes = await routeService.getAllRoutes();
      res.json({ success: true, data: routes });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = routeValidator.getRouteParams.parse(req);
      const route = await routeService.getRouteById(params.id);
      res.json({ success: true, data: route });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = routeValidator.createRoute.parse(req);
      const route = await routeService.createRoute(body);
      res.status(201).json({ success: true, data: route });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { params, body } = routeValidator.updateRoute.parse(req);
      const route = await routeService.updateRoute(params.id, body);
      res.json({ success: true, data: route });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { params } = routeValidator.getRouteParams.parse(req);
      await routeService.deleteRoute(params.id);
      res.json({ success: true, message: 'Route deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export const routeController = new RouteController();
