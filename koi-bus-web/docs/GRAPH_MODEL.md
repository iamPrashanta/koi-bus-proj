# Graph Model Optimization

The V2 schema shifts heavily toward a directed, weighted graph via the `StopConnection` table.

## Node (Stop)
A physical geographic location.

## Edge (StopConnection)
Connections between stops.

### Edge Types
1. **ROUTE**: `Stop A -> Stop B` along a specific `routeId`. Contains `fareAmount` and `estimatedMinutes`.
2. **TRANSFER**: `Stop A -> Stop A` (or nearby Stop B). Represents getting off `fromRouteId` and waiting for `toRouteId`. Penalized heavily by `transferCost`.
3. **WALKING**: `Stop A -> Stop B`. Represents a pedestrian path between two disparate systems (e.g., Bus Stand to Metro Station).

## Example: Sonamukhi to Salt Lake

**Graph Traversal:**
1. Node: Sonamukhi
2. Edge (ROUTE): Sonamukhi -> Durgapur (Route: NBSTC Central)
3. Node: Durgapur
4. Edge (TRANSFER): Durgapur -> Durgapur (Wait penalty 15 mins)
5. Edge (ROUTE): Durgapur -> ... -> Esplanade (Route: SBSTC South)
6. Node: Esplanade
7. Edge (TRANSFER): Esplanade -> Esplanade (Wait penalty 5 mins)
8. Edge (ROUTE): Esplanade -> Salt Lake (Route: WBTC Metro)
9. Node: Salt Lake

This graph seamlessly integrates into any shortest-path algorithm.
