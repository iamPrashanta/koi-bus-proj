import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_icons/lucide_icons.dart';

import 'core/theme/app_theme.dart';
import 'features/home/home_screen.dart';
import 'features/search/search_screen.dart';
import 'features/stop/stop_detail_screen.dart';
import 'features/route/route_explorer_screen.dart';
import 'features/route/route_detail_screen.dart';
import 'features/planner/basic_planner_screen.dart';
import 'features/settings/database_health_screen.dart';

void main() {
  runApp(const ProviderScope(child: KoiBusApp()));
}

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final _router = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  routes: [
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) {
        return Scaffold(
          body: child,
          bottomNavigationBar: BottomNavigationBar(
            currentIndex: _calculateSelectedIndex(state.uri.toString()),
            onTap: (index) => _onItemTapped(index, context),
            selectedItemColor: AppTheme.primaryBlue,
            unselectedItemColor: Colors.grey,
            type: BottomNavigationBarType.fixed,
            items: const [
              BottomNavigationBarItem(icon: Icon(LucideIcons.home), label: 'Home'),
              BottomNavigationBarItem(icon: Icon(Icons.route), label: 'Planner'),
              BottomNavigationBarItem(icon: Icon(LucideIcons.map), label: 'Explorer'),
              BottomNavigationBarItem(icon: Icon(LucideIcons.database), label: 'DB Health'),
            ],
          ),
        );
      },
      routes: [
        GoRoute(
          path: '/',
          builder: (context, state) => const HomeScreen(),
        ),
        GoRoute(
          path: '/planner',
          builder: (context, state) => const BasicPlannerScreen(),
        ),
        GoRoute(
          path: '/explorer',
          builder: (context, state) => const RouteExplorerScreen(),
        ),
        GoRoute(
          path: '/dbhealth',
          builder: (context, state) => const DatabaseHealthScreen(),
        ),
      ],
    ),
    GoRoute(
      path: '/search',
      builder: (context, state) => const SearchScreen(),
    ),
    GoRoute(
      path: '/stop/:id',
      builder: (context, state) => StopDetailScreen(stopId: state.pathParameters['id']!),
    ),
    GoRoute(
      path: '/route/:id',
      builder: (context, state) => RouteDetailScreen(routeId: state.pathParameters['id']!),
    ),
  ],
);

int _calculateSelectedIndex(String location) {
  if (location.startsWith('/planner')) return 1;
  if (location.startsWith('/explorer')) return 2;
  if (location.startsWith('/dbhealth')) return 3;
  return 0;
}

void _onItemTapped(int index, BuildContext context) {
  switch (index) {
    case 0:
      context.go('/');
      break;
    case 1:
      context.go('/planner');
      break;
    case 2:
      context.go('/explorer');
      break;
    case 3:
      context.go('/dbhealth');
      break;
  }
}

class KoiBusApp extends StatelessWidget {
  const KoiBusApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Koi Bus',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: _router,
      debugShowCheckedModeBanner: false,
    );
  }
}
