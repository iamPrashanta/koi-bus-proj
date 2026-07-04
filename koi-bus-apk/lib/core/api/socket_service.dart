import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:flutter/foundation.dart';
import 'api_config.dart';

class SocketService {
  static final SocketService instance = SocketService._init();
  io.Socket? _socket;
  
  SocketService._init();

  void connect() {
    if (_socket != null && _socket!.connected) return;

    _socket = io.io(ApiConfig.socketUrl, io.OptionBuilder()
      .setTransports(['websocket'])
      .disableAutoConnect()
      .build()
    );

    _socket!.onConnect((_) {
      debugPrint('Socket connected: ${_socket!.id}');
    });

    _socket!.onDisconnect((_) {
      debugPrint('Socket disconnected');
    });

    _socket!.connect();
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }

  void onLocationUpdate(Function(Map<String, dynamic>) callback) {
    _socket?.on('location:update', (data) => callback(data as Map<String, dynamic>));
  }

  void offLocationUpdate() {
    _socket?.off('location:update');
  }
}
