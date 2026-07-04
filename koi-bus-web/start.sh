#!/bin/bash
# =============================================================================
# Koi Bus - Full Stack Startup Script
# =============================================================================
# Starts all services in the correct order:
#   1. Podman containers (PostgreSQL + Redis)
#   2. Node.js API backend (port 3000)
#   3. Next.js frontend (port 3001)
#
# Usage:
#   ./start.sh          # Start everything
#   ./start.sh --stop   # Stop everything
#   ./start.sh --status # Check status of all services
# =============================================================================

set -e

# ── Colors ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# ── Paths ───────────────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
API_DIR="$ROOT_DIR/services/node-api"
WEB_DIR="$ROOT_DIR/apps/web"
COMPOSE_FILE="$ROOT_DIR/compose.yml"
PID_DIR="$ROOT_DIR/.pids"

# ── Ports ───────────────────────────────────────────────────────────────────
API_PORT=3000
WEB_PORT=3001
POSTGRES_PORT=15432
REDIS_PORT=16379

# ── Helpers ─────────────────────────────────────────────────────────────────
log_info()    { echo -e "${CYAN}[INFO]${NC}  $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}    $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
log_error()   { echo -e "${RED}[FAIL]${NC}  $1"; }
log_header()  { echo -e "\n${BOLD}${CYAN}═══ $1 ═══${NC}\n"; }

mkdir -p "$PID_DIR"

# ── Check Dependencies ─────────────────────────────────────────────────────
check_deps() {
    local missing=0
    for cmd in podman node npm; do
        if ! command -v "$cmd" &> /dev/null; then
            log_error "$cmd is not installed"
            missing=1
        fi
    done
    if [ $missing -eq 1 ]; then
        log_error "Please install missing dependencies and try again."
        exit 1
    fi
}

# ── Wait for port to become reachable ───────────────────────────────────────
wait_for_port() {
    local port=$1
    local name=$2
    local max_wait=${3:-30}
    local waited=0

    while ! (echo > /dev/tcp/127.0.0.1/$port) 2>/dev/null; do
        if [ $waited -ge $max_wait ]; then
            log_error "$name did not start on port $port within ${max_wait}s"
            return 1
        fi
        sleep 1
        waited=$((waited + 1))
    done
    log_success "$name is ready on port $port (${waited}s)"
}

# ── Start Containers ───────────────────────────────────────────────────────
start_containers() {
    log_header "Starting Podman Containers"

    if ! podman compose -f "$COMPOSE_FILE" ps 2>/dev/null | grep -q "running"; then
        podman compose -f "$COMPOSE_FILE" up -d
    else
        log_info "Containers already running, skipping."
    fi

    log_info "Waiting for PostgreSQL (port $POSTGRES_PORT)..."
    wait_for_port $POSTGRES_PORT "PostgreSQL" 30

    log_info "Waiting for Redis (port $REDIS_PORT)..."
    wait_for_port $REDIS_PORT "Redis" 15
}

# ── Start Node API ─────────────────────────────────────────────────────────
start_api() {
    log_header "Starting Node.js API (port $API_PORT)"

    # Kill any existing process on API port
    if lsof -i :$API_PORT -t &>/dev/null 2>&1; then
        log_warn "Port $API_PORT is occupied, killing existing process..."
        kill $(lsof -i :$API_PORT -t) 2>/dev/null || true
        sleep 1
    fi

    cd "$API_DIR"

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        log_info "Installing API dependencies..."
        npm install
    fi

    # Run Prisma generate to ensure client is up to date
    log_info "Generating Prisma client..."
    npx prisma generate 2>/dev/null || true

    # Start the API in background
    npm run dev > "$PID_DIR/api.log" 2>&1 &
    echo $! > "$PID_DIR/api.pid"
    log_info "API started (PID: $(cat "$PID_DIR/api.pid"))"

    log_info "Waiting for API (port $API_PORT)..."
    wait_for_port $API_PORT "Node.js API" 30
}

# ── Start Next.js Frontend ─────────────────────────────────────────────────
start_web() {
    log_header "Starting Next.js Frontend (port $WEB_PORT)"

    # Kill any existing process on web port
    if lsof -i :$WEB_PORT -t &>/dev/null 2>&1; then
        log_warn "Port $WEB_PORT is occupied, killing existing process..."
        kill $(lsof -i :$WEB_PORT -t) 2>/dev/null || true
        sleep 1
    fi

    cd "$WEB_DIR"

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        log_info "Installing frontend dependencies..."
        npm install
    fi

    # Start Next.js in background (port locked to 3001 via package.json)
    npm run dev > "$PID_DIR/web.log" 2>&1 &
    echo $! > "$PID_DIR/web.pid"
    log_info "Frontend started (PID: $(cat "$PID_DIR/web.pid"))"

    log_info "Waiting for Frontend (port $WEB_PORT)..."
    wait_for_port $WEB_PORT "Next.js Frontend" 30
}

# ── Stop Everything ────────────────────────────────────────────────────────
stop_all() {
    log_header "Stopping All Services"

    # Stop frontend
    if [ -f "$PID_DIR/web.pid" ]; then
        local web_pid=$(cat "$PID_DIR/web.pid")
        if kill -0 "$web_pid" 2>/dev/null; then
            kill "$web_pid" 2>/dev/null || true
            log_success "Frontend stopped (PID: $web_pid)"
        fi
        rm -f "$PID_DIR/web.pid"
    fi

    # Stop API
    if [ -f "$PID_DIR/api.pid" ]; then
        local api_pid=$(cat "$PID_DIR/api.pid")
        if kill -0 "$api_pid" 2>/dev/null; then
            kill "$api_pid" 2>/dev/null || true
            log_success "API stopped (PID: $api_pid)"
        fi
        rm -f "$PID_DIR/api.pid"
    fi

    # Also kill any orphaned processes on the ports
    for port in $API_PORT $WEB_PORT; do
        if lsof -i :$port -t &>/dev/null 2>&1; then
            kill $(lsof -i :$port -t) 2>/dev/null || true
        fi
    done

    # Stop containers
    podman compose -f "$COMPOSE_FILE" down 2>/dev/null || true
    log_success "Podman containers stopped"

    log_success "All services stopped."
}

# ── Status Check ───────────────────────────────────────────────────────────
show_status() {
    log_header "Service Status"

    echo -e "${BOLD}Containers:${NC}"
    podman compose -f "$COMPOSE_FILE" ps 2>/dev/null || echo "  Not running"

    echo ""
    echo -e "${BOLD}Ports:${NC}"
    for port_info in "$POSTGRES_PORT:PostgreSQL" "$REDIS_PORT:Redis" "$API_PORT:Node API" "$WEB_PORT:Next.js"; do
        local port="${port_info%%:*}"
        local name="${port_info##*:}"
        if (echo > /dev/tcp/127.0.0.1/$port) 2>/dev/null; then
            log_success "$name (port $port) — RUNNING"
        else
            log_error "$name (port $port) — DOWN"
        fi
    done

    echo ""
    echo -e "${BOLD}PIDs:${NC}"
    for service in api web; do
        if [ -f "$PID_DIR/$service.pid" ]; then
            local pid=$(cat "$PID_DIR/$service.pid")
            if kill -0 "$pid" 2>/dev/null; then
                log_success "$service — PID $pid (alive)"
            else
                log_warn "$service — PID $pid (stale)"
            fi
        else
            log_warn "$service — no PID file"
        fi
    done
}

# ── Main ───────────────────────────────────────────────────────────────────
print_banner() {
    echo -e "${CYAN}${BOLD}"
    echo "  ╔═══════════════════════════════════════════╗"
    echo "  ║         🚌  Koi Bus Dev Launcher          ║"
    echo "  ╠═══════════════════════════════════════════╣"
    echo "  ║  PostgreSQL ........... localhost:$POSTGRES_PORT  ║"
    echo "  ║  Redis ............... localhost:$REDIS_PORT  ║"
    echo "  ║  API Server .......... localhost:$API_PORT   ║"
    echo "  ║  Frontend ............ localhost:$WEB_PORT   ║"
    echo "  ╚═══════════════════════════════════════════╝"
    echo -e "${NC}"
}

main() {
    case "${1:-}" in
        --stop|-s)
            stop_all
            ;;
        --status|-st)
            show_status
            ;;
        --help|-h)
            echo "Usage: $0 [--stop|--status|--help]"
            echo "  (no args)   Start all services"
            echo "  --stop      Stop all services"
            echo "  --status    Check status of all services"
            ;;
        *)
            print_banner
            check_deps
            start_containers
            start_api
            start_web

            log_header "All Services Running"
            echo -e "  ${GREEN}●${NC} PostgreSQL   → ${BOLD}localhost:$POSTGRES_PORT${NC}"
            echo -e "  ${GREEN}●${NC} Redis        → ${BOLD}localhost:$REDIS_PORT${NC}"
            echo -e "  ${GREEN}●${NC} API          → ${BOLD}http://localhost:$API_PORT/api${NC}"
            echo -e "  ${GREEN}●${NC} Frontend     → ${BOLD}http://localhost:$WEB_PORT${NC}"
            echo -e "  ${GREEN}●${NC} Swagger      → ${BOLD}http://localhost:$API_PORT/api/docs${NC}"
            echo ""
            echo -e "  ${YELLOW}Logs:${NC} $PID_DIR/api.log, $PID_DIR/web.log"
            echo -e "  ${YELLOW}Stop:${NC} ./start.sh --stop"
            echo ""
            ;;
    esac
}

main "$@"
