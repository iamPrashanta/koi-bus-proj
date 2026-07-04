# 🚌 Koi Bus

Real-time public bus tracking platform for West Bengal. A full-stack monorepo with a Next.js passenger/driver/admin portal, a Node.js REST + WebSocket API, and live GPS telemetry streaming.

---

## Table of Contents

- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Setup](#manual-setup)
- [Environment Variables](#environment-variables)
- [Port Map](#port-map)
- [Test Accounts](#test-accounts)
- [API Reference](#api-reference)
- [QA & Testing](#qa--testing)
- [Telemetry Emulator](#telemetry-emulator)
- [Database Seeding](#database-seeding)

---

## Architecture

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Shadcn/UI |
| Backend | Node.js 22+, Express.js, TypeScript |
| ORM | Prisma 5 |
| Database | PostgreSQL 16 |
| Cache / Pub-Sub | Redis 7 |
| Realtime | Socket.IO |
| Containers | Podman (compose) |
| Backend Pattern | Controller → Service → Repository → Prisma |

```
Browser
  ↓  HTTP / WebSocket
Next.js  :4001   →   Node.js API  :4000
                            ↓
                     PostgreSQL :15432
                     Redis      :16379
```

---

## Project Structure

```
koi-bus/
├── apps/
│   └── web/                        # Next.js 16 frontend
│       ├── src/
│       │   ├── app/                # App Router pages
│       │   │   ├── (public)/       # Login, Signup (unauthenticated)
│       │   │   ├── admin/          # Admin / Bus Owner portal
│       │   │   ├── driver/         # Driver portal
│       │   │   └── passenger/      # Passenger portal
│       │   ├── components/         # Shared UI components
│       │   │   ├── shared/         # UserMenu, AuthProvider, etc.
│       │   │   └── ui/             # Shadcn primitives
│       │   ├── lib/                # API client, utilities
│       │   ├── stores/             # Zustand auth store
│       │   └── types.ts            # Shared frontend types
│       └── .env.local              # Frontend env (see below)
│
├── services/
│   └── node-api/                   # Express.js REST API
│       ├── src/
│       │   ├── modules/            # Feature modules
│       │   │   ├── auth/           # Auth, JWT, sessions
│       │   │   ├── buses/          # Fleet management
│       │   │   ├── driver/         # Driver assignment
│       │   │   ├── operators/      # Operator CRUD
│       │   │   ├── routes/         # Bus routes
│       │   │   ├── stops/          # Bus stops
│       │   │   ├── trips/          # Live trip sessions
│       │   │   ├── telemetry/      # GPS ingestion + Socket.IO
│       │   │   ├── search/         # Route search (graph-based)
│       │   │   ├── fares/          # Fare management
│       │   │   ├── reports/        # Reports
│       │   │   └── health/         # Health check endpoint
│       │   ├── middleware/         # Auth, RBAC, error handling
│       │   ├── config/             # Redis, Prisma singletons
│       │   └── types/              # Express type extensions
│       ├── prisma/
│       │   ├── schema.prisma       # Database schema
│       │   ├── migrations/         # Prisma migration history
│       │   ├── seed.ts             # Standard seed (4 base users)
│       │   └── seed-e2e.ts         # E2E seed (full trip data)
│       ├── tools/
│       │   └── telemetry-device-emulator.ts  # GPS emulator CLI
│       └── .env                    # Backend env (see below)
│
├── qa/                             # Playwright test suites
│   ├── e2e/                        # Functional E2E tests
│   ├── chaos/                      # Chaos tests (Redis/network)
│   ├── performance/                # Load & memory tests
│   ├── security/                   # RBAC & auth security tests
│   ├── fixtures/                   # Shared test fixtures
│   ├── helpers/                    # Test helper functions
│   └── playwright.config.ts
│
├── data/
│   └── routes/                     # GeoJSON route files for emulator
│
├── transport-data/                 # Raw West Bengal GTFS-like data
│   ├── routes/
│   ├── stops/
│   ├── fares/
│   └── operators/
│
├── docs/                           # Architecture design documents
├── scripts/                        # Dev utility scripts
├── compose.yml                     # Podman Compose (DB + Redis)
├── start.ps1                       # Windows one-command launcher
└── start.sh                        # Linux/macOS one-command launcher
```

---

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | 22+ | Use `node --version` to check |
| npm | 10+ | Bundled with Node 22 |
| Podman | 4+ | Or Docker (see note below) |
| podman-compose | Latest | `pip install podman-compose` |

> **Docker users:** Replace `podman` with `docker` and `podman compose` with `docker compose` throughout. The `compose.yml` is compatible with both.

---

## Quick Start

### Windows (PowerShell)

```powershell
.\start.ps1           # Start all services
.\start.ps1 -Stop     # Stop all services
.\start.ps1 -Status   # Check running status
```

### Linux / macOS

```bash
chmod +x start.sh
./start.sh            # Start all services
./start.sh --stop     # Stop all services
./start.sh --status   # Check running status
```

The launcher starts services in this order:

```
1. Podman containers  (PostgreSQL :15432, Redis :16379)
2. Node.js API        http://localhost:4000
3. Next.js Frontend   http://localhost:4001
4. Python Analytics   http://localhost:8001 (Django)
5. Python Importer    http://localhost:8002 (Django)
```

---

## Manual Setup

Use this if you want full control over each service or are running on CI.

---

### Step 1 — Set Up Environment Files

> ⚠️ Do this **before** starting any service. These files are git-ignored and must be created manually.

**Backend** — copy the example and edit if needed:

```bash
cd services/node-api
cp .env.example .env
```

The default `.env` values work out-of-the-box with the `compose.yml` containers. No edits required for local development.

**Frontend** — copy the example:

```bash
cd apps/web
cp .env.example .env.local
```

---

### Step 2 — Install Dependencies

```bash
# Backend
cd services/node-api
npm install

# Frontend
cd ../../apps/web
npm install

# QA test suite (optional)
cd ../../qa
npm install
```

---

### Step 3 — Start Containers (PostgreSQL + Redis)

The project uses **Podman** (Docker-compatible). Run from the **project root** where `compose.yml` lives.

```bash
# Start PostgreSQL and Redis in the background
podman compose up -d

# Verify both containers are running
podman compose ps
```

Expected output:

```
CONTAINER ID  NAME              STATUS
...           koi_bus_db_20_06  Up (healthy)
...           koi_bus_redis     Up
```

**Container details from `compose.yml`:**

| Container | Image | Host Port | Internal Port |
|---|---|---|---|
| `koi_bus_db_20_06` | `postgres:16-alpine` | `15432` | `5432` |
| `koi_bus_redis` | `redis:7-alpine` | `16379` | `6379` |

**Useful container commands:**

```bash
# Stop containers (keeps data volumes)
podman compose stop

# Stop and remove containers (keeps data volumes)
podman compose down

# Stop and remove containers AND wipe all data
podman compose down -v

# View container logs
podman compose logs postgres
podman compose logs redis

# Restart a single container
podman compose restart postgres
```

> **Docker users:** Replace `podman` with `docker` and `podman compose` with `docker compose`. Everything else is identical.

---

### Step 4 — Run Database Migrations

Prisma manages the schema. Run migrations after first setup or whenever new migrations are added.

```bash
cd services/node-api

# Apply all pending migrations to the database
npm run prisma:migrate
```

This command will:
1. Connect to PostgreSQL at `localhost:15432`
2. Create the `koi_bus_db` database if it doesn't exist
3. Apply all migration files from `prisma/migrations/` in order
4. Generate the Prisma client

**Other migration commands:**

```bash
# View migration history and pending status
npx prisma migrate status

# Create a new migration after editing schema.prisma
npx prisma migrate dev --name describe_your_change

# Apply migrations without interactive prompts (CI/production)
npm run prisma:deploy

# Reset the entire database (drops + recreates + re-applies all migrations)
npm run prisma:reset

# Open Prisma Studio — visual database browser at http://localhost:5555
npm run prisma:studio
```

> ⚠️ `prisma:reset` **destroys all data**. Do not use in production.

---

### Step 5 — Seed the Database

```bash
cd services/node-api

# Standard seed — creates 4 base users (clears all existing data first)
npm run db:seed

# E2E seed — upserts a complete operator, driver, passenger, bus, route, and trip
# (safe to run multiple times — uses upsert, does NOT clear data)
npm run seed:e2e
```

> ⚠️ `db:seed` **truncates all tables** before re-inserting. Always run `seed:e2e` afterwards if you need end-to-end test accounts.

**Full reset + reseed workflow:**

```bash
cd services/node-api
npm run prisma:reset   # wipe + re-migrate
npm run db:seed        # insert base accounts
npm run seed:e2e       # insert E2E test data
```

---

### Step 6 — Start the Python Services (Optional)

The project includes two Django microservices. Open two new terminals:

```bash
# Terminal 3 — Python Analytics (http://localhost:8001)
cd python-analytics
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cd analytics_project
python manage.py runserver 8001
```

```bash
# Terminal 4 — Python Importer (http://localhost:8002)
cd python-importer
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
cd importer_project
python manage.py runserver 8002
```

---

### Step 7 — Start the Application

Open two terminals:

```bash
# Terminal 1 — API server (http://localhost:4000)
cd services/node-api
npm run dev
```

You should see:
```
🚀 Koi Bus API Server Started
   API URL:      http://localhost:4000/api
   Database:     PostgreSQL (OK)
   Redis:        redis://127.0.0.1:16379
   WebSocket:    Enabled (Socket.IO)
```

```bash
# Terminal 2 — Frontend (http://localhost:4001)
cd apps/web
npm run dev
```

You should see:
```
▲ Next.js 16.2.9 (Turbopack)
- Local: http://localhost:4001
✓ Ready in ~500ms
```

Open your browser at **http://localhost:4001** and log in with any test account.

---

## Environment Variables

### Backend — `services/node-api/.env`

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:4001

JWT_SECRET=super_secret_koi_bus_key_1234
JWT_REFRESH_SECRET=super_secret_koi_bus_refresh_key_5678

DATABASE_URL=postgresql://postgres:koi_pass_1234@127.0.0.1:15432/koi_bus_db?schema=public
REDIS_URL=redis://127.0.0.1:16379
```

### Frontend — `apps/web/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

> ⚠️ These files are **git-ignored**. You must create them manually on a fresh clone. Templates are above.

---

## Port Map

| Service | Port | Notes |
|---|---|---|
| Next.js Frontend | `4001` | `npm run dev` inside `apps/web` |
| Node.js API | `4000` | `npm run dev` inside `services/node-api` |
| PostgreSQL | `15432` | Container port-mapped from internal 5432 |
| Redis | `16379` | Container port-mapped from internal 6379 |
| Swagger UI | `4000/api/docs` | Available in development only |

---

## Test Accounts

All accounts use the password **`password123`**. Phone numbers can be entered **without** a country code — the backend accepts `9876543211`, `+919876543211`, and `+91 9876543211` equally.

### Standard Accounts (created by `npm run db:seed`)

| Role | Phone | Portal |
|---|---|---|
| `SUPER_ADMIN` | `1111111111` | `/admin` |
| `BUS_OWNER` | `2222222222` | `/admin` |
| `DRIVER` | `3333333333` | `/driver` |
| `PASSENGER` | `4444444444` | `/passenger` |

### E2E Accounts (created by `npm run seed:e2e`)

These have a complete trip assignment pre-configured for end-to-end testing.

| Role | Phone | Portal | Notes |
|---|---|---|---|
| `BUS_OWNER` (Operator) | `9876543210` | `/admin` | Manages E2E fleet |
| `DRIVER` | `9876543211` | `/driver` | Has active trip assigned |
| `PASSENGER` | `9876543212` | `/passenger` | Can view live map |

---

## API Reference

### Base URL

```
http://localhost:4000/api
```

### Interactive Docs (Swagger)

```
http://localhost:4000/api/docs
```

### Auth Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/signup` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Login, returns JWT + sets cookie |
| `POST` | `/auth/logout` | Cookie | Invalidate refresh token |
| `POST` | `/auth/refresh` | Cookie | Rotate access token |
| `GET` | `/auth/me` | Bearer | Get current user profile |

### Key Modules

| Module | Base Path | Description |
|---|---|---|
| Auth | `/auth` | JWT auth, sessions, refresh tokens |
| Driver | `/driver` | Driver assignment and trip actions |
| Trips | `/trips` | Create, start, pause, end trips |
| Telemetry | `/telemetry` | GPS ingestion, live map WebSocket data |
| Buses | `/buses` | Fleet management |
| Routes | `/routes` | Bus routes and versions |
| Stops | `/stops` | Stop management |
| Operators | `/operators` | Operator CRUD |
| Search | `/search` | Route search (direct + graph-based) |
| Fares | `/fares` | Fare tables |
| Health | `/health` | System health check |

### WebSocket Events (Socket.IO)

Connect to `http://localhost:4000` and listen for:

| Event | Direction | Description |
|---|---|---|
| `location:update` | Server → Client | Live GPS update for a bus |
| `trip:started` | Server → Client | A trip has started |
| `trip:ended` | Server → Client | A trip has ended |

---

## QA & Testing

All tests are in `qa/` and use Playwright. Run them from the `qa/` directory.

**Prerequisites:** Both the API and frontend must be running, and `seed:e2e` must have been run.

```bash
cd qa

# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E functional tests
npm run qa:e2e

# Run chaos tests (simulates Redis downtime, network delays)
npm run qa:chaos

# Run performance / memory leak tests
npm run qa:performance

# Run security / RBAC tests
npm run qa:security
```

### 4-Layer Validation

E2E tests validate against 4 simultaneous layers:

1. **DOM** — Asserts UI state updates in the browser
2. **API** — Validates JSON responses from the REST API
3. **Redis** — Checks live telemetry cached in Redis hashes
4. **PostgreSQL** — Verifies row-level state via Prisma

---

## Telemetry Emulator

Simulates a GPS device sending live coordinates to the API. Useful for testing the live map without a real bus.

```bash
cd services/node-api

# Basic usage — emulate device DEV-E2E-001 on Trip ID 1
$env:API_URL="http://localhost:4000/api"
npx ts-node tools/telemetry-device-emulator.ts \
  --device DEV-E2E-001 \
  --trip 1 \
  --route ../../data/routes/durgapur-karunamoyee.geojson \
  --speed 5 \
  --loop
```

**Options:**

| Flag | Description |
|---|---|
| `--device <id>` | Device serial number (must exist in DB) |
| `--trip <id>` | Trip ID to attach telemetry to |
| `--route <file>` | Path to GeoJSON route file |
| `--speed <n>` | Speed multiplier (e.g. `5` = 5× real time) |
| `--loop` | Loop the route indefinitely |
| `--poor-gps` | Add ±10m random noise to coordinates |
| `--slow-network` | Simulate random network delays |
| `--packet-loss <n>` | Drop `n`% of telemetry packets randomly |

---

## Database Seeding

| Command | Location | Effect |
|---|---|---|
| `npm run db:seed` | `services/node-api` | Truncates all data, inserts 4 base users |
| `npm run seed:e2e` | `services/node-api` | Idempotent upsert of E2E operator, driver, passenger, bus, route, device, and trip |
| `npm run prisma:migrate` | `services/node-api` | Runs pending Prisma migrations |
| `npm run prisma:studio` | `services/node-api` | Opens Prisma Studio at `http://localhost:5555` |

> Always run `seed:e2e` **after** `db:seed` if you need E2E accounts.

---

## Common Issues

**Login failed / Invalid credentials**
- Phone numbers are normalized to the last 10 digits. `+919876543211`, `09876543211`, and `9876543211` all work.
- The API server on port `4000` must be running. Check with: `netstat -ano | findstr :4000`

**Port 4000 / 4001 already in use**
- Kill existing processes: `npx kill-port 4000 4001`

**Database connection refused**
- Make sure containers are running: `podman compose ps`
- Restart them: `podman compose up -d`

**Redis connection refused (port 16379)**
- Same as above — ensure the `redis` container is healthy.

**`npx playwright install` is slow**
- This downloads Chromium/Firefox/WebKit binaries. Run once and they're cached.
