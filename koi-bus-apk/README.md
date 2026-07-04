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

If you are running on a **Physical Device**, you must update the `_host` variable in `lib/core/api/api_config.dart` to point to your computer's local IP address (e.g., `192.168.1.100`).

### 3. Run the App

```bash
flutter run
```

---

## Testing the API Integration

To test the live tracking and login flows, you must have the **Web Project** services running first:

1. Start the backend services in the `koi-bus-web` directory (`podman compose up -d` and `npm run dev` in `services/node-api`).
2. Run the Flutter app in an Android emulator.
3. Log in with a test account (e.g., Phone: `4444444444`, Password: `password123`).
4. Navigate to the **Live** tab to see real-time Socket.IO telemetry streaming.

### Python Microservices Check

To verify the app can talk to the Django Python services:
1. Start the Python Analytics (Port 8001) and Importer (Port 8002) services in the `koi-bus-web` directory.
2. In the Flutter app, navigate to the **DB Health** tab.
3. Scroll to the bottom and tap **Ping** on both services.

---

## Build for Release

### Android APK

```bash
flutter build apk --release
```
The output file will be located at `build/app/outputs/flutter-apk/app-release.apk`.
