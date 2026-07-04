import { prisma } from '../../config/prisma';
import { Prisma } from '@prisma/client';

export class FareRepository {
  async findAll() {
    return prisma.fare.findMany();
  }

  async findById(id: number) {
    return prisma.fare.findUnique({
      where: { id }
    });
  }

  async create(data: Prisma.FareCreateInput) {
    return prisma.fare.create({ data });
  }

  async update(id: number, data: Prisma.FareUpdateInput) {
    return prisma.fare.update({
      where: { id },
      data
    });
  }

  async delete(id: number) {
    return prisma.fare.delete({ where: { id } });
  }
}

export const fareRepository = new FareRepository();
