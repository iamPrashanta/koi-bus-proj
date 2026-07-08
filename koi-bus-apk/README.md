# 🚌 Koi Bus — Flutter APK

The Android/iOS mobile application for the Koi Bus platform. Built with Flutter, it serves as the passenger and operator application for smart bus journey planning and live tracking in West Bengal.

---

## Features

- **Offline-First Planner:** Ships with a bundled SQLite database (`koibus.db`) containing routes, stops, and schedule graphs. Basic routing and stop lookups work completely offline.
- **Live Telemetry:** Connects to the Node.js API WebSocket (Port 4000) to stream real-time bus locations and speeds.
- **User Authentication:** Integrates with the backend JWT authentication flow.
- **System Health:** Includes a diagnostic screen to check local SQLite database versioning and to ping the Python Microservices.

## Architecture

| Layer | Technology |
|---|---|
| UI Framework | Flutter (Dart) |
| State Management| Riverpod |
| Routing | GoRouter |
| Local Storage | sqflite (bundled assets), flutter_secure_storage |
| Network | http, socket_io_client |

---

## Prerequisites

- **Flutter SDK:** ^3.12.0
- **Android Studio / Xcode:** For emulator/simulator testing.

---

## Quick Start

### 1. Install Dependencies

```bash
flutter pub get
```

### 2. Configure API Endpoint

The app automatically configures its base URL depending on your environment:
- **Web:** `http://localhost:4000`
- **Android Emulator:** `http://10.0.2.2:4000`
- **iOS Simulator:** `http://localhost:4000`

If you are running on a **Physical Device** (as we do for production testing), we have hardcoded the `ApiConfig.baseUrl` in `lib/core/api/api_config.dart` to point to the local Wi-Fi host IP (`192.168.1.5`). Ensure your testing device is on the same network.

### 3. Run the App

```bash
flutter run
```

---

## Testing the API Integration

To test the live tracking, login flows, and Python Microservices, you must have the backend services running:

1. Go to the project root and run `.\scripts\windows\start_servers.bat` (or `.sh` on Linux). This automatically boots the databases, Node API (4000), Next.js Web (4001), Python Analytics (8001), and Python Importer (8002).
2. Run the Flutter app on your device or emulator.
3. Log in with a test account (e.g., Phone: `4444444444`, Password: `password123`).
4. Navigate to the **Live** tab to see real-time Socket.IO telemetry and cached map tiles.
5. Navigate to the **DB Health** tab to ping the running Python Microservices directly.

---

## Build for Release

### Android APK

Because of a known Kotlin incremental compiler bug on Windows (when crossing drives), you should **always** build the APK using our automated script from the project root:

**Windows:**
```cmd
.\scripts\windows\build_apk.bat
```

**Linux:**
```bash
./scripts/linux/build_apk.sh
```

This script sets a local `PUB_CACHE` and safely compiles the app. The output file will be located at `build/app/outputs/flutter-apk/app-release.apk`.
