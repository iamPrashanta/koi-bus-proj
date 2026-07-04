import { fareRepository } from './fare.repository';
import { Prisma } from '@prisma/client';

export class FareService {
  async getAllFares() {
    return fareRepository.findAll();
  }

  async getFareById(id: number) {
    const fare = await fareRepository.findById(id);
    if (!fare) {
      throw new Error('Fare not found');
    }
    return fare;
  }

  async createFare(data: Prisma.FareCreateInput) {
    return fareRepository.create(data);
  }

  async updateFare(id: number, data: Prisma.FareUpdateInput) {
    await this.getFareById(id);
    return fareRepository.update(id, data);
  }

  async deleteFare(id: number) {
    await this.getFareById(id);
    return fareRepository.delete(id);
  }
}

export const fareService = new FareService();
