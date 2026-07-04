# Architecture Audit

## Goal
Validate if Koi Bus can support:
- 5,000 stops
- 500 routes
- 50,000 graph edges

## Current State Analysis
With the recent V2 schema enhancements, the system has transitioned from a sequential lookup mechanism (filtering by `RouteStop`) to a true Graph mechanism driven by the `StopConnection` model.

### Can it support 50,000 edges without redesign?
**Yes.** PostgreSQL can effortlessly query millions of rows in indexed joins. The addition of compound indexes:
```prisma
@@index([fromStopId])
@@index([toStopId])
@@index([fromStopId, toStopId])
@@index([routeId])
```
Ensures that looking up neighbors from any node operates in `O(log N)` time. Pathfinding algorithms like Dijkstra and A* can load subsets of the graph dynamically without causing memory bottlenecks.

## ER Diagram (Text Representation)

```text
Operator (1) --- (M) Route (1) --- (M) Trip
                       |
                      (M)
                       |
                 RouteVersion (1) --- (M) RouteStop (M) --- (1) Stop
                                                                  |
                                                                 (M)
                  [Graph Edges] <---------------------------------+
                  StopConnection (fromStop, toStop)
```

## Weaknesses Addressed
1. **Bidirectional Collisions**: A bus going from Stop A to Stop B might not go back from B to A on the same physical road. We added `direction (FORWARD/REVERSE)`.
2. **Transfer Logic Flaws**: We explicitly model transfers as physical edges via `isTransferEdge` (now using `EdgeType.TRANSFER`).
3. **Ranking Deficiencies**: Added `ServiceType (LOCAL/EXPRESS)` to ensure accurate route scoring.
