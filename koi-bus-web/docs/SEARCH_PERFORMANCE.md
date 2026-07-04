# Search Performance Audit

## Scalability Targets
- 50,000 Edges (StopConnections)
- Sub-200ms API response times.

## Query Bottlenecks Resolved
In V1, search relied on scanning `RouteStop` and comparing sequence numbers in memory or via heavy subqueries.

In V2, the index `@@index([fromStopId, toStopId])` on `StopConnection` allows the `DirectRouteStrategy` to execute a single index-only scan:
```sql
SELECT * FROM "StopConnection" 
WHERE "fromStopId" = X AND "toStopId" = Y AND "edgeType" = 'ROUTE';
```

## Missing Indexes (Fixed)
We explicitly added `@@index([routeId])`. When rendering a route map, we need all edges for a specific route. This index prevents sequential scans of the 50,000 edge table.

## Future Recommendations
As the graph grows to >1M edges (if expanding beyond West Bengal):
- Shift the `RoutingEngine` to use an in-memory graph representation (NetworkX via Python Microservice) triggered asynchronously, while Node.js caches popular route results in Redis.
