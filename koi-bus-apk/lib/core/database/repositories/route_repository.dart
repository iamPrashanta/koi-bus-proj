import '../db_helper.dart';

class RouteRepository {
  Future<List<Map<String, dynamic>>> getAllRoutes() async {
    final db = await DatabaseHelper.instance.database;
    final result = await db.rawQuery('''
      SELECT r.id, r.short_name, r.long_name, o.name as operator_name 
      FROM routes r
      LEFT JOIN operators o ON r.operator_id = o.id
      ORDER BY r.short_name ASC
    ''');
    return result;
  }

  Future<List<Map<String, dynamic>>> getRoutesForStop(String stopId) async {
    final db = await DatabaseHelper.instance.database;
    final result = await db.rawQuery('''
      SELECT r.id, r.short_name, r.long_name, o.name as operator_name
      FROM route_stops rs
      JOIN routes r ON rs.route_id = r.id
      LEFT JOIN operators o ON r.operator_id = o.id
      WHERE rs.stop_id = ?
    ''', [stopId]);
    return result;
  }

  Future<Map<String, dynamic>?> getRouteDetails(String routeId) async {
    final db = await DatabaseHelper.instance.database;
    final routes = await db.rawQuery('''
      SELECT r.id, r.short_name, r.long_name, o.name as operator_name 
      FROM routes r
      LEFT JOIN operators o ON r.operator_id = o.id
      WHERE r.id = ?
    ''', [routeId]);

    if (routes.isEmpty) return null;
    final route = Map<String, dynamic>.from(routes.first);

    // Get stops
    final stops = await db.rawQuery('''
      SELECT s.id, s.name, rs.stop_sequence
      FROM route_stops rs
      JOIN stops s ON rs.stop_id = s.id
      WHERE rs.route_id = ?
      ORDER BY rs.stop_sequence ASC
    ''', [routeId]);

    route['stops'] = stops;
    return route;
  }

  Future<List<Map<String, dynamic>>> getDirectRoutes(String fromStopId, String toStopId) async {
    final db = await DatabaseHelper.instance.database;
    final result = await db.rawQuery('''
      SELECT r.id, r.short_name, r.long_name
      FROM route_stops rs1
      JOIN route_stops rs2 ON rs1.route_id = rs2.route_id
      JOIN routes r ON r.id = rs1.route_id
      WHERE rs1.stop_id = ? AND rs2.stop_id = ?
      AND rs1.stop_sequence < rs2.stop_sequence
    ''', [fromStopId, toStopId]);
    return result;
  }
}
