import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export class BusRepository {
  async findAll() {
    return prisma.bus.findMany({ include: { route: true } });
  }

  async findById(id: number) {
    return prisma.bus.findUnique({
      where: { id },
      include: { route: true }
    });
  }

  async create(data: Prisma.BusCreateInput) {
    return prisma.bus.create({ data });
  }

  async update(id: number, data: Prisma.BusUpdateInput) {
    return prisma.bus.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return prisma.bus.delete({ where: { id } });
  }
}

export const busRepository = new BusRepository();
