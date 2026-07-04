import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api/api_client.dart';
import '../core/api/socket_service.dart';

class AuthState {
  final bool isLoading;
  final Map<String, dynamic>? user;
  final String? error;

  AuthState({this.isLoading = false, this.user, this.error});

  AuthState copyWith({bool? isLoading, Map<String, dynamic>? user, String? error, bool clearError = false}) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      user: user ?? this.user,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState()) {
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    state = state.copyWith(isLoading: true);
    final token = await ApiClient.instance.getToken();
    if (token == null) {
      state = state.copyWith(isLoading: false);
      return;
    }

    try {
      final res = await ApiClient.instance.get('/auth/me');
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        state = state.copyWith(isLoading: false, user: data['data'], clearError: true);
        SocketService.instance.connect();
      } else {
        await ApiClient.instance.clearToken();
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false);
    }
  }

  Future<bool> login(String phone, String password) async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final res = await ApiClient.instance.post('/auth/login', body: {
        'phone': phone,
        'password': password,
      });

      final data = jsonDecode(res.body);
      
      if (res.statusCode == 200 && data['success']) {
        await ApiClient.instance.setToken(data['accessToken']);
        state = state.copyWith(isLoading: false, user: data['user']);
        SocketService.instance.connect();
        return true;
      } else {
        state = state.copyWith(isLoading: false, error: data['error'] ?? 'Login failed');
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Network error occurred');
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await ApiClient.instance.post('/auth/logout');
    } catch (_) {}
    
    await ApiClient.instance.clearToken();
    SocketService.instance.disconnect();
    state = AuthState();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});
