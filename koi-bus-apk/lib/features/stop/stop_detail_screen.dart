import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/providers.dart';

class StopDetailScreen extends ConsumerWidget {
  final String stopId;

  const StopDetailScreen({Key? key, required this.stopId}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final stopDetails = ref.watch(stopDetailsProvider(stopId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Stop Details'),
      ),
      body: stopDetails.when(
        data: (stop) {
          if (stop == null) return const Center(child: Text('Stop not found'));
          
          final routes = stop['routes'] as List;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                color: Theme.of(context).primaryColor,
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      stop['name'],
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.location_on, color: Colors.white70, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          stop['district'] ?? 'Unknown District',
                          style: const TextStyle(color: Colors.white70, fontSize: 16),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  'Routes serving this stop',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
              Expanded(
                child: routes.isEmpty
                    ? const Center(child: Text('No routes mapped to this stop yet.'))
                    : ListView.builder(
                        itemCount: routes.length,
                        itemBuilder: (context, index) {
                          final r = routes[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            child: ListTile(
                              leading: CircleAvatar(
                                backgroundColor: Theme.of(context).colorScheme.secondary.withOpacity(0.2),
                                child: Icon(Icons.directions_bus, color: Theme.of(context).colorScheme.secondary),
                              ),
                              title: Text(r['short_name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                              subtitle: Text(r['long_name']),
                              trailing: const Icon(Icons.chevron_right),
                              onTap: () => context.push('/route/${r['id']}'),
                            ),
                          );
                        },
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
}
