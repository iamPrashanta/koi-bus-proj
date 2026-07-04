import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_config.dart';

class ApiClient {
  static final ApiClient instance = ApiClient._init();
  final _storage = const FlutterSecureStorage();
  
  ApiClient._init();

  Future<String?> getToken() async {
    return await _storage.read(key: 'access_token');
  }

  Future<void> setToken(String token) async {
    await _storage.write(key: 'access_token', value: token);
  }

  Future<void> clearToken() async {
    await _storage.delete(key: 'access_token');
  }

  Map<String, String> _buildHeaders(String? token) {
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  Future<http.Response> get(String endpoint) async {
    final token = await getToken();
    return http.get(
      Uri.parse('${ApiConfig.apiUrl}$endpoint'),
      headers: _buildHeaders(token),
    );
  }

  Future<http.Response> post(String endpoint, {Map<String, dynamic>? body}) async {
    final token = await getToken();
    return http.post(
      Uri.parse('${ApiConfig.apiUrl}$endpoint'),
      headers: _buildHeaders(token),
      body: body != null ? jsonEncode(body) : null,
    );
  }
}
