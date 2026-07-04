import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export class RouteRepository {
  async findAll() {
    return prisma.route.findMany();
  }

  async findById(id: number) {
    return prisma.route.findUnique({
      where: { id },
      include: { versions: true }
    });
  }

  async create(data: Prisma.RouteUncheckedCreateInput) {
    return prisma.route.create({ data });
  }

  async update(id: number, data: Prisma.RouteUncheckedUpdateInput) {
    return prisma.route.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return prisma.route.delete({ where: { id } });
  }
}

export const routeRepository = new RouteRepository();
