import '../db_helper.dart';

class MetadataRepository {
  Future<Map<String, dynamic>?> getMetadata() async {
    final db = await DatabaseHelper.instance.database;
    final result = await db.query('metadata', limit: 1);
    if (result.isNotEmpty) {
      return result.first;
    }
    return null;
  }
}
