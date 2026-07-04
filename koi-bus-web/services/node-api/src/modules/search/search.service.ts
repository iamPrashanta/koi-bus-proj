import { prisma } from '../../config/prisma';
import { SearchResult } from './search.types';

export class SearchService {
  async findDirectRoute(fromName: string, toName: string): Promise<SearchResult[]> {
    // 1. Find the stops by name
    const fromStop = await prisma.stop.findFirst({ where: { name: fromName } });
    const toStop = await prisma.stop.findFirst({ where: { name: toName } });

    if (!fromStop || !toStop) {
      throw new Error('Stop not found');
    }

    // 2. Find route versions that contain both stops
    const fromRouteStops = await prisma.routeStop.findMany({
      where: { stopId: fromStop.id },
      include: {
        routeVersion: {
          include: { route: true }
        }
      }
    });

    const toRouteStops = await prisma.routeStop.findMany({
      where: { stopId: toStop.id }
    });

    const results: SearchResult[] = [];

    for (const fromRS of fromRouteStops) {
      const toRS = toRouteStops.find((rs: any) => rs.routeVersionId === fromRS.routeVersionId);

      // Check if both exist on the same route version, AND from comes before to
      if (toRS && fromRS.sequence < toRS.sequence) {
        // Calculate approximate distance between these stops using distanceKm from the routeStop segments
        const segments = await prisma.routeStop.findMany({
          where: {
            routeVersionId: fromRS.routeVersionId,
            sequence: {
              gte: fromRS.sequence,
              lte: toRS.sequence
            }
          },
          include: { stop: true },
          orderBy: { sequence: 'asc' }
        });

        let totalDistance = 0;
        const stopsList = segments.map((seg: any, index: number) => {
          if (index > 0) {
            totalDistance += seg.distanceKm;
          }
          return seg.stop.name;
        });

        results.push({
          routeId: fromRS.routeVersion.route.id,
          routeCode: fromRS.routeVersion.route.code,
          stops: stopsList,
          distanceKm: Number(totalDistance.toFixed(2))
        });
      }
    }

    // Returning multiple viable direct routes
    return results;
  }
}

export const searchService = new SearchService();
