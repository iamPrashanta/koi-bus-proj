class SavedRoute {
  final String id;
  final String? label; // e.g., 'Home', 'Work'
  final String fromId;
  final String fromName;
  final String toId;
  final String toName;
  final DateTime savedAt;

  SavedRoute({
    required this.id,
    this.label,
    required this.fromId,
    required this.fromName,
    required this.toId,
    required this.toName,
    required this.savedAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'label': label,
      'fromId': fromId,
      'fromName': fromName,
      'toId': toId,
      'toName': toName,
      'savedAt': savedAt.toIso8601String(),
    };
  }

  factory SavedRoute.fromMap(Map<dynamic, dynamic> map) {
    return SavedRoute(
      id: map['id'],
      label: map['label'],
      fromId: map['fromId'],
      fromName: map['fromName'],
      toId: map['toId'],
      toName: map['toName'],
      savedAt: DateTime.parse(map['savedAt']),
    );
  }
}
