export interface RouteResult {
  routeIds: number[];
  stops: string[];
  totalDistanceMeters: number;
  totalEstimatedMinutes: number;
  totalFare: number;
  transfers?: number;
  score?: number;
}

export interface RoutingStrategy {
  findRoute(sourceStopId: number, destinationStopId: number): Promise<RouteResult>;
}

export class RoutingEngine {
  private strategy: RoutingStrategy;

  constructor(strategy: RoutingStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: RoutingStrategy) {
    this.strategy = strategy;
  }

  async executeStrategy(sourceStopId: number, destinationStopId: number): Promise<RouteResult> {
    return this.strategy.findRoute(sourceStopId, destinationStopId);
  }
}
