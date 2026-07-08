#!/bin/bash
echo "=============================================="
echo "      Stopping Koi Bus Servers (Linux)"
echo "=============================================="

# Ensure script is run from its directory
cd "$(dirname "$0")"

# Helper function to kill by port robustly
kill_port() {
    local port=$1
    if command -v lsof &> /dev/null; then
        local pid=$(lsof -t -i:$port 2>/dev/null)
        if [ ! -z "$pid" ]; then
            echo "Killing process $pid on port $port..."
            kill -9 $pid 2>/dev/null
        fi
    elif command -v fuser &> /dev/null; then
        echo "Trying to clear port $port using fuser..."
        fuser -k -9 $port/tcp 2>/dev/null
    else
        echo "[WARNING] Neither lsof nor fuser found to kill port $port."
    fi
}

echo "Ensuring ports are clear (4000, 3000, 8001, 8002)..."
kill_port 4000
kill_port 3000
kill_port 8001
kill_port 8002

if [ -f .server_pids ]; then
  rm .server_pids 2>/dev/null
fi

echo "Stopping Database Containers (Docker/Podman)..."
cd ../../koi-bus-web
CONTAINER_ENGINE=""
if command -v docker &> /dev/null; then
    CONTAINER_ENGINE="docker"
elif command -v podman &> /dev/null; then
    CONTAINER_ENGINE="podman"
fi

if [ -n "$CONTAINER_ENGINE" ]; then
    if command -v docker-compose &> /dev/null; then
        docker-compose down 2>/dev/null
    else
        $CONTAINER_ENGINE compose down 2>/dev/null
    fi
else
    echo "No Docker or Podman found. Skipping container shutdown."
fi

echo "All servers successfully stopped."
