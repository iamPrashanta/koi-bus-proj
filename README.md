# Koi Bus

> A smart, minimal, offline-first bus journey planner and companion app built with Flutter — designed for commuters in West Bengal.

Koi Bus helps daily commuters search bus routes, plan journeys, discover nearby stops, and view live tracking and transit reports — all with a calm, distraction-free experience. The app works completely offline using pre-packaged SQLite databases and caches user data locally.

---

## ✨ Features

### 🚌 Bus Journey Planning & Tracking

| Feature | Details |
|---|---|
| **Journey Planner** | Plan routes from origin to destination across West Bengal |
| **Live Tracking** | Track bus positions, ETA, and transit states in real-time |
| **Stop Discovery** | Find nearby bus stops using Geolocator and bounding box searches |
| **Search** | Advanced stop and route search using FTS5 (Full-Text Search) in SQLite |
| **Favorites** | Save routes and frequent journeys locally for quick access |
| **Reports** | Submit and view user-generated bus updates and transit reports |

### 📊 Dashboard & Insights

- **Home Launchpad** — Summary cards showing active routes, nearby stops, and favorite journeys
- **Recent Transit Feed** — Chronological timeline of searched and planned routes
- **Interactive Map/List** — Toggle views between nearby stops lists and routes
- **Zone Filtering** — Filter routes and stops by West Bengal administrative zones

### ⏱️ Transit Timers & Alerts

- **Active Commute Alerts** — Timers and notifications for upcoming bus arrivals
- **Active Session Tracking** — Persistent route calculations while navigating across screens
- **Offline Mode Indicator** — Clearly alerts the user when using cached database vs live network updates

### 🔒 Security & Privacy

- **Secure Local Storage** — Offline settings, favorite routes, and history stored locally
- No unnecessary tracking or third-party analytics by default

### 📁 Offline Database

- **Pre-packaged SQLite DB** — Comes bundled with a seeding script to deploy a complete database of West Bengal stops, routes, and schedules on initial startup
- **Fast Local Search** — Near zero-latency searching using pre-compiled native SQLite queries

### 🎨 App Customization

- **Dark / Light / System Theme** — Full dark mode support using clean Material 3 designs
- **Clean UI & Animations** — Styled with Google Fonts (Outfit) and micro-animations via `flutter_animate`

---

## 🧸 Product Vision

Koi Bus is being built to become:

- A **comprehensive bus router** for the West Bengal transport network (SBSTC, NBSTC, WBTC, private buses)
- A **commuter companion** with live crowdsourced updates
- A **reliability benchmark** in offline-first transit mapping

---

## 📱 Screens

| Screen | Description |
|---|---|
| **Splash** | App initialization, database loading, and routing |
| **Home (Launchpad)** | Dashboard with quick-search, favorites, and nearby stops |
| **Search** | Quick Search screen for stops and routes using FTS5 |
| **Planner** | Form to enter source, destination, and optimize bus routes |
| **Planner Results** | List of suggested routes with interchanges and fares |
| **Live Tracking** | Map and list overview of real-time bus locations |
| **Nearby Stops** | Bounding-box location-based stop finder |
| **Routes Detail** | In-depth breakdown of individual bus routes, stops, and schedules |
| **Reports** | Crowd-sourced transit reports dashboard |
| **Favorites** | Quick access to starred journeys and stops |
| **Settings** | Configuration for themes, database updates, and local parameters |

---

# Deep Dive Architecture Guide

This section explains every technology, pattern, and design decision in Koi Bus.

---

## What is Flutter?

Flutter is Google's open-source framework for building apps that run on multiple platforms from a single codebase.

One codebase produces:
- Android App
- iOS App

Koi Bus currently targets **Android** and **iOS**.

---

## What is Dart?

Dart is Google's programming language used to write Flutter apps.

Key characteristics:
- **Strongly typed** — Variables have explicit types
- **Async/await** — Native asynchronous flow support (database, location querying)
- **Null safety** — Compile-time null checks prevent runtime errors

---

## What is Riverpod?

Riverpod is the state management system used in Koi Bus. It functions as the app's centralized state coordinator, ensuring consistent and reactive state distribution across multiple screens.

---

## What is Hive?

Hive is a lightweight, fast, local NoSQL database used to store settings, user preferences, and favorites in Koi Bus.

---

## What is SQLite (sqflite)?

For heavy search operations, stop directories, and routing tables, Koi Bus utilizes **SQLite**. This relational database allows full SQL query capability, enabling complex features like geographic bounding box searches and FTS5 text indexes.

---

## 🛠 Tech Stack

### Frontend
- **Flutter** (SDK `>=3.12.0`)
- **Material 3** design system
- **Google Fonts** (`Outfit` family)
- **flutter_animate** for micro-animations
- **cupertino_icons** for native iOS styling

### State Management
- **Riverpod** (`flutter_riverpod ^2.6.1`)

### Routing
- **GoRouter** (`^14.6.2`)

### Local Storage & Database
- **SQLite** (`sqflite ^2.4.2`) — Relational database for stop lists and transit routes
- **Hive** (`hive_flutter ^1.1.0`) — Key-value local NoSQL database for configurations and favorites
- **path** (`^1.9.1`) — Platform-agnostic file path operations

### Utilities
- **geolocator** (`^14.0.2`) — Location querying for nearby bus stops
- **shared_preferences** (`^2.3.4`) — Persistent settings storage
- **intl** (`^0.20.2`) — Text parsing and date/time formatting

---

## 🧠 Architecture

Koi Bus follows a **feature-first folder structure** aligned with clean architecture separations.

```
Presentation Layer (UI & Controllers)
│
├── Screens        → Full screens the user navigates to (GoRouter mapped)
├── Widgets        → Reusable modular components
└── Providers      → Riverpod controllers exposing app state

Domain & Data Layer (Core logic and storage)
│
├── DatabaseHelper → SQLite operations (FTS5 search, query optimizations)
├── Hive Boxes     → Fast access caches for settings and user bookmarks
└── Services       → Background actions (Location, native triggers)
```

### Folder Structure Overview

```
lib/
├── core/                    # Shared infrastructure
│   ├── database/            # DatabaseHelper (SQLite asset setup, queries, FTS5)
│   ├── router/              # GoRouter navigation configuration
│   ├── services/            # Background modules (LocationService)
│   ├── theme/               # Application-wide color schemes and theme models
│   └── widgets/             # Global reusable components
│
├── features/                # Domain-specific feature modules
│   ├── favorites/           # Favorite journeys and stops
│   ├── home/                # Main dashboard screens and shell
│   ├── live_tracking/       # Real-time vehicle positions
│   ├── nearby/              # Location-based stop discovery
│   ├── planner/             # Inter-stop route calculation
│   ├── reports/             # Transmit update submissions
│   ├── routes/              # Route databases and listings
│   ├── search/              # FTS5 stop/route search features
│   ├── settings/            # Application preferences settings
│   └── stops/               # Bus stop listings and metadata
│
└── main.dart                # Application entry point
```

---

## 🚀 Startup Lifecycle

1. **Flutter Initialized**: Calls `WidgetsFlutterBinding.ensureInitialized()` and `FlutterNativeSplash.preserve()`.
2. **Hive Init**: Initializes local settings storage (`Hive.initFlutter()`) and opens persistent configurations box.
3. **Database Seed & Init**: `DatabaseHelper` loads the precompiled sqlite database (`koibus.db`) from asset folder, copies it to local application folder if not initialized, and upgrades schema if required.
4. **App Launch**: Removes native splash screen and starts `KoiBusApp`.

---

## 🚀 Getting Started

### Prerequisites

- Flutter SDK `>=3.12.0`
- Android Studio or VS Code with Flutter extension
- Android device / Emulator or iOS device / Simulator

### Installation

```bash
git clone https://github.com/iamPrashanta/koi-bus-apk.git
cd koi-bus-apk
flutter pub get
```

### Run the App

```bash
flutter run
```

### Build APK (Release Mode)

To generate an optimized build for Android, run:

```bash
flutter build apk --release --split-per-abi
```
