import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../providers/providers.dart';
import '../../core/api/api_config.dart';

class DatabaseHealthScreen extends ConsumerStatefulWidget {
  const DatabaseHealthScreen({Key? key}) : super(key: key);

  @override
  ConsumerState<DatabaseHealthScreen> createState() => _DatabaseHealthScreenState();
}

class _DatabaseHealthScreenState extends ConsumerState<DatabaseHealthScreen> {
  String _analyticsStatus = 'Not tested';
  String _importerStatus = 'Not tested';

  Future<void> _testPythonService(String url, bool isAnalytics) async {
    setState(() {
      if (isAnalytics) _analyticsStatus = 'Testing...';
      else _importerStatus = 'Testing...';
    });

    try {
      final res = await http.get(Uri.parse('$url/api/status/'));
      final data = jsonDecode(res.body);
      
      setState(() {
        if (isAnalytics) _analyticsStatus = 'OK (Port ${data['port']})';
        else _importerStatus = 'OK (Port ${data['port']})';
      });
    } catch (e) {
      setState(() {
        if (isAnalytics) _analyticsStatus = 'Error: Failed to connect';
        else _importerStatus = 'Error: Failed to connect';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final metadata = ref.watch(metadataProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('System Health')),
      body: metadata.when(
        data: (data) {
          if (data == null) return const Center(child: Text('No metadata found'));
          
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const Text('Local SQLite Health', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              _buildStatCard(context, 'Data Version', data['data_version'] ?? 'Unknown', Icons.storage),
              _buildStatCard(context, 'OSM Version', data['osm_version'] ?? 'Unknown', Icons.map),
              _buildStatCard(context, 'Route CSV Version', data['route_version'] ?? 'Unknown', Icons.description),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildCountCard(context, 'Total Stops', data['stop_count'].toString())),
                  const SizedBox(width: 16),
                  Expanded(child: _buildCountCard(context, 'Total Routes', data['route_count'].toString())),
                ],
              ),
              const SizedBox(height: 24),
              const Text('Python Microservices', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Card(
                child: ListTile(
                  leading: const Icon(Icons.analytics, color: Colors.blue),
                  title: const Text('Analytics Service'),
                  subtitle: Text(_analyticsStatus),
                  trailing: ElevatedButton(
                    onPressed: () => _testPythonService(ApiConfig.analyticsUrl, true),
                    child: const Text('Ping'),
                  ),
                ),
              ),
              Card(
                child: ListTile(
                  leading: const Icon(Icons.download, color: Colors.green),
                  title: const Text('Importer Service'),
                  subtitle: Text(_importerStatus),
                  trailing: ElevatedButton(
                    onPressed: () => _testPythonService(ApiConfig.importerUrl, false),
                    child: const Text('Ping'),
                  ),
                ),
              ),
            ],
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
      ),
    );
  }

  Widget _buildStatCard(BuildContext context, String title, String value, IconData icon) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: Icon(icon, color: Theme.of(context).primaryColor),
        title: Text(title, style: const TextStyle(color: Colors.grey)),
        subtitle: Text(value, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black)),
      ),
    );
  }

  Widget _buildCountCard(BuildContext context, String title, String count) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          )
        ],
      ),
      child: Column(
        children: [
          Text(count, style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Theme.of(context).primaryColor)),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
