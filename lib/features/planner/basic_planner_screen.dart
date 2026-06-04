import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../providers/providers.dart';

class BasicPlannerScreen extends ConsumerWidget {
  const BasicPlannerScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final fromStop = ref.watch(plannerFromProvider);
    final toStop = ref.watch(plannerToProvider);
    final results = ref.watch(basicPlannerResultsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Journey Planner')),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Theme.of(context).colorScheme.surface,
            child: Column(
              children: [
                _StopSelector(
                  label: 'From',
                  stop: fromStop,
                  onTap: () async {
                    // Quick hack to pick a stop, normally we'd route to a selector
                    // For MVP, user can use search. We assume fromSearch is implemented.
                  },
                ),
                const SizedBox(height: 12),
                _StopSelector(
                  label: 'To',
                  stop: toStop,
                  onTap: () {},
                ),
              ],
            ),
          ),
          const Divider(),
          Expanded(
            child: results.when(
              data: (routes) {
                if (fromStop == null || toStop == null) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.route, size: 64, color: Colors.grey.shade300),
                        const SizedBox(height: 16),
                        Text('Select stops to find direct routes', style: TextStyle(color: Colors.grey.shade500)),
                      ],
                    ),
                  );
                }

                if (routes == null || routes.isEmpty) {
                  return const Center(child: Text('No direct route found. Transfers not yet supported.'));
                }

                return ListView.builder(
                  itemCount: routes.length,
                  itemBuilder: (context, index) {
                    final r = routes[index];
                    return ListTile(
                      leading: Icon(Icons.directions_bus, color: Theme.of(context).primaryColor),
                      title: Text(r['short_name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(r['long_name']),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => context.push('/route/${r['id']}'),
                    );
                  },
                );
              },
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, st) => Center(child: Text('Error: $e')),
            ),
          ),
        ],
      ),
    );
  }
}

class _StopSelector extends StatelessWidget {
  final String label;
  final Map<String, dynamic>? stop;
  final VoidCallback onTap;

  const _StopSelector({required this.label, this.stop, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            SizedBox(
              width: 50,
              child: Text(label, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
            ),
            Expanded(
              child: Text(
                stop != null ? stop!['name'] : 'Select stop...',
                style: TextStyle(
                  fontSize: 16,
                  color: stop != null ? Colors.black : Colors.grey,
                  fontWeight: stop != null ? FontWeight.w500 : FontWeight.normal,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
