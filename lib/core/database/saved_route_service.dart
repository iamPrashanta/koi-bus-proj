import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'saved_route.dart';

final savedRoutesProvider = StateNotifierProvider<SavedRoutesNotifier, List<SavedRoute>>((ref) {
  return SavedRoutesNotifier();
});

class SavedRoutesNotifier extends StateNotifier<List<SavedRoute>> {
  final Box _box = Hive.box('saved_routes');

  SavedRoutesNotifier() : super([]) {
    _loadRoutes();
  }

  void _loadRoutes() {
    final routes = _box.values.map((e) => SavedRoute.fromMap(e as Map<dynamic, dynamic>)).toList();
    routes.sort((a, b) => b.savedAt.compareTo(a.savedAt)); // Newest first
    state = routes;
  }

  Future<void> saveRoute(SavedRoute route) async {
    // Check if it already exists
    final exists = state.any((r) => r.fromId == route.fromId && r.toId == route.toId);
    if (!exists) {
      await _box.put(route.id, route.toMap());
      _loadRoutes();
    }
  }

  Future<void> deleteRoute(String id) async {
    await _box.delete(id);
    _loadRoutes();
  }

  bool isSaved(String fromId, String toId) {
    return state.any((r) => r.fromId == fromId && r.toId == toId);
  }
}
