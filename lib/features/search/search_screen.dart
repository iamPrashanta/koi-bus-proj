import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_colors.dart';
import '../../core/router/app_router.dart';
import '../../core/database/db_helper.dart';
import '../planner/journey_planner.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  Map<String, dynamic>? _fromStop;
  Map<String, dynamic>? _toStop;
  bool _hasResults = false;
  String _filterType = 'All';

  final TextEditingController _fromController = TextEditingController();
  final TextEditingController _toController = TextEditingController();
  
  List<Map<String, dynamic>> _allStops = [];
  bool _isLoadingStops = true;

  @override
  void initState() {
    super.initState();
    _loadStops();
    
    // Check if query params were passed from Home
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final queryParams = GoRouterState.of(context).uri.queryParameters;
      if (queryParams.containsKey('from') && queryParams.containsKey('to')) {
        _fromController.text = queryParams['from']!;
        _toController.text = queryParams['to']!;
        _tryMatchStops();
      }
    });
  }

  Future<void> _loadStops() async {
    final db = DatabaseHelper.instance;
    final stops = await db.getAllStopsByZone('All');
    if (mounted) {
      setState(() {
        _allStops = stops;
        _isLoadingStops = false;
      });
      _tryMatchStops();
    }
  }

  void _tryMatchStops() {
    if (_allStops.isEmpty) return;
    
    final fromName = _fromController.text.toLowerCase();
    final toName = _toController.text.toLowerCase();
    
    if (fromName.isNotEmpty) {
      final matches = _allStops.where((s) => s['name'].toLowerCase() == fromName || s['name'].toLowerCase().contains(fromName));
      if (matches.isNotEmpty) _fromStop = matches.first;
    }
    
    if (toName.isNotEmpty) {
      final matches = _allStops.where((s) => s['name'].toLowerCase() == toName || s['name'].toLowerCase().contains(toName));
      if (matches.isNotEmpty) _toStop = matches.first;
    }
    
    setState(() {
      _hasResults = _fromStop != null && _toStop != null;
    });
  }

  @override
  void dispose() {
    _fromController.dispose();
    _toController.dispose();
    super.dispose();
  }

  void _swapStops() {
    setState(() {
      final tempStop = _fromStop;
      _fromStop = _toStop;
      _toStop = tempStop;
      
      final tempText = _fromController.text;
      _fromController.text = _toController.text;
      _toController.text = tempText;
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Search Routes'),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded),
            onPressed: _showFilterSheet,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search inputs
          Container(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            color: isDark ? AppColors.backgroundDark : AppColors.backgroundLight,
            child: Column(
              children: [
                _buildAutocompleteRow(
                  controller: _fromController,
                  hint: 'From stop',
                  icon: Icons.radio_button_checked_rounded,
                  iconColor: AppColors.successGreen,
                  isDark: isDark,
                  onSelected: (stop) {
                    setState(() {
                      _fromStop = stop;
                      _hasResults = _fromStop != null && _toStop != null;
                    });
                  },
                ),
                
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 12),
                  child: Row(
                    children: [
                      Container(width: 1.5, height: 24, color: AppColors.surfaceBorder),
                      const SizedBox(width: 12),
                      GestureDetector(
                        onTap: _swapStops,
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: BoxDecoration(
                            color: isDark ? AppColors.surfaceElevated : AppColors.backgroundLight,
                            shape: BoxShape.circle,
                            border: Border.all(color: isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight),
                          ),
                          child: const Icon(Icons.swap_vert_rounded, size: 16, color: AppColors.textSecondary),
                        ),
                      ),
                    ],
                  ),
                ),
                
                _buildAutocompleteRow(
                  controller: _toController,
                  hint: 'To stop',
                  icon: Icons.location_on_rounded,
                  iconColor: AppColors.errorRed,
                  isDark: isDark,
                  onSelected: (stop) {
                    setState(() {
                      _toStop = stop;
                      _hasResults = _fromStop != null && _toStop != null;
                    });
                  },
                ),
                const SizedBox(height: 14),
                // Filter chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: ['All', 'AC', 'Non-AC', 'WBTC', 'CSTC', 'NBSTC', 'Private'].map((f) {
                      final selected = _filterType == f;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: GestureDetector(
                          onTap: () => setState(() => _filterType = f),
                          child: AnimatedContainer(
                            duration: 200.ms,
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
                            decoration: BoxDecoration(
                              color: selected ? AppColors.primaryBlue : (isDark ? AppColors.surfaceCard : Colors.white),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: selected ? AppColors.primaryBlue : (isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight),
                                width: 0.8,
                              ),
                            ),
                            child: Text(
                              f,
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
              ],
            ),
          ),

          Divider(height: 0, color: isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight),

          // Results
          Expanded(
            child: !_hasResults
                ? _EmptyState()
                : _JourneyPlannerResults(
                    fromStopId: _fromStop!['id'],
                    toStopId: _toStop!['id'],
                    isDark: isDark,
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildAutocompleteRow({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    required Color iconColor,
    required bool isDark,
    required Function(Map<String, dynamic>) onSelected,
  }) {
    return RawAutocomplete<Map<String, dynamic>>(
      textEditingController: controller,
      focusNode: FocusNode(),
      displayStringForOption: (option) => option['name'],
      optionsBuilder: (TextEditingValue textEditingValue) {
        if (textEditingValue.text.isEmpty) {
          return const Iterable<Map<String, dynamic>>.empty();
        }
        return _allStops.where((stop) {
          return stop['name'].toString().toLowerCase().contains(textEditingValue.text.toLowerCase()) ||
                 (stop['nameBn']?.toString().contains(textEditingValue.text) ?? false);
        });
      },
      onSelected: onSelected,
      fieldViewBuilder: (context, textEditingController, focusNode, onFieldSubmitted) {
        return TextField(
          controller: textEditingController,
          focusNode: focusNode,
          style: TextStyle(
            fontFamily: 'Outfit',
            fontSize: 14,
            color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight,
          ),
          decoration: InputDecoration(
            hintText: hint,
            prefixIcon: Icon(icon, color: iconColor, size: 18),
            suffixIcon: textEditingController.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear_rounded, size: 16), 
                    onPressed: () {
                      textEditingController.clear();
                      setState(() {
                        if (hint.contains('From')) _fromStop = null;
                        if (hint.contains('To')) _toStop = null;
                        _hasResults = false;
                      });
                    }
                  )
                : null,
          ),
        );
      },
      optionsViewBuilder: (context, onSelected, options) {
        return Align(
          alignment: Alignment.topLeft,
          child: Material(
            elevation: 4,
            borderRadius: BorderRadius.circular(12),
            color: isDark ? AppColors.surfaceCard : Colors.white,
            child: SizedBox(
              height: 200,
              width: MediaQuery.of(context).size.width - 32,
              child: ListView.builder(
                padding: EdgeInsets.zero,
                itemCount: options.length,
                itemBuilder: (context, index) {
                  final option = options.elementAt(index);
                  return ListTile(
                    title: Text(option['name'], style: TextStyle(color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight)),
                    subtitle: Text(option['zone'] ?? '', style: const TextStyle(fontSize: 11, color: AppColors.textHint)),
                    onTap: () => onSelected(option),
                  );
                },
              ),
            ),
          ),
        );
      },
    );
  }

  void _showFilterSheet() {
    // Implement filter sheet...
    Navigator.pop(context);
  }
}

class _JourneyPlannerResults extends StatefulWidget {
  final String fromStopId;
  final String toStopId;
  final bool isDark;

  const _JourneyPlannerResults({
    required this.fromStopId,
    required this.toStopId,
    required this.isDark,
  });

  @override
  State<_JourneyPlannerResults> createState() => _JourneyPlannerResultsState();
}

class _JourneyPlannerResultsState extends State<_JourneyPlannerResults> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _journeyLegs = [];

  @override
  void initState() {
    super.initState();
    _planJourney();
  }

  @override
  void didUpdateWidget(_JourneyPlannerResults oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.fromStopId != widget.fromStopId || oldWidget.toStopId != widget.toStopId) {
      _planJourney();
    }
  }

  Future<void> _planJourney() async {
    setState(() => _isLoading = true);
    
    final db = DatabaseHelper.instance;
    final planner = JourneyPlanner(db);
    
    final results = await planner.findJourney(widget.fromStopId, widget.toStopId);
    
    if (mounted) {
      setState(() {
        _journeyLegs = results;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());
    
    if (_journeyLegs.isEmpty) {
      return const Center(child: Text('No routes found between these stops.'));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: _journeyLegs.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, i) {
        return _RouteResultCard(
          route: _journeyLegs[i], 
          isDark: widget.isDark,
          onTap: () {
            context.push('${AppRoutes.journeyDetail}?from=${widget.fromStopId}&to=${widget.toStopId}');
          },
        ).animate().fadeIn(delay: (i * 80).ms, duration: 400.ms).slideY(begin: 0.1, end: 0);
      },
    );
  }
}

class _RouteResultCard extends StatelessWidget {
  final Map<String, dynamic> route;
  final bool isDark;
  final VoidCallback onTap;

  const _RouteResultCard({required this.route, required this.isDark, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isAC = route['type'] == 'AC';
    final operatorColor = route['operator'] == 'WBTC' ? AppColors.wbtcColor
        : route['operator'] == 'CSTC' ? AppColors.cstcColor
        : AppColors.nbstcColor;

    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(color: operatorColor, borderRadius: BorderRadius.circular(8)),
                    child: Text(route['number'], style: const TextStyle(fontFamily: 'Outfit', color: Colors.white, fontSize: 14, fontWeight: FontWeight.w700)),
                  ),
                  const SizedBox(width: 8),
                  if (isAC)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.infoBlue.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(5),
                        border: Border.all(color: AppColors.infoBlue.withOpacity(0.3)),
                      ),
                      child: const Text('AC', style: TextStyle(fontFamily: 'Outfit', fontSize: 11, color: AppColors.infoBlue, fontWeight: FontWeight.w600)),
                    ),
                  const Spacer(),
                  Row(
                    children: [
                      const Icon(Icons.schedule_rounded, size: 13, color: AppColors.textSecondary),
                      const SizedBox(width: 4),
                      Text(route['duration'], style: const TextStyle(fontFamily: 'Outfit', fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.route_rounded, size: 13, color: AppColors.textHint),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      'Via ${route['via']}',
                      style: TextStyle(fontFamily: 'Outfit', fontSize: 12, color: isDark ? AppColors.textSecondary : AppColors.textSecondaryLight),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Text(route['operator'], style: TextStyle(fontFamily: 'Outfit', fontSize: 11, color: operatorColor, fontWeight: FontWeight.w500)),
                  const SizedBox(width: 12),
                  Text('${route['stops']} stops', style: const TextStyle(fontFamily: 'Outfit', fontSize: 11, color: AppColors.textHint)),
                  const Spacer(),
                  TextButton(
                    onPressed: onTap,
                    style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4), minimumSize: Size.zero),
                    child: const Text('View stops →', style: TextStyle(fontFamily: 'Outfit', fontSize: 12)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.search_rounded, size: 64, color: AppColors.textHint),
          const SizedBox(height: 16),
          const Text('Enter stops to find buses', style: TextStyle(fontFamily: 'Outfit', fontSize: 16, color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          const Text('e.g. Esplanade → Howrah Station', style: TextStyle(fontFamily: 'Outfit', fontSize: 13, color: AppColors.textHint)),
        ],
      ).animate().fadeIn(duration: 400.ms),
    );
  }
}

class _FilterSheet extends StatelessWidget {
  const _FilterSheet();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Filter Routes', style: TextStyle(fontFamily: 'Outfit', fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 20),
          const Text('Bus Type', style: TextStyle(fontFamily: 'Outfit', fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            children: ['All', 'AC', 'Non-AC', 'Mini Bus'].map((t) => FilterChip(
              label: Text(t),
              selected: t == 'All',
              onSelected: (_) {},
            )).toList(),
          ),
          const SizedBox(height: 20),
          const Text('Operator', style: TextStyle(fontFamily: 'Outfit', fontSize: 13, color: AppColors.textSecondary)),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            children: ['WBTC', 'CSTC', 'NBSTC', 'Private'].map((o) => FilterChip(
              label: Text(o),
              selected: false,
              onSelected: (_) {},
            )).toList(),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Apply Filters'),
            ),
          ),
        ],
      ),
    );
  }
}
