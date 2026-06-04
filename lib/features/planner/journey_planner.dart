import 'dart:collection';
import 'package:collection/collection.dart';
import '../../core/database/db_helper.dart';

enum JourneyMode {
  fastest,
  fewestChanges,
  cheapest,
}

class JourneyState {
  final String stopId;
  final String? routeId; // null if we are just starting and haven't boarded
  final double cost;
  final JourneyState? previous;
  
  // Accumulated metrics for cheapest/fastest ties
  final double totalTime;
  final int transfers;
  final double fare;

  JourneyState({
    required this.stopId,
    required this.routeId,
    required this.cost,
    required this.previous,
    required this.totalTime,
    required this.transfers,
    required this.fare,
  });
}

class JourneyPlanner {
  final DatabaseHelper db;
  JourneyPlanner(this.db);

  Future<List<Map<String, dynamic>>> findJourney(String fromStopId, String toStopId, {JourneyMode mode = JourneyMode.fastest}) async {
    final database = await db.database;

    // Load adjacent edges
    final edges = await database.rawQuery('''
      SELECT r1.stop_id as from_stop, r2.stop_id as to_stop, r1.route_id, 
             (r2.typical_duration_mins - r1.typical_duration_mins) as duration 
      FROM route_stops r1
      JOIN route_stops r2 ON r1.route_id = r2.route_id AND r2.sequence = r1.sequence + 1
    ''');

    // Load fares mapping
    final faresQuery = await database.rawQuery('SELECT route_id, fare FROM fares');
    final Map<String, double> routeFares = {};
    for (var f in faresQuery) {
      // Simplification: flat fare per route if specific stop pairs aren't found
      routeFares[f['route_id'] as String] = (f['fare'] as num).toDouble();
    }

    // graph[stopId] = list of {to, route, duration}
    Map<String, List<Map<String, dynamic>>> graph = {};
    for (var edge in edges) {
      final from = edge['from_stop'] as String;
      graph.putIfAbsent(from, () => []);
      graph[from]!.add({
        'to': edge['to_stop'],
        'route': edge['route_id'],
        'duration': (edge['duration'] as num).toDouble(),
      });
    }

    // Dijkstra Priority Queue
    PriorityQueue<JourneyState> pq = PriorityQueue((a, b) => a.cost.compareTo(b.cost));
    Map<String, double> bestCost = {}; // Key: "stopId_routeId"

    pq.add(JourneyState(
      stopId: fromStopId, 
      routeId: null, 
      cost: 0, 
      previous: null, 
      totalTime: 0, 
      transfers: 0, 
      fare: 0
    ));

    JourneyState? finalState;

    while (pq.isNotEmpty) {
      final current = pq.removeFirst();

      if (current.stopId == toStopId) {
        finalState = current;
        break; // found optimal path
      }

      final stateKey = '${current.stopId}_${current.routeId}';
      if (bestCost.containsKey(stateKey) && bestCost[stateKey]! < current.cost) {
        continue;
      }

      if (!graph.containsKey(current.stopId)) continue;

      for (var edge in graph[current.stopId]!) {
        final toStop = edge['to'] as String;
        final route = edge['route'] as String;
        final duration = edge['duration'] as double;

        bool isTransfer = current.routeId != null && current.routeId != route;
        bool isFirstBoarding = current.routeId == null;

        // Base costs
        double waitTime = (isTransfer || isFirstBoarding) ? 10.0 : 0.0;
        double addedFare = (isTransfer || isFirstBoarding) ? (routeFares[route] ?? 15.0) : 0.0;
        
        double edgeCost = 0;
        if (mode == JourneyMode.fastest) {
          edgeCost = duration + waitTime + (isTransfer ? 5.0 : 0.0); // 5 min transfer penalty
        } else if (mode == JourneyMode.fewestChanges) {
          edgeCost = (isTransfer ? 1000.0 : 1.0) + duration * 0.01; // heavily penalize transfers
        } else if (mode == JourneyMode.cheapest) {
          edgeCost = addedFare + duration * 0.1; // Fare is primary, duration is secondary
        }

        double nextCost = current.cost + edgeCost;
        String nextStateKey = '${toStop}_$route';

        if (!bestCost.containsKey(nextStateKey) || nextCost < bestCost[nextStateKey]!) {
          bestCost[nextStateKey] = nextCost;
          pq.add(JourneyState(
            stopId: toStop,
            routeId: route,
            cost: nextCost,
            previous: current,
            totalTime: current.totalTime + duration + waitTime,
            transfers: current.transfers + (isTransfer ? 1 : 0),
            fare: current.fare + addedFare,
          ));
        }
      }
    }

    if (finalState == null) return [];

    // Reconstruct path
    List<JourneyState> path = [];
    JourneyState? curr = finalState;
    while (curr != null) {
      if (curr.routeId != null) { // Skip the start node which has no route
        path.add(curr);
      }
      curr = curr.previous;
    }
    path = path.reversed.toList();

    // Compress into legs
    List<Map<String, dynamic>> legs = [];
    String? currentRoute;
    String? currentLegStart;
    String? currentLegEnd;
    int stopsCount = 0;
    double durationMins = 0;

    // We need to trace back from path.
    // path contains nodes from stop 2 to destination.
    // The very first node's previous stop is the origin.
    
    // Actually, path contains JourneyStates where we arrived AT `stopId` USING `routeId`.
    // So for the first element in path, its `previous.stopId` is the boarding stop.

    for (var i = 0; i < path.length; i++) {
      final step = path[i];
      final prevStopId = step.previous!.stopId;

      if (currentRoute == null) {
        currentRoute = step.routeId;
        currentLegStart = prevStopId;
        currentLegEnd = step.stopId;
        stopsCount = 1;
        durationMins = step.totalTime - step.previous!.totalTime;
      } else if (currentRoute == step.routeId) {
        currentLegEnd = step.stopId;
        stopsCount++;
        durationMins += step.totalTime - step.previous!.totalTime;
      } else {
        legs.add({
          'route_id': currentRoute,
          'from_id': currentLegStart,
          'to_id': currentLegEnd,
          'stops_count': stopsCount,
          'duration_mins': durationMins,
        });

        currentRoute = step.routeId;
        currentLegStart = prevStopId;
        currentLegEnd = step.stopId;
        stopsCount = 1;
        durationMins = step.totalTime - step.previous!.totalTime;
      }
    }

    if (currentRoute != null) {
      legs.add({
        'route_id': currentRoute,
        'from_id': currentLegStart,
        'to_id': currentLegEnd,
        'stops_count': stopsCount,
        'duration_mins': durationMins,
      });
    }

    // Enrich legs
    List<Map<String, dynamic>> enrichedLegs = [];
    for (var leg in legs) {
      final routeDetails = (await database.query('routes', where: 'id = ?', whereArgs: [leg['route_id']])).first;
      final fromDetails = (await database.query('stops', where: 'id = ?', whereArgs: [leg['from_id']])).first;
      final toDetails = (await database.query('stops', where: 'id = ?', whereArgs: [leg['to_id']])).first;
      
      // Determine operator details
      final operatorId = routeDetails['operator_id'] as String;
      final opQuery = await database.query('operators', where: 'id = ?', whereArgs: [operatorId]);
      final opName = opQuery.isNotEmpty ? opQuery.first['name'] as String : 'Unknown';

      enrichedLegs.add({
        'number': routeDetails['number'],
        'operator': opName,
        'type': 'bus',
        'busType': routeDetails['type'],
        'from': fromDetails['name'],
        'to': toDetails['name'],
        'stops': leg['stops_count'],
        'duration': '~${leg['duration_mins'].toInt()} min',
      });
    }

    return enrichedLegs;
  }
}
