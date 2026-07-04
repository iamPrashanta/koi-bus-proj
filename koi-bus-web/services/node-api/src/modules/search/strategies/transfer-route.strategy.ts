import { RoutingStrategy, RouteResult } from '../engine/routing-engine';
import { prisma } from '../../../config/prisma';
import { EdgeType } from '@prisma/client';

export class TransferRouteStrategy implements RoutingStrategy {
  async findRoute(sourceStopId: number, destinationStopId: number): Promise<RouteResult> {
    // A naive 1-transfer search
    const sourceEdges = await prisma.stopConnection.findMany({
      where: { fromStopId: sourceStopId, edgeType: EdgeType.ROUTE },
    });

    const destEdges = await prisma.stopConnection.findMany({
      where: { toStopId: destinationStopId, edgeType: EdgeType.ROUTE },
    });

    for (const sEdge of sourceEdges) {
      for (const dEdge of destEdges) {
        if (sEdge.toStopId === dEdge.fromStopId && sEdge.routeId !== dEdge.routeId) {
          const transferEdge = await prisma.stopConnection.findFirst({
            where: {
              fromStopId: sEdge.toStopId,
              toStopId: dEdge.fromStopId,
              edgeType: EdgeType.TRANSFER,
              fromRouteId: sEdge.routeId,
              toRouteId: dEdge.routeId
            }
          });

          if (transferEdge) {
            return {
              routeIds: [sEdge.routeId!, dEdge.routeId!],
              stops: [],
              totalDistanceMeters: sEdge.distanceMeters + dEdge.distanceMeters + transferEdge.distanceMeters,
              totalEstimatedMinutes: (sEdge.estimatedMinutes || 0) + (dEdge.estimatedMinutes || 0) + (transferEdge.estimatedMinutes || 0),
              totalFare: (sEdge.fareAmount || 0) + (dEdge.fareAmount || 0) + (transferEdge.fareAmount || 0),
              transfers: 1
            };
          }
        }
      }
    }

    throw new Error('No 1-transfer route found');
  }
}
