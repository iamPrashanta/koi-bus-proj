import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export class StopRepository {
  async findAll() {
    return prisma.stop.findMany();
  }

  async findById(id: number) {
    return prisma.stop.findUnique({
      where: { id },
      include: { 
        connectionsFrom: true,
        connectionsTo: true
      }
    });
  }

  async create(data: Prisma.StopCreateInput) {
    return prisma.stop.create({ data });
  }

  async update(id: number, data: Prisma.StopUpdateInput) {
    return prisma.stop.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return prisma.stop.delete({ where: { id } });
  }
}

export const stopRepository = new StopRepository();
