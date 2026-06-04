import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/router/app_router.dart';
import '../../core/database/db_helper.dart';

class StopsScreen extends StatefulWidget {
  const StopsScreen({super.key});

  @override
  State<StopsScreen> createState() => _StopsScreenState();
}

class _StopsScreenState extends State<StopsScreen> {
  final TextEditingController _searchController = TextEditingController();
  String _zone = 'All';
  
  List<Map<String, dynamic>> _stops = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStops();
  }

  Future<void> _loadStops() async {
    setState(() => _isLoading = true);
    
    final db = DatabaseHelper.instance;
    final query = _searchController.text.trim();
    
    List<Map<String, dynamic>> results;
    
    if (query.isNotEmpty) {
      results = await db.searchStops(query);
      if (_zone != 'All') {
        results = results.where((s) => s['zone'] == _zone).toList();
      }
    } else {
      results = await db.getAllStopsByZone(_zone);
    }

    // Since our DB schema doesn't store a direct 'buses' count yet, we'll mock it for UI for now
    _stops = results.map((e) => {
      ...e,
      'buses': (e['name'].hashCode % 50) + 10, // Mock bus count for visual completeness
    }).toList();
    
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(title: const Text('Browse Stops')),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: TextField(
              controller: _searchController,
              onChanged: (_) => _loadStops(),
              decoration: const InputDecoration(
                hintText: 'Search stops... (English or বাংলা)',
                prefixIcon: Icon(Icons.search_rounded, size: 20),
              ),
            ),
          ),

          // Zone chips
          SizedBox(
            height: 36,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: ['All', 'Kolkata', 'Howrah', 'Bidhannagar', 'North Kolkata'].map((z) {
                final selected = _zone == z;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: GestureDetector(
                    onTap: () {
                      setState(() => _zone = z);
                      _loadStops();
                    },
                    child: AnimatedContainer(
                      duration: 200.ms,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(
                        color: selected ? AppColors.primaryBlue : (isDark ? AppColors.surfaceCard : Colors.white),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: selected ? AppColors.primaryBlue : (isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight),
                        ),
                      ),
                      child: Text(
                        z,
                        style: TextStyle(
                          fontFamily: 'Outfit',
                          fontSize: 12,
                          fontWeight: selected ? FontWeight.w600 : FontWeight.w400,
                          color: selected ? Colors.white : (isDark ? AppColors.textSecondary : AppColors.textSecondaryLight),
                        ),
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: 8),
          Divider(height: 0, color: isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight),

          // Results count
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 10, 16, 4),
            child: Row(
              children: [
                Text(
                  _isLoading ? 'Loading...' : '${_stops.length} stops found',
                  style: const TextStyle(fontFamily: 'Outfit', fontSize: 12, color: AppColors.textHint),
                ),
              ],
            ),
          ),

          // List
          Expanded(
            child: _isLoading 
              ? const Center(child: CircularProgressIndicator())
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
                  itemCount: _stops.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, i) {
                    final stop = _stops[i];
                    return _StopCard(stop: stop, isDark: isDark, index: i);
                  },
                ),
          ),
        ],
      ),
    );
  }
}

class _StopCard extends StatelessWidget {
  final Map<String, dynamic> stop;
  final bool isDark;
  final int index;

  const _StopCard({required this.stop, required this.isDark, required this.index});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: () => context.go('${AppRoutes.stops}/detail?id=${stop['id']}&name=${stop['name']}'),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.primaryBlue.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.directions_bus_rounded, color: AppColors.primaryBlue, size: 20),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      stop['name'],
                      style: TextStyle(
                        fontFamily: 'Outfit',
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      stop['nameBn'] ?? '',
                      style: const TextStyle(fontFamily: 'Outfit', fontSize: 12, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.accentAmber.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      '${stop['buses']} buses',
                      style: const TextStyle(fontFamily: 'Outfit', fontSize: 11, color: AppColors.accentAmber, fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    stop['zone'] ?? 'Unknown',
                    style: const TextStyle(fontFamily: 'Outfit', fontSize: 10, color: AppColors.textHint),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ).animate().fadeIn(delay: (index * 60).ms, duration: 350.ms).slideX(begin: 0.05, end: 0);
  }
}
