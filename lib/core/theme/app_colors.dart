import 'package:flutter/material.dart';

/// Koi Bus — "Midnight Transit" color palette
/// Dark-first theme optimized for AMOLED displays
class AppColors {
  AppColors._();

  // === Primary Brand ===
  static const Color primaryBlue = Color(0xFF3B82F6);
  static const Color primaryBlueDark = Color(0xFF2563EB);
  static const Color primaryBlueLight = Color(0xFF60A5FA);

  // === Accent ===
  static const Color accentAmber = Color(0xFFF59E0B);
  static const Color accentAmberDark = Color(0xFFD97706);
  static const Color accentAmberLight = Color(0xFFFBBF24);

  // === Backgrounds (Dark Mode) ===
  static const Color backgroundDark = Color(0xFF0F172A);
  static const Color surfaceCard = Color(0xFF1E293B);
  static const Color surfaceElevated = Color(0xFF263248);
  static const Color surfaceBorder = Color(0xFF334155);

  // === Backgrounds (Light Mode) ===
  static const Color backgroundLight = Color(0xFFF1F5F9);
  static const Color surfaceCardLight = Color(0xFFFFFFFF);
  static const Color surfaceElevatedLight = Color(0xFFF8FAFC);
  static const Color surfaceBorderLight = Color(0xFFE2E8F0);

  // === Text (Dark) ===
  static const Color textPrimary = Color(0xFFF8FAFC);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textHint = Color(0xFF64748B);

  // === Text (Light) ===
  static const Color textPrimaryLight = Color(0xFF0F172A);
  static const Color textSecondaryLight = Color(0xFF475569);
  static const Color textHintLight = Color(0xFF94A3B8);

  // === Status Colors ===
  static const Color successGreen = Color(0xFF22C55E);
  static const Color errorRed = Color(0xFFEF4444);
  static const Color warningOrange = Color(0xFFF97316);
  static const Color infoBlue = Color(0xFF38BDF8);

  // === Operator Colors ===
  static const Color wbtcColor = Color(0xFF3B82F6);    // Blue — WBTC
  static const Color cstcColor = Color(0xFF8B5CF6);    // Purple — CSTC
  static const Color nbstcColor = Color(0xFF10B981);   // Green — NBSTC
  static const Color privateColor = Color(0xFFF59E0B); // Amber — Private

  // === Gradient Definitions ===
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryBlue, Color(0xFF6366F1)],
  );

  static const LinearGradient heroGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [backgroundDark, Color(0xFF111827)],
  );

  static const LinearGradient cardGlowGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1E293B), Color(0xFF1A2540)],
  );
}
