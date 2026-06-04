import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/providers.dart';

class DatabaseHealthScreen extends ConsumerWidget {
  const DatabaseHealthScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final metadata = ref.watch(metadataProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Database Health')),
      body: metadata.when(
        data: (data) {
          if (data == null) return const Center(child: Text('No metadata found'));
          
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
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
              const SizedBox(height: 16),
              _buildCountCard(context, 'Graph Edges', data['graph_edge_count'].toString()),
              const SizedBox(height: 32),
              Center(
                child: Text(
                  'Last Updated: ${data['generated_at']}',
                  style: const TextStyle(color: Colors.grey),
                ),
              )
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
