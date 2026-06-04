import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_colors.dart';

class KoiBusScaffold extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const KoiBusScaffold({super.key, required this.navigationShell});

  static const List<_NavItem> _items = [
    _NavItem(icon: Icons.home_rounded, activeIcon: Icons.home_rounded, label: 'Home'),
    _NavItem(icon: Icons.search_rounded, activeIcon: Icons.search_rounded, label: 'Search'),
    _NavItem(icon: Icons.directions_bus_rounded, activeIcon: Icons.directions_bus_rounded, label: 'Stops'),
    _NavItem(icon: Icons.bookmark_border_rounded, activeIcon: Icons.bookmark_rounded, label: 'Saved'),
    _NavItem(icon: Icons.settings_outlined, activeIcon: Icons.settings_rounded, label: 'Settings'),
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: navigationShell,
      bottomNavigationBar: _KoiBusBottomNav(
        currentIndex: navigationShell.currentIndex,
        isDark: isDark,
        onTap: (index) {
          navigationShell.goBranch(
            index,
            initialLocation: index == navigationShell.currentIndex,
          );
        },
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const _NavItem({required this.icon, required this.activeIcon, required this.label});
}

class _KoiBusBottomNav extends StatelessWidget {
  final int currentIndex;
  final bool isDark;
  final ValueChanged<int> onTap;

  const _KoiBusBottomNav({
    required this.currentIndex,
    required this.isDark,
    required this.onTap,
  });

  static const List<_NavItem> _items = [
    _NavItem(icon: Icons.home_outlined, activeIcon: Icons.home_rounded, label: 'Home'),
    _NavItem(icon: Icons.search_rounded, activeIcon: Icons.search_rounded, label: 'Search'),
    _NavItem(icon: Icons.directions_bus_outlined, activeIcon: Icons.directions_bus_rounded, label: 'Stops'),
    _NavItem(icon: Icons.bookmark_border_rounded, activeIcon: Icons.bookmark_rounded, label: 'Saved'),
    _NavItem(icon: Icons.settings_outlined, activeIcon: Icons.settings_rounded, label: 'Settings'),
  ];

  @override
  Widget build(BuildContext context) {
    final bgColor = isDark ? AppColors.surfaceCard : Colors.white;
    final borderColor = isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight;

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        border: Border(
          top: BorderSide(color: borderColor, width: 0.5),
        ),
      ),
      child: SafeArea(
        child: SizedBox(
          height: 60,
          child: Row(
            children: List.generate(_items.length, (index) {
              final item = _items[index];
              final isSelected = currentIndex == index;
              return Expanded(
                child: _NavBarItem(
                  item: item,
                  isSelected: isSelected,
                  isDark: isDark,
                  onTap: () => onTap(index),
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}

class _NavBarItem extends StatelessWidget {
  final _NavItem item;
  final bool isSelected;
  final bool isDark;
  final VoidCallback onTap;

  const _NavBarItem({
    required this.item,
    required this.isSelected,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final activeColor = AppColors.primaryBlue;
    final inactiveColor = isDark ? AppColors.textHint : AppColors.textHintLight;

    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            curve: Curves.easeOutCubic,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
            decoration: BoxDecoration(
              color: isSelected ? AppColors.primaryBlue.withOpacity(0.12) : Colors.transparent,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(
              isSelected ? item.activeIcon : item.icon,
              size: 22,
              color: isSelected ? activeColor : inactiveColor,
            ),
          ),
          const SizedBox(height: 2),
          AnimatedDefaultTextStyle(
            duration: const Duration(milliseconds: 200),
            style: TextStyle(
              fontFamily: 'Outfit',
              fontSize: 10,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
              color: isSelected ? activeColor : inactiveColor,
            ),
            child: Text(item.label),
          ),
        ],
      )
      .animate(target: isSelected ? 1 : 0)
      .scaleXY(begin: 0.95, end: 1.0, duration: 150.ms, curve: Curves.easeOutBack),
    );
  }
}
