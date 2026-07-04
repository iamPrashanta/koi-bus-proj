import { routeRepository } from './route.repository';
import { Prisma } from '@prisma/client';

export class RouteService {
  async getAllRoutes() {
    return routeRepository.findAll();
  }

  async getRouteById(id: number) {
    const route = await routeRepository.findById(id);
    if (!route) {
      throw new Error('Route not found');
    }
    return route;
  }

  async createRoute(data: Prisma.RouteUncheckedCreateInput) {
    // Check if code exists
    return routeRepository.create(data);
  }

  async updateRoute(id: number, data: Prisma.RouteUncheckedUpdateInput) {
    await this.getRouteById(id);
    return routeRepository.update(id, data);
  }

  async deleteRoute(id: number) {
    await this.getRouteById(id);
    return routeRepository.delete(id);
  }
}

export const routeService = new RouteService();
