import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/database/db_helper.dart';
import '../../core/database/saved_route.dart';
import '../../core/database/saved_route_service.dart';
import 'journey_planner.dart';

class JourneyDetailScreen extends ConsumerStatefulWidget {
  final String fromStopId;
  final String toStopId;

  const JourneyDetailScreen({
    super.key,
    required this.fromStopId,
    required this.toStopId,
  });

  @override
  ConsumerState<JourneyDetailScreen> createState() => _JourneyDetailScreenState();
}

class _JourneyDetailScreenState extends ConsumerState<JourneyDetailScreen> {
  bool _isLoading = true;
  List<Map<String, dynamic>> _legs = [];
  Map<String, dynamic>? _fromStopDetails;
  Map<String, dynamic>? _toStopDetails;

  @override
  void initState() {
    super.initState();
    _loadJourney();
  }

  Future<void> _loadJourney() async {
    setState(() => _isLoading = true);
    
    final db = DatabaseHelper.instance;
    final planner = JourneyPlanner(db);
    
    final database = await db.database;
    final fromList = await database.query('stops', where: 'id = ?', whereArgs: [widget.fromStopId]);
    final toList = await database.query('stops', where: 'id = ?', whereArgs: [widget.toStopId]);
    
    if (fromList.isNotEmpty) _fromStopDetails = fromList.first;
    if (toList.isNotEmpty) _toStopDetails = toList.first;

    final results = await planner.findJourney(widget.fromStopId, widget.toStopId);
    
    if (mounted) {
      setState(() {
        _legs = results;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final opColor = isDark ? AppColors.wbtcColor : AppColors.wbtcColor.withOpacity(0.9);

    final fromName = _fromStopDetails?['name'] ?? 'Origin';
    final toName = _toStopDetails?['name'] ?? 'Destination';

    final isSaved = ref.watch(savedRoutesProvider.notifier).isSaved(widget.fromStopId, widget.toStopId);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 160,
            pinned: true,
            iconTheme: const IconThemeData(color: Colors.white),
            actions: [
              IconButton(
                icon: Icon(isSaved ? Icons.bookmark_rounded : Icons.bookmark_border_rounded, color: Colors.white),
                onPressed: () {
                  if (isSaved) {
                    final savedList = ref.read(savedRoutesProvider);
                    final route = savedList.firstWhere((r) => r.fromId == widget.fromStopId && r.toId == widget.toStopId);
                    ref.read(savedRoutesProvider.notifier).deleteRoute(route.id);
                  } else {
                    final id = '${widget.fromStopId}_${widget.toStopId}';
                    ref.read(savedRoutesProvider.notifier).saveRoute(
                      SavedRoute(
                        id: id,
                        fromId: widget.fromStopId,
                        fromName: fromName,
                        toId: widget.toStopId,
                        toName: toName,
                        savedAt: DateTime.now(),
                      ),
                    );
                  }
                  setState(() {});
                },
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      isDark ? AppColors.backgroundDark : AppColors.primaryBlue,
                      isDark ? AppColors.surfaceCard : AppColors.primaryBlue.withOpacity(0.8),
                    ],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 50, 20, 20),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '$fromName → $toName',
                          style: const TextStyle(fontFamily: 'Outfit', color: Colors.white, fontSize: 22, fontWeight: FontWeight.w700),
                        ),
                        const SizedBox(height: 6),
                        Row(
                          children: [
                            const Icon(Icons.schedule_rounded, color: Colors.white70, size: 14),
                            const SizedBox(width: 4),
                            Text('${_legs.isEmpty ? '-' : _legs.length} transfers', style: const TextStyle(fontFamily: 'Outfit', color: Colors.white70, fontSize: 13)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(20),
            sliver: _isLoading 
              ? const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
              : _legs.isEmpty
                ? const SliverFillRemaining(child: Center(child: Text('No routes found.')))
                : SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, i) {
                        final leg = _legs[i];
                        final isLast = i == _legs.length - 1;

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _JourneyLegCard(leg: leg, isDark: isDark, opColor: opColor, index: i),
                            if (!isLast)
                              _TransferIndicator(transferStop: leg['to'].toString(), isDark: isDark),
                          ],
                        );
                      },
                      childCount: _legs.length,
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _JourneyLegCard extends StatelessWidget {
  final Map<String, dynamic> leg;
  final bool isDark;
  final Color opColor;
  final int index;

  const _JourneyLegCard({required this.leg, required this.isDark, required this.opColor, required this.index});

  @override
  Widget build(BuildContext context) {
    if (leg['type'] == 'walk') {
      return Container(
        margin: const EdgeInsets.only(bottom: 16),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark ? AppColors.surfaceElevated : AppColors.backgroundLight,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.surfaceBorder, style: BorderStyle.solid),
        ),
        child: Row(
          children: [
            const Icon(Icons.directions_walk_rounded, color: AppColors.textSecondary),
            const SizedBox(width: 12),
            Expanded(child: Text(leg['instruction'], style: const TextStyle(fontFamily: 'Outfit', fontSize: 14))),
            Text(leg['duration'], style: const TextStyle(fontFamily: 'Outfit', fontSize: 12, color: AppColors.textHint)),
          ],
        ),
      );
    }

    final isAC = leg['busType'] == 'AC';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: isDark ? AppColors.surfaceCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          if (!isDark) BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: opColor,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
            ),
            child: Row(
              children: [
                const Icon(Icons.directions_bus_rounded, color: Colors.white, size: 18),
                const SizedBox(width: 8),
                Text(leg['number'] ?? '', style: const TextStyle(fontFamily: 'Outfit', color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700)),
                const SizedBox(width: 8),
                if (isAC)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(4)),
                    child: const Text('AC', style: TextStyle(fontFamily: 'Outfit', color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600)),
                  ),
                const Spacer(),
                Text(leg['duration'] ?? '', style: const TextStyle(fontFamily: 'Outfit', color: Colors.white, fontSize: 13)),
              ],
            ),
          ),
          // Content
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                _StopPoint(name: leg['from'] ?? '', time: 'Board', isDark: isDark, isStart: true),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 4),
                  child: Row(
                    children: [
                      Container(width: 2, height: 24, color: isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight),
                      const SizedBox(width: 24),
                      Text('${leg['stops']} stops', style: const TextStyle(fontFamily: 'Outfit', fontSize: 12, color: AppColors.textHint)),
                    ],
                  ),
                ),
                _StopPoint(name: leg['to'] ?? '', time: 'Alight', isDark: isDark, isStart: false),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _StopPoint extends StatelessWidget {
  final String name;
  final String time;
  final bool isDark;
  final bool isStart;

  const _StopPoint({required this.name, required this.time, required this.isDark, required this.isStart});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: isStart ? AppColors.successGreen.withOpacity(0.15) : AppColors.errorRed.withOpacity(0.15),
            shape: BoxShape.circle,
          ),
          child: Icon(
            isStart ? Icons.trip_origin_rounded : Icons.place_rounded,
            color: isStart ? AppColors.successGreen : AppColors.errorRed,
            size: 16,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Text(
            name,
            style: TextStyle(fontFamily: 'Outfit', fontSize: 15, fontWeight: FontWeight.w500, color: isDark ? AppColors.textPrimary : AppColors.textPrimaryLight),
          ),
        ),
        Text(time, style: const TextStyle(fontFamily: 'Outfit', fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w600)),
      ],
    );
  }
}

class _TransferIndicator extends StatelessWidget {
  final String transferStop;
  final bool isDark;

  const _TransferIndicator({required this.transferStop, required this.isDark});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 32, bottom: 16),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(6),
            decoration: BoxDecoration(
              color: isDark ? AppColors.surfaceElevated : AppColors.backgroundLight,
              shape: BoxShape.circle,
              border: Border.all(color: isDark ? AppColors.surfaceBorder : AppColors.surfaceBorderLight),
            ),
            child: const Icon(Icons.transfer_within_a_station_rounded, size: 14, color: AppColors.textSecondary),
          ),
          const SizedBox(width: 12),
          Text(
            'Transfer at $transferStop',
            style: const TextStyle(fontFamily: 'Outfit', fontSize: 13, color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}
