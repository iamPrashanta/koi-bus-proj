import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/providers.dart';

class RouteDetailScreen extends ConsumerWidget {
  final String routeId;

  const RouteDetailScreen({Key? key, required this.routeId}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final routeDetails = ref.watch(routeDetailsProvider(routeId));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Route Details'),
      ),
      body: routeDetails.when(
        data: (route) {
          if (route == null) return const Center(child: Text('Route not found'));
          
          final stops = route['stops'] as List;

          return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24.0),
                color: Theme.of(context).colorScheme.surface,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.secondary,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        route['short_name'],
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      route['long_name'],
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Operator: ${route['operator_name'] ?? 'Unknown'}',
                      style: TextStyle(color: Colors.grey.shade600),
                    ),
                  ],
                ),
              ),
              const Padding(
                padding: EdgeInsets.all(16.0),
                child: Text(
                  'Stops',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
              Expanded(
                child: ListView.builder(
                  itemCount: stops.length,
                  itemBuilder: (context, index) {
                    final stop = stops[index];
                    return ListTile(
                      leading: Column(
                        children: [
                          Icon(LucideIcons.circle, size: 12, color: Theme.of(context).primaryColor),
                          if (index != stops.length - 1)
                            Expanded(child: Container(width: 2, color: Theme.of(context).primaryColor.withOpacity(0.3))),
                        ],
                      ),
                      title: Text(stop['name'], style: const TextStyle(fontWeight: FontWeight.w500)),
                      onTap: () => context.push('/stop/${stop['id']}'),
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
