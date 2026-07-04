import 'package:flutter/material.dart';
import '../../core/api/socket_service.dart';

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
      appBar: AppBar(title: const Text('Live Buses')),
      body: _liveBuses.isEmpty
          ? const Center(
              child: Text(
                'Waiting for live telemetry...',
                style: TextStyle(color: Colors.grey, fontSize: 16),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _liveBuses.length,
              itemBuilder: (context, index) {
                final busId = _liveBuses.keys.elementAt(index);
                final busData = _liveBuses[busId]!;
                
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: const CircleAvatar(
                      backgroundColor: Colors.blue,
                      child: Icon(Icons.directions_bus, color: Colors.white),
                    ),
                    title: Text('Bus $busId'),
                    subtitle: Text(
                        'Lat: ${busData['lat']?.toStringAsFixed(4) ?? 'N/A'}, '
                        'Lng: ${busData['lng']?.toStringAsFixed(4) ?? 'N/A'}\n'
                        'Speed: ${busData['speed']?.toStringAsFixed(1) ?? '0'} km/h'),
                    isThreeLine: true,
                  ),
                );
              },
            ),
    );
  }
}
