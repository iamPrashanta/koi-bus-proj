import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../core/theme/app_colors.dart';
import '../../core/router/app_router.dart';
import '../../core/database/saved_route_service.dart';

class SavedScreen extends ConsumerWidget {
  const SavedScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final savedRoutes = ref.watch(savedRoutesProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Saved Routes')),
      body: savedRoutes.isEmpty
          ? _EmptyState()
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: savedRoutes.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final route = savedRoutes[index];
                return _SavedRouteCard(route: route, isDark: isDark)
                    .animate()
                    .fadeIn(delay: (index * 60).ms, duration: 400.ms)
                    .slideX(begin: 0.1, end: 0);
              },
            ),
    );
  }
}

class _SavedRouteCard extends ConsumerWidget {
  final dynamic route;
  final bool isDark;

  const _SavedRouteCard({required this.route, required this.isDark});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Card(
      elevation: isDark ? 0 : 2,
      shadowColor: Colors.black.withOpacity(0.05),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20),
        side: isDark ? const BorderSide(color: AppColors.surfaceBorder) : BorderSide.none,
      ),
      child: InkWell(
        onTap: () {
          context.push('${AppRoutes.journeyDetail}?from=${route.fromId}&to=${route.toId}');
        },
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              Row(
                children: [
                  const Icon(Icons.history_rounded, size: 14, color: AppColors.textHint),
                  const SizedBox(width: 6),
                  Text(
                    'Saved ${DateFormat.yMMMd().format(route.savedAt)}',
                    style: const TextStyle(fontFamily: 'Outfit', fontSize: 11, color: AppColors.textHint),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.bookmark_remove_rounded, size: 18, color: AppColors.textHint),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(),
                    onPressed: () {
                      ref.read(savedRoutesProvider.notifier).deleteRoute(route.id);
                    },
                  ),
                ],
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  Column(
                    children: [
                      const Icon(Icons.trip_origin_rounded, size: 12, color: AppColors.successGreen),
                      Container(width: 1.5, height: 16, color: isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight),
                      const Icon(Icons.place_rounded, size: 12, color: AppColors.errorRed),
                    ],
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          route.fromName,
                          style: TextStyle(fontFamily: 'Outfit', fontSize: 14, fontWeight: FontWeight.w500, color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          route.toName,
                          style: TextStyle(fontFamily: 'Outfit', fontSize: 14, fontWeight: FontWeight.w500, color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppColors.primaryBlue.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppColors.primaryBlue),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.primaryBlue.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.bookmark_border_rounded, size: 48, color: AppColors.primaryBlue),
          ),
          const SizedBox(height: 24),
          const Text(
            'No Saved Routes',
            style: TextStyle(fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 8),
          const Text(
            'Routes you save for quick access\nwill appear here.',
            textAlign: TextAlign.center,
            style: TextStyle(fontFamily: 'Outfit', fontSize: 14, color: AppColors.textSecondary),
          ),
        ],
      ).animate().fadeIn(duration: 400.ms).scale(begin: const Offset(0.95, 0.95), end: const Offset(1, 1)),
    );
  }
}
