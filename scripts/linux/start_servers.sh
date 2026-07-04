#!/bin/bash
set -e # Exit immediately if a simple command exits with a non-zero status

echo "=============================================="
echo "      Starting Koi Bus Servers (Linux)"
echo "=============================================="

# Ensure script is run from its directory
cd "$(dirname "$0")"

# Always stop existing servers first to prevent EADDRINUSE crashes
./stop_servers.sh || true

echo ""
echo "[1/5] Checking Docker / Podman..."
CONTAINER_ENGINE=""
if command -v docker &> /dev/null; then
    CONTAINER_ENGINE="docker"
elif command -v podman &> /dev/null; then
    CONTAINER_ENGINE="podman"
else
    echo "[ERROR] Neither Docker nor Podman is installed. Please install one to run the database."
    exit 1
fi

echo "Using $CONTAINER_ENGINE..."
if ! $CONTAINER_ENGINE info > /dev/null 2>&1; then
    echo "[WARNING] $CONTAINER_ENGINE daemon is not running!"
    echo "Attempting to start it via systemctl..."
    if command -v systemctl &> /dev/null; then
        sudo systemctl start $CONTAINER_ENGINE || { echo "[ERROR] Failed to start $CONTAINER_ENGINE. Please start manually."; exit 1; }
    else
        echo "[ERROR] systemd not found. Please start $CONTAINER_ENGINE manually."
        exit 1
    fi
fi

echo ""
echo "[2/5] Starting Database Containers..."
cd ../../koi-bus-web
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
else
    COMPOSE_CMD="$CONTAINER_ENGINE compose"
fi
$COMPOSE_CMD up -d || { echo "[ERROR] Failed to start containers. Check compose.yml."; exit 1; }

echo ""
echo "[3/5] Starting Node API..."
if [ ! -d "services/node-api" ]; then
    echo "[ERROR] services/node-api directory not found!"
    exit 1
fi
(cd services/node-api && npm run dev) &
NODE_PID=$!

echo "[4/5] Starting Web Portal..."
if [ ! -d "apps/web" ]; then
    echo "[ERROR] apps/web directory not found!"
    exit 1
fi
(cd apps/web && npm run dev) &
WEB_PID=$!

echo "[5/5] Starting Python Analytics & Importer..."
if [ ! -f "../../python-analytics/venv/bin/activate" ]; then
    echo "[ERROR] venv not found for Analytics."
else
    (cd ../../python-analytics && source venv/bin/activate && python manage.py runserver 0.0.0.0:8001) &
    ANALYTICS_PID=$!
fi

if [ ! -f "../../python-importer/venv/bin/activate" ]; then
    echo "[ERROR] venv not found for Importer."
else
    (cd ../../python-importer && source venv/bin/activate && python manage.py runserver 0.0.0.0:8002) &
    IMPORTER_PID=$!
fi

echo "$NODE_PID $WEB_PID $ANALYTICS_PID $IMPORTER_PID" > ../scripts/linux/.server_pids

echo ""
echo "=============================================="
echo "All backend services and containers have been launched!"
echo "PIDs saved to scripts/linux/.server_pids"
echo "To view logs, you must run them manually, or check 'top'. Run ./stop_servers.sh to terminate them."
