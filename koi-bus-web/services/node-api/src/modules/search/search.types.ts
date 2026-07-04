export interface SearchQuery {
  from: string;
  to: string;
}

export interface SearchResult {
  routeId: number;
  routeCode: string;
  stops: string[];
  distanceKm: number;
}
