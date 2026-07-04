import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../core/api/socket_service.dart';
import '../../core/api/api_config.dart';
import '../../core/api/cached_tile_provider.dart';

class LiveMapScreen extends StatefulWidget {
  const LiveMapScreen({Key? key}) : super(key: key);

  @override
  State<LiveMapScreen> createState() => _LiveMapScreenState();
}

class _LiveMapScreenState extends State<LiveMapScreen> {
  final Map<String, Map<String, dynamic>> _liveBuses = {};

  @override
  void initState() {
    super.initState();
    SocketService.instance.onLocationUpdate((data) {
      if (!mounted) return;
      setState(() {
        final busId = data['busId']?.toString() ?? 'Unknown';
        _liveBuses[busId] = data;
      });
    });
  }

  @override
  void dispose() {
    SocketService.instance.offLocationUpdate();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Live Buses Map')),
      body: FlutterMap(
        options: MapOptions(
          initialCenter: const LatLng(23.5, 87.5), // Center on West Bengal
          initialZoom: 9.0,
        ),
        children: [
          TileLayer(
            // Point to the Node.js API tile server
            urlTemplate: '${ApiConfig.baseUrl}/api/maps/tiles/{z}/{x}/{y}.png',
            userAgentPackageName: 'com.antigravity.koibus',
            tileProvider: CachedTileProvider(),
          ),
          MarkerLayer(
            markers: _liveBuses.values.map((busData) {
              final lat = busData['lat'] as double?;
              final lng = busData['lng'] as double?;
              if (lat == null || lng == null) return null;

              return Marker(
                point: LatLng(lat, lng),
                width: 40,
                height: 40,
                child: const Icon(
                  Icons.directions_bus,
                  color: Colors.blue,
                  size: 32,
                ),
              );
            }).whereType<Marker>().toList(),
          ),
        ],
      ),
    );
  }
}
