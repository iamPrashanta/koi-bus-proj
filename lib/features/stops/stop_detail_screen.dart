import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../core/theme/app_colors.dart';

class StopDetailScreen extends StatelessWidget {
  final String stopId;
  final String stopName;

  const StopDetailScreen({super.key, required this.stopId, required this.stopName});

  static final List<Map<String, dynamic>> _mockBuses = [
    {'number': 'AC-44', 'operator': 'WBTC', 'type': 'AC', 'direction': '→ Howrah Station', 'lastSeen': '5 min ago'},
    {'number': '12B', 'operator': 'CSTC', 'type': 'NON-AC', 'direction': '→ Babughat', 'lastSeen': '12 min ago'},
    {'number': 'S-12', 'operator': 'CSTC', 'type': 'NON-AC', 'direction': '→ Garia', 'lastSeen': '3 min ago'},
    {'number': 'AC-22', 'operator': 'WBTC', 'type': 'AC', 'direction': '→ Airport', 'lastSeen': '20 min ago'},
    {'number': '230', 'operator': 'WBTC', 'type': 'NON-AC', 'direction': '→ Salt Lake', 'lastSeen': '8 min ago'},
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: Text(stopName),
        leading: const BackButton(),
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: AppColors.primaryGradient,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.location_on_rounded, color: Colors.white, size: 24),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(stopName, style: const TextStyle(fontFamily: 'Outfit', color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700)),
                          Text('Kolkata Zone • ${_mockBuses.length} routes', style: const TextStyle(fontFamily: 'Outfit', color: Colors.white70, fontSize: 13)),
                        ],
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 400.ms),
            ),
          ),

          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverToBoxAdapter(
              child: Text(
                'Buses at this stop',
                style: TextStyle(
                  fontFamily: 'Outfit',
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight,
                ),
              ),
            ),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 10)),

          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, i) {
                  final bus = _mockBuses[i];
                  final opColor = bus['operator'] == 'WBTC' ? AppColors.wbtcColor : AppColors.cstcColor;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Card(
                      child: ListTile(
                        leading: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                          decoration: BoxDecoration(color: opColor, borderRadius: BorderRadius.circular(8)),
                          child: Text(bus['number'], style: const TextStyle(fontFamily: 'Outfit', color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                        ),
                        title: Text(bus['direction'], style: TextStyle(fontFamily: 'Outfit', fontSize: 13, color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight)),
                        subtitle: Text('${bus['operator']} • ${bus['type']}', style: const TextStyle(fontFamily: 'Outfit', fontSize: 11, color: AppColors.textHint)),
                        trailing: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.successGreen.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(bus['lastSeen'], style: const TextStyle(fontFamily: 'Outfit', fontSize: 10, color: AppColors.successGreen, fontWeight: FontWeight.w500)),
                        ),
                      ),
                    ).animate().fadeIn(delay: (i * 60).ms, duration: 300.ms),
                  );
                },
                childCount: _mockBuses.length,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
