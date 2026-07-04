import '../db_helper.dart';

class StopRepository {
  Future<List<Map<String, dynamic>>> searchStops(String query) async {
    final db = await DatabaseHelper.instance.database;
    if (query.isEmpty) return [];

    // FTS5 query
    final result = await db.rawQuery('''
      SELECT s.id, s.name, s.district, s.lat, s.lng 
      FROM stops_fts f 
      JOIN stops s ON f.id = s.id 
      WHERE f.name MATCH ?
      ORDER BY rank
      LIMIT 20
    ''', ['$query*']);

    return result;
  }

  Future<Map<String, dynamic>?> getStopDetails(String stopId) async {
    final db = await DatabaseHelper.instance.database;
    final result = await db.query('stops', where: 'id = ?', whereArgs: [stopId]);
    if (result.isNotEmpty) {
      return result.first;
    }
    return null;
  }
}
