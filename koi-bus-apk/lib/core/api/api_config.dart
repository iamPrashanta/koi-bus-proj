import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  // Use 10.0.2.2 for Android emulator to access host localhost.
  // Use localhost for iOS simulator.
  // For physical devices, you will need to change this to your computer's local IP address (e.g., 192.168.1.X)
  static String get _host {
    if (kIsWeb) return 'http://localhost';
    if (Platform.isAndroid) return 'http://10.0.2.2';
    return 'http://localhost';
  }

  static String get baseUrl => '$_host:4000';
  static String get analyticsUrl => '$_host:8001';
  static String get importerUrl => '$_host:8002';

  static String get apiUrl => '$baseUrl/api';
  static String get socketUrl => baseUrl;
}
