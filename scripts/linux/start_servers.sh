#!/bin/bash
set -e # Exit immediately if a simple command exits with a non-zero status

echo "=============================================="
echo "      Starting Koi Bus Servers (Linux)"
echo "=============================================="

# Ensure script is run from its directory
cd "$(dirname "$0")"

# Always stop existing servers first to prevent EADDRINUSE crashes
./stop_servers.sh || true

cd ../../koi-bus-web

echo ""
echo "[1/4] Starting Node API..."
if [ ! -d "services/node-api" ]; then
    echo "[ERROR] services/node-api directory not found!"
    exit 1
fi
(cd services/node-api && npm run dev) &
NODE_PID=$!

echo "[2/4] Starting Web Portal..."
if [ ! -d "apps/web" ]; then
    echo "[ERROR] apps/web directory not found!"
    exit 1
fi
(cd apps/web && npm run dev) &
WEB_PID=$!

echo "[3/4] Starting Python Analytics..."
if [ ! -f "../../python-analytics/venv/bin/activate" ]; then
    echo "[ERROR] venv not found for Analytics. Please run 'python -m venv venv' first."
else
    (cd ../../python-analytics && source venv/bin/activate && python manage.py runserver 0.0.0.0:8001) &
    ANALYTICS_PID=$!
fi

echo "[4/4] Starting Python Importer..."
if [ ! -f "../../python-importer/venv/bin/activate" ]; then
    echo "[ERROR] venv not found for Importer."
else
    (cd ../../python-importer && source venv/bin/activate && python manage.py runserver 0.0.0.0:8002) &
    IMPORTER_PID=$!
fi

echo "$NODE_PID $WEB_PID $ANALYTICS_PID $IMPORTER_PID" > ../scripts/linux/.server_pids

echo ""
echo "=============================================="
echo "All backend services have been launched in the background!"
echo "PIDs saved to scripts/linux/.server_pids"
echo "To view logs, you must run them manually, or check 'top'. Run ./stop_servers.sh to terminate them."
