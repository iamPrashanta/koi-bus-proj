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

We have built fully automated orchestration scripts located in the `scripts/` directory to manage all backend services and mobile compilation simultaneously. 

### Windows Native (CMD / PowerShell)
If you are developing on a Windows machine, do **not** use WSL. Use the provided batch scripts which automatically configure ports, detect Docker/Podman, and open the Node/Python servers in separate windows.
```cmd
# Boot up the database and all 4 backend servers
.\scripts\windows\start_servers.bat

# Safely kill all servers and shut down the database containers
.\scripts\windows\stop_servers.bat

# Compile the Flutter APK (with automated pathing bugfixes)
.\scripts\windows\build_apk.bat
```

### Linux (Arch, Ubuntu, Fedora)
The project ships with POSIX-compliant shell scripts designed to run on any native Linux installation. 

If you want to run this natively on **Arch Linux** (or any other distro):
1. **Transfer the Code:** Clone or copy this repository to your Linux machine.
2. **Install Prerequisites:** Ensure the core tooling is installed. For example, on Arch:
   ```bash
   sudo pacman -S nodejs npm python python-pip docker podman lsof psmisc
   ```
   *(Note: You will also need to install the Flutter SDK if you plan on compiling the APK).*
3. **Make Scripts Executable:** Ensure the scripts have run permissions:
   ```bash
   chmod +x scripts/linux/*.sh
   ```
4. **Run the Orchestration:** The scripts will automatically detect your service manager (`systemctl`) and launch everything in the background.
   ```bash
   # Boot up database and all backend servers in the background
   ./scripts/linux/start_servers.sh

   # Safely terminate all background servers and containers
   ./scripts/linux/stop_servers.sh
   
   # Compile the Flutter APK
   ./scripts/linux/build_apk.sh
   ```

*See the individual README files linked above for detailed, step-by-step installation instructions and environment variable templates.*
