import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'core/theme/app_theme.dart';
import 'features/home/home_screen.dart';
import 'features/search/search_screen.dart';
import 'features/stop/stop_detail_screen.dart';
import 'features/route/route_explorer_screen.dart';
import 'features/route/route_detail_screen.dart';
import 'features/planner/basic_planner_screen.dart';
import 'features/settings/database_health_screen.dart';
import 'features/startup/startup_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/live_map/live_map_screen.dart';
import 'providers/auth_provider.dart';

void main() {
  runApp(const ProviderScope(child: KoiBusApp()));
}

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();

final _routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/startup',
    redirect: (context, state) {
      final isAuthRoute = state.uri.toString() == '/login';
      final isStartupRoute = state.uri.toString() == '/startup';
      final isAuthenticated = authState.user != null;

      if (!isStartupRoute) {
        if (!isAuthenticated && !isAuthRoute) {
          return '/login';
        }
        if (isAuthenticated && isAuthRoute) {
          return '/';
        }
      }
      return null;
    },
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
                BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
                BottomNavigationBarItem(icon: Icon(Icons.directions_bus), label: 'Live'),
                BottomNavigationBarItem(icon: Icon(Icons.route), label: 'Planner'),
                BottomNavigationBarItem(icon: Icon(Icons.map), label: 'Explorer'),
                BottomNavigationBarItem(icon: Icon(Icons.storage), label: 'DB Health'),
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
            path: '/live',
            builder: (context, state) => const LiveMapScreen(),
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
        path: '/startup',
        builder: (context, state) => const StartupScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
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
});

int _calculateSelectedIndex(String location) {
  if (location.startsWith('/live')) return 1;
  if (location.startsWith('/planner')) return 2;
  if (location.startsWith('/explorer')) return 3;
  if (location.startsWith('/dbhealth')) return 4;
  return 0;
}

void _onItemTapped(int index, BuildContext context) {
  switch (index) {
    case 0:
      context.go('/');
      break;
    case 1:
      context.go('/live');
      break;
    case 2:
      context.go('/planner');
      break;
    case 3:
      context.go('/explorer');
      break;
    case 4:
      context.go('/dbhealth');
      break;
  }
}

class KoiBusApp extends ConsumerWidget {
  const KoiBusApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(_routerProvider);

    return MaterialApp.router(
      title: 'Koi Bus',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
