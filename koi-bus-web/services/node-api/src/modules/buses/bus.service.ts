import { busRepository } from './bus.repository';
import { Prisma } from '@prisma/client';

export class BusService {
  async getAllBuses() {
    return busRepository.findAll();
  }

  async getBusById(id: number) {
    const bus = await busRepository.findById(id);
    if (!bus) {
      throw new Error('Bus not found');
    }
    return bus;
  }

  async createBus(data: any) {
    return busRepository.create({
      registrationNumber: data.registrationNumber,
      route: { connect: { id: data.routeId } }
    });
  }

  async updateBus(id: number, data: any) {
    await this.getBusById(id);
    const updateData: any = {};
    if (data.registrationNumber) updateData.registrationNumber = data.registrationNumber;
    if (data.routeId) updateData.route = { connect: { id: data.routeId } };
    
    return busRepository.update(id, updateData);
  }

  async deleteBus(id: number) {
    await this.getBusById(id);
    return busRepository.delete(id);
  }

}

export const busService = new BusService();
