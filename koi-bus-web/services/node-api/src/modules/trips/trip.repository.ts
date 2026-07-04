import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export class TripRepository {
  async findAll() {
    return prisma.trip.findMany();
  }

  async findById(id: number) {
    return prisma.trip.findUnique({
      where: { id },
      include: { route: true }
    });
  }

  async create(data: Prisma.TripCreateInput) {
    return prisma.trip.create({ data });
  }

  async update(id: number, data: Prisma.TripUpdateInput) {
    return prisma.trip.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return prisma.trip.delete({ where: { id } });
  }
}

export const tripRepository = new TripRepository();
