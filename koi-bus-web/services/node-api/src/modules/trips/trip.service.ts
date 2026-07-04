import { tripRepository } from './trip.repository';
import { Prisma, TripStatus } from '@prisma/client';

export class TripService {
  async getAllTrips() {
    return tripRepository.findAll();
  }

  async getTripById(id: number) {
    const trip = await tripRepository.findById(id);
    if (!trip) {
      throw new Error('Trip not found');
    }
    return trip;
  }

  async createTrip(data: any) {
    return tripRepository.create({
      startTime: data.startTime,
      endTime: data.endTime,
      busType: data.busType,
      route: { connect: { id: data.routeId } }
    });
  }

  async updateTrip(id: number, data: any) {
    await this.getTripById(id);
    const updateData: any = { ...data };
    if (data.routeId) {
      updateData.route = { connect: { id: data.routeId } };
      delete updateData.routeId;
    }
    return tripRepository.update(id, updateData);
  }

  async updateTripStatus(id: number, status: TripStatus) {
    await this.getTripById(id);
    return tripRepository.update(id, { status });
  }

  async getTripHistory(id: number) {
    await this.getTripById(id);
    // Use raw prisma for now as it's not in the repository yet
    const { prisma } = require('../../config/prisma');
    return prisma.tripLocation.findMany({
      where: { tripId: id },
      orderBy: { capturedAt: 'asc' }
    });
  }

  async deleteTrip(id: number) {
    await this.getTripById(id);
    return tripRepository.delete(id);
  }
}

export const tripService = new TripService();
