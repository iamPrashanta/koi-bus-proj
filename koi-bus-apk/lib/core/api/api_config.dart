import 'dart:io';
import 'package:flutter/foundation.dart';

class ApiConfig {
  // Use 10.0.2.2 for Android emulator to access host localhost.
  // Use localhost for iOS simulator.
  // For physical devices, you will need to change this to your computer's local IP address (e.g., 192.168.1.X)
  static String get _host {
    return 'http://192.168.1.5'; // Physical Wi-Fi network IP for testing
  }

  static String get baseUrl => '$_host:4000';
  static String get analyticsUrl => '$_host:8001';
  static String get importerUrl => '$_host:8002';

  static String get apiUrl => '$baseUrl/api';
  static String get socketUrl => baseUrl;
}
