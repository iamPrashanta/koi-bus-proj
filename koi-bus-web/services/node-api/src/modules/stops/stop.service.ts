import { stopRepository } from './stop.repository';
import { Prisma } from '@prisma/client';

export class StopService {
  async getAllStops() {
    return stopRepository.findAll();
  }

  async getStopById(id: number) {
    const stop = await stopRepository.findById(id);
    if (!stop) {
      throw new Error('Stop not found');
    }
    return stop;
  }

  async createStop(data: Prisma.StopCreateInput) {
    return stopRepository.create(data);
  }

  async updateStop(id: number, data: Prisma.StopUpdateInput) {
    await this.getStopById(id);
    return stopRepository.update(id, data);
  }

  async deleteStop(id: number) {
    await this.getStopById(id);
    return stopRepository.delete(id);
  }
}

export const stopService = new StopService();
