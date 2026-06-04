import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/theme_notifier.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeNotifierProvider);
    final isDark = themeMode == ThemeMode.dark;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // App info card
          _AppInfoCard(isDark: isDark).animate().fadeIn(duration: 400.ms),

          const SizedBox(height: 20),

          // Appearance section
          _SectionHeader(title: 'Appearance', isDark: isDark),
          const SizedBox(height: 8),
          _SettingsCard(
            isDark: isDark,
            children: [
              _SwitchTile(
                icon: Icons.dark_mode_rounded,
                iconColor: const Color(0xFF818CF8),
                title: 'Dark Mode',
                subtitle: isDark ? 'Currently dark' : 'Currently light',
                value: isDark,
                onChanged: (_) => ref.read(themeNotifierProvider.notifier).toggleTheme(),
                isDark: isDark,
              ),
              _DividerItem(isDark: isDark),
              _ActionTile(
                icon: Icons.language_rounded,
                iconColor: AppColors.successGreen,
                title: 'Language',
                subtitle: 'English',
                isDark: isDark,
                onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Bengali language support coming soon!')),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // Data section
          _SectionHeader(title: 'Data', isDark: isDark),
          const SizedBox(height: 8),
          _SettingsCard(
            isDark: isDark,
            children: [
              _InfoTile(
                icon: Icons.storage_rounded,
                iconColor: AppColors.accentAmber,
                title: 'Route Data Version',
                value: 'v1.0 (Jun 2025)',
                isDark: isDark,
              ),
              _DividerItem(isDark: isDark),
              _ActionTile(
                icon: Icons.sync_rounded,
                iconColor: AppColors.primaryBlue,
                title: 'Check for Updates',
                subtitle: 'Last checked: Never',
                isDark: isDark,
                onTap: () => ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Data is up to date! ✓')),
                ),
              ),
              _DividerItem(isDark: isDark),
              _ActionTile(
                icon: Icons.delete_outline_rounded,
                iconColor: AppColors.errorRed,
                title: 'Clear Cache',
                subtitle: 'Free up local storage',
                isDark: isDark,
                onTap: () {},
              ),
            ],
          ),

          const SizedBox(height: 16),

          // About section
          _SectionHeader(title: 'About', isDark: isDark),
          const SizedBox(height: 8),
          _SettingsCard(
            isDark: isDark,
            children: [
              _InfoTile(
                icon: Icons.info_outline_rounded,
                iconColor: AppColors.infoBlue,
                title: 'App Version',
                value: '1.0.0',
                isDark: isDark,
              ),
              _DividerItem(isDark: isDark),
              _ActionTile(
                icon: Icons.code_rounded,
                iconColor: AppColors.successGreen,
                title: 'Built by Cloud Grips Tech',
                subtitle: 'Open source & offline-first',
                isDark: isDark,
                onTap: () {},
              ),
              _DividerItem(isDark: isDark),
              _ActionTile(
                icon: Icons.bug_report_outlined,
                iconColor: AppColors.warningOrange,
                title: 'Report an Issue',
                subtitle: 'Help improve Koi Bus',
                isDark: isDark,
                onTap: () {},
              ),
            ],
          ),

          const SizedBox(height: 32),

          // Footer
          Center(
            child: Column(
              children: [
                const Text(
                  'Koi Bus',
                  style: TextStyle(fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.w700, color: AppColors.primaryBlue),
                ),
                const SizedBox(height: 4),
                Text(
                  'Smart bus journeys for West Bengal',
                  style: TextStyle(fontFamily: 'Outfit', fontSize: 12, color: isDark ? AppColors.textHint : AppColors.textHintLight),
                ),
                const SizedBox(height: 4),
                Text(
                  '© 2025 Cloud Grips Tech',
                  style: TextStyle(fontFamily: 'Outfit', fontSize: 11, color: isDark ? AppColors.textHint : AppColors.textHintLight),
                ),
              ],
            ).animate().fadeIn(delay: 600.ms, duration: 500.ms),
          ),
        ],
      ),
    );
  }
}

class _AppInfoCard extends StatelessWidget {
  final bool isDark;
  const _AppInfoCard({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: AppColors.primaryGradient,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.directions_bus_rounded, color: Colors.white, size: 28),
          ),
          const SizedBox(width: 16),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Koi Bus', style: TextStyle(fontFamily: 'Outfit', color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700)),
              Text('কই বাস? এই যে!', style: TextStyle(fontFamily: 'Outfit', color: Colors.white70, fontSize: 13)),
              SizedBox(height: 4),
              Text('v1.0.0 • Cloud Grips Tech', style: TextStyle(fontFamily: 'Outfit', color: Colors.white54, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  final bool isDark;
  const _SectionHeader({required this.title, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Text(
      title.toUpperCase(),
      style: TextStyle(
        fontFamily: 'Outfit',
        fontSize: 11,
        fontWeight: FontWeight.w600,
        letterSpacing: 1.2,
        color: isDark ? AppColors.textHint : AppColors.textHintLight,
      ),
    );
  }
}

class _SettingsCard extends StatelessWidget {
  final List<Widget> children;
  final bool isDark;
  const _SettingsCard({required this.children, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight, width: 0.5),
      ),
      child: Column(children: children),
    );
  }
}

class _SwitchTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool isDark;

  const _SwitchTile({
    required this.icon, required this.iconColor, required this.title,
    required this.subtitle, required this.value, required this.onChanged, required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: iconColor.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: iconColor, size: 18),
      ),
      title: Text(title, style: TextStyle(fontFamily: 'Outfit', fontSize: 14, fontWeight: FontWeight.w500, color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight)),
      subtitle: Text(subtitle, style: const TextStyle(fontFamily: 'Outfit', fontSize: 12, color: AppColors.textHint)),
      trailing: Switch.adaptive(value: value, onChanged: onChanged, activeColor: AppColors.primaryBlue),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String value;
  final bool isDark;

  const _InfoTile({required this.icon, required this.iconColor, required this.title, required this.value, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: iconColor.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: iconColor, size: 18),
      ),
      title: Text(title, style: TextStyle(fontFamily: 'Outfit', fontSize: 14, fontWeight: FontWeight.w500, color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight)),
      trailing: Text(value, style: const TextStyle(fontFamily: 'Outfit', fontSize: 12, color: AppColors.textSecondary)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final bool isDark;
  final VoidCallback onTap;

  const _ActionTile({required this.icon, required this.iconColor, required this.title, required this.subtitle, required this.isDark, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      onTap: onTap,
      leading: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(color: iconColor.withOpacity(0.12), borderRadius: BorderRadius.circular(8)),
        child: Icon(icon, color: iconColor, size: 18),
      ),
      title: Text(title, style: TextStyle(fontFamily: 'Outfit', fontSize: 14, fontWeight: FontWeight.w500, color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight)),
      subtitle: Text(subtitle, style: const TextStyle(fontFamily: 'Outfit', fontSize: 12, color: AppColors.textHint)),
      trailing: const Icon(Icons.chevron_right_rounded, size: 18, color: AppColors.textHint),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
    );
  }
}

class _DividerItem extends StatelessWidget {
  final bool isDark;
  const _DividerItem({required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Divider(height: 0, color: isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight, indent: 52);
  }
}
