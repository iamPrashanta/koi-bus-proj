import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/database/repositories/stop_repository.dart';
import '../core/database/repositories/route_repository.dart';
import '../core/database/repositories/metadata_repository.dart';

// Repositories
final stopRepositoryProvider = Provider((ref) => StopRepository());
final routeRepositoryProvider = Provider((ref) => RouteRepository());
final metadataRepositoryProvider = Provider((ref) => MetadataRepository());

// Async Data Providers
final metadataProvider = FutureProvider((ref) {
  final repo = ref.read(metadataRepositoryProvider);
  return repo.getMetadata();
});

final allRoutesProvider = FutureProvider((ref) {
  final repo = ref.read(routeRepositoryProvider);
  return repo.getAllRoutes();
});

final searchStopsProvider = FutureProvider.family<List<Map<String, dynamic>>, String>((ref, query) {
  final repo = ref.read(stopRepositoryProvider);
  return repo.searchStops(query);
});

final stopDetailsProvider = FutureProvider.family<Map<String, dynamic>?, String>((ref, stopId) async {
  final repo = ref.read(stopRepositoryProvider);
  final stop = await repo.getStopDetails(stopId);
  if (stop == null) return null;

  final routeRepo = ref.read(routeRepositoryProvider);
  final routes = await routeRepo.getRoutesForStop(stopId);
  stop['routes'] = routes;
  return stop;
});

final routeDetailsProvider = FutureProvider.family<Map<String, dynamic>?, String>((ref, routeId) {
  final repo = ref.read(routeRepositoryProvider);
  return repo.getRouteDetails(routeId);
});

// Basic Planner State
final plannerFromProvider = StateProvider<Map<String, dynamic>?>((ref) => null);
final plannerToProvider = StateProvider<Map<String, dynamic>?>((ref) => null);

final basicPlannerResultsProvider = FutureProvider<List<Map<String, dynamic>>?>((ref) async {
  final from = ref.watch(plannerFromProvider);
  final to = ref.watch(plannerToProvider);
  
  if (from == null || to == null) return null;
  
  final repo = ref.read(routeRepositoryProvider);
  return repo.getDirectRoutes(from['id'], to['id']);
});
