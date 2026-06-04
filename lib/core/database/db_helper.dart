import 'dart:io';
import 'dart:typed_data';
import 'package:flutter/services.dart' show rootBundle;
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

class DatabaseHelper {
  static const _databaseName = "koibus.db";
  static const _databaseVersion = 2; // Incremented for new schema

  DatabaseHelper._privateConstructor();
  static final DatabaseHelper instance = DatabaseHelper._privateConstructor();

  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final databasesPath = await getDatabasesPath();
    final path = join(databasesPath, _databaseName);

    // Check if the database exists
    final exists = await databaseExists(path);

    if (!exists) {
      // Should happen only the first time you launch your application
      print("Creating new copy from asset");

      // Make sure the parent directory exists
      try {
        await Directory(dirname(path)).create(recursive: true);
      } catch (_) {}
        
      // Copy from asset
      ByteData data = await rootBundle.load(join("assets/data", _databaseName));
      List<int> bytes = data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);
      
      // Write and flush the bytes written
      await File(path).writeAsBytes(bytes, flush: true);
    } else {
      print("Opening existing database");
    }

    // Open the database
    return await openDatabase(
      path,
      version: _databaseVersion,
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          // Force override on upgrade
          await db.close();
          await deleteDatabase(path);
          ByteData data = await rootBundle.load(join("assets/data", _databaseName));
          List<int> bytes = data.buffer.asUint8List(data.offsetInBytes, data.lengthInBytes);
          await File(path).writeAsBytes(bytes, flush: true);
        }
      }
    );
  }

  Future<List<Map<String, dynamic>>> getAllStopsByZone(String zone) async {
    final db = await database;
    return await db.query('stops', orderBy: 'name ASC');
  }

  Future<List<Map<String, dynamic>>> searchStops(String query) async {
    final db = await database;
    if (query.isEmpty) return [];
    
    // Using FTS5
    return await db.rawQuery(
      'SELECT id, name, lat, lng FROM stops_fts WHERE name MATCH ? ORDER BY rank',
      ['$query*']
    );
  }

  Future<List<Map<String, dynamic>>> getNearbyStops(double userLat, double userLng, {double maxDistanceMeters = 2000}) async {
    final db = await database;
    final allStops = await db.query('stops');
    
    List<Map<String, dynamic>> nearby = [];
    
    for (var stop in allStops) {
      if (stop['lat'] != null && stop['lng'] != null) {
        final stopLat = stop['lat'] as double;
        final stopLng = stop['lng'] as double;
        
        // Very rough bounding box approximation to avoid calculating Haversine for everything
        // 1 degree latitude ~ 111 km. 2km is ~0.018 degrees.
        final latDiff = (stopLat - userLat).abs();
        final lngDiff = (stopLng - userLng).abs();
        
        if (latDiff < 0.02 && lngDiff < 0.02) {
           nearby.add(stop);
        }
      }
    }
    
    // The actual distance sorting will be done in the UI layer using Geolocator.distanceBetween
    return nearby;
  }
}
