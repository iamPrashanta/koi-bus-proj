import { RouteResult } from './engine/routing-engine';

export class RouteRankingService {
  rankRoutes(routes: RouteResult[]): RouteResult[] {
    return routes.sort((a, b) => {
      const scoreA = this.calculateScore(a);
      const scoreB = this.calculateScore(b);
      return scoreA - scoreB; // Lower score is better
    }).map(r => ({ ...r, score: this.calculateScore(r) }));
  }

  private calculateScore(route: RouteResult): number {
    const timeWeight = 1.0;
    const fareWeight = 0.5;
    const transferWeight = 20; // Penalty
    
    return (route.totalEstimatedMinutes * timeWeight) + 
           (route.totalFare * fareWeight) + 
           ((route.transfers || 0) * transferWeight);
  }
}

export const routeRankingService = new RouteRankingService();
