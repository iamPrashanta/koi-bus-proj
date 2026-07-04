import { RoutingStrategy, RouteResult } from '../engine/routing-engine';
import { prisma } from '../../../config/prisma';

export class DirectRouteStrategy implements RoutingStrategy {
  async findRoute(sourceStopId: number, destinationStopId: number): Promise<RouteResult> {
    const connections = await prisma.stopConnection.findFirst({
      where: {
        fromStopId: sourceStopId,
        toStopId: destinationStopId
      }
    });

    if (!connections) {
      throw new Error('No direct route found');
    }

    return {
      routeIds: connections.routeId ? [connections.routeId] : [],
      stops: [],
      totalDistanceMeters: connections.distanceMeters,
      totalEstimatedMinutes: connections.estimatedMinutes || 0,
      totalFare: connections.fareAmount || 0
    };
  }
}
