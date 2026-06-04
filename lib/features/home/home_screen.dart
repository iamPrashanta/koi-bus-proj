import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/router/app_router.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final List<Map<String, String>> _recentSearches = [
    {'from': 'Esplanade', 'to': 'Howrah Station'},
    {'from': 'Garia', 'to': 'Park Street'},
    {'from': 'Salt Lake Sec V', 'to': 'Karunamoyee'},
  ];

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // ── Hero Header ──────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: _HeroHeader(isDark: isDark),
          ),

          // ── "Where To" Master Search ──────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              child: _WhereToCard(isDark: isDark),
            ).animate().fadeIn(delay: 300.ms, duration: 500.ms).slideY(begin: 0.1, end: 0),
          ),

          // ── Smart Shortcuts ───────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              child: _SmartShortcuts(isDark: isDark),
            ).animate().fadeIn(delay: 450.ms, duration: 500.ms),
          ),

          // ── Recent Searches ───────────────────────────────────────────────
          if (_recentSearches.isNotEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
                child: _RecentSearches(
                  searches: _recentSearches,
                  isDark: isDark,
                  onTap: (from, to) {
                    context.go('${AppRoutes.search}?from=$from&to=$to');
                  },
                ),
              ).animate().fadeIn(delay: 600.ms, duration: 500.ms),
            ),

          // ── Popular Routes ─────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 32),
              child: _PopularRoutes(isDark: isDark),
            ).animate().fadeIn(delay: 750.ms, duration: 500.ms),
          ),

          const SliverToBoxAdapter(child: SizedBox(height: 16)),
        ],
      ),
    );
  }
}

// ─── Hero Header ──────────────────────────────────────────────────────────────
class _HeroHeader extends StatelessWidget {
  final bool isDark;
  const _HeroHeader({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        top: MediaQuery.of(context).padding.top + 20,
        left: 20,
        right: 20,
        bottom: 32,
      ),
      decoration: BoxDecoration(
        gradient: isDark
            ? const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF0F172A), Color(0xFF1A2540)],
              )
            : const LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [Color(0xFF1D4ED8), Color(0xFF3B82F6)],
              ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Logo row
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: AppColors.primaryBlue.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.primaryBlue.withOpacity(0.4)),
                ),
                child: const Icon(
                  Icons.directions_bus_rounded,
                  color: AppColors.primaryBlue,
                  size: 22,
                ),
              ).animate().fadeIn(duration: 600.ms).scale(begin: const Offset(0.7, 0.7)),
              const SizedBox(width: 10),
              RichText(
                text: TextSpan(
                  children: [
                    TextSpan(
                      text: 'Koi ',
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 26,
                        fontWeight: FontWeight.w700,
                        color: isDark ? AppColors.textPrimary : Colors.white,
                      ),
                    ),
                    const TextSpan(
                      text: 'Bus',
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 26,
                        fontWeight: FontWeight.w700,
                        color: AppColors.accentAmber,
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(delay: 150.ms, duration: 600.ms).slideX(begin: -0.1, end: 0),
            ],
          ),

          const SizedBox(height: 16),

          Text(
            'কই বাস? এই যে!',
            style: TextStyle(
              fontFamily: 'Outfit',
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: isDark ? AppColors.textSecondary : Colors.white70,
              letterSpacing: 0.3,
            ),
          ).animate().fadeIn(delay: 250.ms, duration: 600.ms),

          const SizedBox(height: 4),

          Text(
            'Find your bus across West Bengal',
            style: TextStyle(
              fontFamily: 'Outfit',
              fontSize: 22,
              fontWeight: FontWeight.w600,
              color: isDark ? AppColors.textPrimary : Colors.white,
              height: 1.3,
            ),
          ).animate().fadeIn(delay: 350.ms, duration: 600.ms).slideY(begin: 0.1, end: 0),

          const SizedBox(height: 12),

          // Live stats row
          Row(
            children: [
              _StatChip(label: '1,200+', sublabel: 'Routes', icon: Icons.route_rounded),
              const SizedBox(width: 8),
              _StatChip(label: '8,000+', sublabel: 'Stops', icon: Icons.location_on_rounded),
              const SizedBox(width: 8),
              _StatChip(label: 'Offline', sublabel: 'Ready', icon: Icons.offline_bolt_rounded, color: AppColors.successGreen),
            ],
          ).animate().fadeIn(delay: 500.ms, duration: 600.ms),
        ],
      ),
    );
  }
}

class _StatChip extends StatelessWidget {
  final String label;
  final String sublabel;
  final IconData icon;
  final Color color;

  const _StatChip({
    required this.label,
    required this.sublabel,
    required this.icon,
    this.color = AppColors.primaryBlue,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: color),
          const SizedBox(width: 5),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(label, style: TextStyle(fontFamily: 'Outfit', fontSize: 12, fontWeight: FontWeight.w700, color: color)),
              Text(sublabel, style: const TextStyle(fontFamily: 'Outfit', fontSize: 9, color: AppColors.textSecondary)),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Where To Card ──────────────────────────────────────────────────────────────
class _WhereToCard extends StatelessWidget {
  final bool isDark;

  const _WhereToCard({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        context.go(AppRoutes.search);
      },
      child: Container(
        margin: const EdgeInsets.only(top: -16),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.surfaceCard : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight,
            width: 0.5,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.4 : 0.08),
              blurRadius: 24,
              offset: const Offset(0, 8),
            ),
          ],
        ),
        child: Row(
          children: [
            const Icon(Icons.search_rounded, color: AppColors.primaryBlue, size: 28),
            const SizedBox(width: 16),
            Text(
              'Where to?',
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Smart Shortcuts ─────────────────────────────────────────────────────────────
class _SmartShortcuts extends StatelessWidget {
  final bool isDark;
  const _SmartShortcuts({required this.isDark});

  @override
  Widget build(BuildContext context) {
    final actions = [
      _QuickAction(icon: Icons.my_location_rounded, label: 'Nearby', color: AppColors.primaryBlue, onTap: () {}),
      _QuickAction(icon: Icons.home_rounded, label: 'Home', color: AppColors.successGreen, onTap: () {}),
      _QuickAction(icon: Icons.work_rounded, label: 'Work', color: AppColors.accentAmber, onTap: () {}),
      _QuickAction(icon: Icons.bookmark_rounded, label: 'Saved', color: AppColors.infoBlue, onTap: () => context.go(AppRoutes.saved)),
    ];

    return Row(
      children: actions.map((a) => Expanded(
        child: Padding(
          padding: EdgeInsets.only(right: a == actions.last ? 0 : 10),
          child: _QuickActionButton(action: a, isDark: isDark),
        ),
      )).toList(),
    );
  }
}

class _QuickAction {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _QuickAction({required this.icon, required this.label, required this.color, required this.onTap});
}

class _QuickActionButton extends StatelessWidget {
  final _QuickAction action;
  final bool isDark;

  const _QuickActionButton({required this.action, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: action.onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: isDark ? AppColors.surfaceElevated : AppColors.backgroundLight,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight,
            width: 0.5,
          ),
        ),
        child: Column(
          children: [
            Icon(action.icon, color: action.color, size: 24),
            const SizedBox(height: 8),
            Text(
              action.label,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Outfit',
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Recent Searches ──────────────────────────────────────────────────────────
class _RecentSearches extends StatelessWidget {
  final List<Map<String, String>> searches;
  final bool isDark;
  final void Function(String from, String to) onTap;

  const _RecentSearches({required this.searches, required this.isDark, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Recent Searches',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight,
              ),
            ),
            const Spacer(),
            TextButton(
              onPressed: () {},
              style: TextButton.styleFrom(
                padding: EdgeInsets.zero,
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: const Text('Clear', style: TextStyle(fontFamily: 'Outfit', fontSize: 12)),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Container(
          decoration: BoxDecoration(
            color: isDark ? AppColors.surfaceCard : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight,
              width: 0.5,
            ),
          ),
          child: Column(
            children: searches.asMap().entries.map((entry) {
              final i = entry.key;
              final s = entry.value;
              return Column(
                children: [
                  ListTile(
                    onTap: () => onTap(s['from']!, s['to']!),
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.primaryBlue.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.history_rounded, size: 16, color: AppColors.primaryBlue),
                    ),
                    title: Text(
                      '${s['from']} → ${s['to']}',
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
                      ),
                    ),
                    trailing: const Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppColors.textHint),
                    dense: true,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  ),
                  if (i < searches.length - 1)
                    Divider(
                      height: 0,
                      color: isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight,
                      indent: 52,
                    ),
                ],
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

// ─── Popular Routes ────────────────────────────────────────────────────────────
class _PopularRoutes extends StatelessWidget {
  final bool isDark;
  const _PopularRoutes({required this.isDark});

  static const List<Map<String, dynamic>> _routes = [
    {'number': 'AC-44', 'name': 'Esplanade ↔ Howrah', 'operator': 'WBTC', 'type': 'AC'},
    {'number': 'S-12', 'name': 'Garia ↔ Babughat', 'operator': 'CSTC', 'type': 'NON-AC'},
    {'number': '230', 'name': 'Salt Lake ↔ Esplanade', 'operator': 'WBTC', 'type': 'NON-AC'},
    {'number': 'AC-22', 'name': 'Airport ↔ Babughat', 'operator': 'WBTC', 'type': 'AC'},
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Popular Routes',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight,
          ),
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 110,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: _routes.length,
            itemBuilder: (context, i) {
              final route = _routes[i];
              final isAC = route['type'] == 'AC';
              final badgeColor = route['operator'] == 'WBTC' ? AppColors.wbtcColor : AppColors.cstcColor;

              return Container(
                width: 180,
                margin: EdgeInsets.only(right: i < _routes.length - 1 ? 12 : 0),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: isDark ? AppColors.surfaceCard : Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight,
                    width: 0.5,
                  ),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: badgeColor,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            route['number'],
                            style: const TextStyle(
                              fontFamily: 'Outfit',
                              color: Colors.white,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        const SizedBox(width: 6),
                        if (isAC)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.infoBlue.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              'AC',
                              style: TextStyle(fontFamily: 'Outfit', fontSize: 10, color: AppColors.infoBlue, fontWeight: FontWeight.w600),
                            ),
                          ),
                      ],
                    ),
                    Text(
                      route['name'],
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                        color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
                        height: 1.3,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      route['operator'],
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 11,
                        color: badgeColor,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
