import { RoutingStrategy, RouteResult } from '../engine/routing-engine';

export class DijkstraStrategy implements RoutingStrategy {
  async findRoute(sourceStopId: number, destinationStopId: number): Promise<RouteResult> {
    // Future Dijkstra implementation using StopConnection graph edges
    return {
      routeIds: [],
      stops: [],
      totalDistanceMeters: 0,
      totalEstimatedMinutes: 0,
      totalFare: 0
    };
  }
}
