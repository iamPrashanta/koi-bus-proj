import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';
import '../../providers/providers.dart';

class RouteExplorerScreen extends ConsumerWidget {
  const RouteExplorerScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final routes = ref.watch(allRoutesProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Route Explorer'),
      ),
      body: routes.when(
        data: (data) {
          if (data.isEmpty) return const Center(child: Text('No routes available.'));
          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: data.length,
            itemBuilder: (context, index) {
              final r = data[index];
              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: CircleAvatar(
                    backgroundColor: Theme.of(context).colorScheme.secondary.withOpacity(0.2),
                    child: Text(
                      r['short_name'], 
                      style: TextStyle(color: Theme.of(context).colorScheme.secondary, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                  title: Text(r['long_name'], style: const TextStyle(fontWeight: FontWeight.w500)),
                  subtitle: Text(r['operator_name'] ?? 'Unknown Operator'),
                  trailing: const Icon(LucideIcons.chevronRight),
                  onTap: () => context.push('/route/${r['id']}'),
                ),
              );
            },
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, st) => Center(child: Text('Error: $e')),
      ),
    );
  }
}
