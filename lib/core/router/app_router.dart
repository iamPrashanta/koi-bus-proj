import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/home/home_screen.dart';
import '../../features/search/search_screen.dart';
import '../../features/stops/stops_screen.dart';
import '../../features/favorites/saved_screen.dart';
import '../../features/settings/settings_screen.dart';
import '../../features/planner/journey_detail_screen.dart';
import '../../features/stops/stop_detail_screen.dart';
import '../widgets/koibus_scaffold.dart';

// Route name constants
class AppRoutes {
  static const String home = '/';
  static const String search = '/search';
  static const String journeyDetail = '/journey';
  static const String stops = '/stops';
  static const String stopDetail = '/stops/detail';
  static const String saved = '/saved';
  static const String settings = '/settings';
}

final appRouter = GoRouter(
  initialLocation: AppRoutes.home,
  debugLogDiagnostics: false,
  routes: [
    // Main shell with bottom navigation
    StatefulShellRoute.indexedStack(
      builder: (context, state, navigationShell) {
        return KoiBusScaffold(navigationShell: navigationShell);
      },
      branches: [
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: AppRoutes.home,
              name: 'home',
              builder: (context, state) => const HomeScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: AppRoutes.search,
              name: 'search',
              builder: (context, state) => const SearchScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: AppRoutes.stops,
              name: 'stops',
              builder: (context, state) => const StopsScreen(),
              routes: [
                GoRoute(
                  path: 'detail',
                  name: 'stopDetail',
                  builder: (context, state) {
                    final stopId = state.uri.queryParameters['id'] ?? '';
                    final stopName = state.uri.queryParameters['name'] ?? '';
                    return StopDetailScreen(stopId: stopId, stopName: stopName);
                  },
                ),
              ],
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: AppRoutes.saved,
              name: 'saved',
              builder: (context, state) => const SavedScreen(),
            ),
          ],
        ),
        StatefulShellBranch(
          routes: [
            GoRoute(
              path: AppRoutes.settings,
              name: 'settings',
              builder: (context, state) => const SettingsScreen(),
            ),
          ],
        ),
      ],
    ),

    // Full-screen journey detail (outside shell)
    GoRoute(
      path: AppRoutes.journeyDetail,
      name: 'journeyDetail',
      builder: (context, state) {
        final from = state.uri.queryParameters['from'] ?? '';
        final to = state.uri.queryParameters['to'] ?? '';
        return JourneyDetailScreen(fromStopId: from, toStopId: to);
      },
    ),
  ],
);
