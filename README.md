# 🚌 Koi Bus Project

Koi Bus is a comprehensive, real-time public bus tracking platform and journey planner for West Bengal.

This repository is a monorepo that contains two distinct projects that work together to form the complete ecosystem.

## 📂 Project Structure

### 1. [Web Services (`/koi-bus-web`)](./koi-bus-web/README.md)
The backend infrastructure and web portals.
- **Node.js REST API:** Express.js + Prisma backend managing users, trips, and telemetry.
- **Next.js Portals:** Web dashboards for passengers, drivers, and super-admins.
- **Python Microservices:** Django-based services for data analytics (`python-analytics`) and GTFS imports (`python-importer`).
- **Real-time:** Socket.IO for GPS telemetry and Redis for caching.
- **Database:** PostgreSQL running via Podman/Docker.

👉 **[View the Web Setup Guide & API Reference](./koi-bus-web/README.md)**

### 2. [Mobile Application (`/koi-bus-apk`)](./koi-bus-apk/README.md)
The cross-platform mobile application built with Flutter.
- **Offline-First Routing:** Ships with an embedded SQLite database for offline stop searches and route planning.
- **Live Tracking:** Connects to the Web API's Socket.IO server for real-time bus locations.
- **Authentication:** Fully integrated JWT auth flow with the Node.js backend.
- **System Health:** Includes diagnostic tools to ping the Python microservices directly from the mobile device.

👉 **[View the Flutter APK Setup Guide](./koi-bus-apk/README.md)**

---

## 🚀 Quick Start Overview

To get the full stack running locally, you generally need to start the web backend first, followed by the mobile app.

1. **Start the Database Containers** (in `koi-bus-web`)
   ```bash
   cd koi-bus-web
   podman compose up -d
   ```
2. **Start the API & Web Portals** (in `koi-bus-web`)
   ```bash
   ./start.sh
   # Or on Windows: .\start.ps1
   ```
3. **Run the Mobile App** (in `koi-bus-apk`)
   ```bash
   cd ../koi-bus-apk
   flutter pub get
   flutter run
   ```

*See the individual README files linked above for detailed, step-by-step installation instructions and environment variable templates.*
