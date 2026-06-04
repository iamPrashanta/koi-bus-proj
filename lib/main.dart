import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'app.dart';
import 'core/database/db_helper.dart';

void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  
  try {
    // Initialize Hive
    await Hive.initFlutter();
    await Hive.openBox('saved_routes');
    
    // Initialize SQLite and seed data
    await DatabaseHelper.instance.database;
  } catch (e) {
    debugPrint('Initialization error: $e');
  }

  FlutterNativeSplash.remove();

  runApp(
    const ProviderScope(
      child: KoiBusApp(),
    ),
  );
}
