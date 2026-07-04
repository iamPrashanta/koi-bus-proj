# =============================================================================
# Koi Bus - Full Stack Startup Script (PowerShell)
# =============================================================================
# Starts all services in the correct order:
#   1. Podman containers (PostgreSQL + Redis)
#   2. Node.js API backend (port 3000)
#   3. Next.js frontend (port 3001)
#
# Usage:
#   .\start.ps1              # Start everything
#   .\start.ps1 -Stop        # Stop everything
#   .\start.ps1 -Status      # Check status of all services
# =============================================================================

param(
    [switch]$Stop,
    [switch]$Status,
    [switch]$Help
)

# ── Config ──────────────────────────────────────────────────────────────────
$ROOT_DIR     = $PSScriptRoot
$API_DIR      = Join-Path $ROOT_DIR "services\node-api"
$WEB_DIR      = Join-Path $ROOT_DIR "apps\web"
$COMPOSE_FILE = Join-Path $ROOT_DIR "compose.yml"
$PID_DIR      = Join-Path $ROOT_DIR ".pids"

$API_PORT      = 3000
$WEB_PORT      = 3001
$POSTGRES_PORT = 15432
$REDIS_PORT    = 16379

# ── Helpers ─────────────────────────────────────────────────────────────────
function Write-Log   { param($Msg) Write-Host "[INFO]  $Msg" -ForegroundColor Cyan }
function Write-Ok    { param($Msg) Write-Host "[OK]    $Msg" -ForegroundColor Green }
function Write-Warn  { param($Msg) Write-Host "[WARN]  $Msg" -ForegroundColor Yellow }
function Write-Fail  { param($Msg) Write-Host "[FAIL]  $Msg" -ForegroundColor Red }
function Write-Header { param($Msg) Write-Host "`n=== $Msg ===`n" -ForegroundColor Cyan }

function Test-Port {
    param([int]$Port, [int]$TimeoutMs = 1000)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $result = $tcp.BeginConnect("127.0.0.1", $Port, $null, $null)
        $success = $result.AsyncWaitHandle.WaitOne($TimeoutMs)
        $tcp.Close()
        return $success
    } catch {
        return $false
    }
}

function Wait-ForPort {
    param([int]$Port, [string]$Name, [int]$MaxWait = 30)
    $waited = 0
    while (-not (Test-Port -Port $Port)) {
        if ($waited -ge $MaxWait) {
            Write-Fail "$Name did not start on port $Port within ${MaxWait}s"
            return $false
        }
        Start-Sleep -Seconds 1
        $waited++
    }
    Write-Ok "$Name is ready on port $Port (${waited}s)"
    return $true
}

function Stop-PortProcess {
    param([int]$Port)
    $procs = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue |
             Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $procs) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Warn "Killed process $pid on port $Port"
        } catch {}
    }
}

# Ensure .pids directory exists
if (-not (Test-Path $PID_DIR)) {
    New-Item -ItemType Directory -Path $PID_DIR -Force | Out-Null
}

# ── Check Dependencies ─────────────────────────────────────────────────────
function Test-Dependencies {
    $missing = @()
    foreach ($cmd in @("podman", "node", "npm")) {
        if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
            $missing += $cmd
        }
    }
    if ($missing.Count -gt 0) {
        Write-Fail "Missing dependencies: $($missing -join ', ')"
        Write-Fail "Please install them and try again."
        exit 1
    }
    Write-Ok "All dependencies found (podman, node, npm)"
}

# ── Start Containers ───────────────────────────────────────────────────────
function Start-Containers {
    Write-Header "Starting Podman Containers"

    $running = podman compose -f $COMPOSE_FILE ps 2>&1
    if ($running -match "running") {
        Write-Log "Containers already running, skipping."
    } else {
        podman compose -f $COMPOSE_FILE up -d
    }

    Write-Log "Waiting for PostgreSQL (port $POSTGRES_PORT)..."
    if (-not (Wait-ForPort -Port $POSTGRES_PORT -Name "PostgreSQL" -MaxWait 30)) { exit 1 }

    Write-Log "Waiting for Redis (port $REDIS_PORT)..."
    if (-not (Wait-ForPort -Port $REDIS_PORT -Name "Redis" -MaxWait 15)) { exit 1 }
}

# ── Start Node API ─────────────────────────────────────────────────────────
function Start-Api {
    Write-Header "Starting Node.js API (port $API_PORT)"

    # Kill anything on the API port first
    if (Test-Port -Port $API_PORT) {
        Write-Warn "Port $API_PORT is occupied, killing existing process..."
        Stop-PortProcess -Port $API_PORT
        Start-Sleep -Seconds 1
    }

    Push-Location $API_DIR

    # Install deps if needed
    if (-not (Test-Path "node_modules")) {
        Write-Log "Installing API dependencies..."
        npm install
    }

    # Generate Prisma client
    Write-Log "Generating Prisma client..."
    npx prisma generate 2>$null

    # Start API as a background job
    $apiJob = Start-Process -FilePath "npm" -ArgumentList "run", "dev" `
        -WorkingDirectory $API_DIR `
        -WindowStyle Hidden `
        -PassThru `
        -RedirectStandardOutput (Join-Path $PID_DIR "api.log") `
        -RedirectStandardError (Join-Path $PID_DIR "api.err.log")

    $apiJob.Id | Out-File -FilePath (Join-Path $PID_DIR "api.pid") -NoNewline
    Write-Log "API started (PID: $($apiJob.Id))"

    Pop-Location

    Write-Log "Waiting for API (port $API_PORT)..."
    if (-not (Wait-ForPort -Port $API_PORT -Name "Node.js API" -MaxWait 30)) { exit 1 }
}

# ── Start Next.js Frontend ─────────────────────────────────────────────────
function Start-Web {
    Write-Header "Starting Next.js Frontend (port $WEB_PORT)"

    # Kill anything on the web port first
    if (Test-Port -Port $WEB_PORT) {
        Write-Warn "Port $WEB_PORT is occupied, killing existing process..."
        Stop-PortProcess -Port $WEB_PORT
        Start-Sleep -Seconds 1
    }

    Push-Location $WEB_DIR

    # Install deps if needed
    if (-not (Test-Path "node_modules")) {
        Write-Log "Installing frontend dependencies..."
        npm install
    }

    # Start Next.js as a background process (port 3001 locked in package.json)
    $webJob = Start-Process -FilePath "npm" -ArgumentList "run", "dev" `
        -WorkingDirectory $WEB_DIR `
        -WindowStyle Hidden `
        -PassThru `
        -RedirectStandardOutput (Join-Path $PID_DIR "web.log") `
        -RedirectStandardError (Join-Path $PID_DIR "web.err.log")

    $webJob.Id | Out-File -FilePath (Join-Path $PID_DIR "web.pid") -NoNewline
    Write-Log "Frontend started (PID: $($webJob.Id))"

    Pop-Location

    Write-Log "Waiting for Frontend (port $WEB_PORT)..."
    if (-not (Wait-ForPort -Port $WEB_PORT -Name "Next.js Frontend" -MaxWait 30)) { exit 1 }
}

# ── Stop Everything ────────────────────────────────────────────────────────
function Stop-All {
    Write-Header "Stopping All Services"

    # Stop frontend
    $webPidFile = Join-Path $PID_DIR "web.pid"
    if (Test-Path $webPidFile) {
        $webPid = Get-Content $webPidFile -ErrorAction SilentlyContinue
        if ($webPid) {
            Stop-Process -Id $webPid -Force -ErrorAction SilentlyContinue
            Write-Ok "Frontend stopped (PID: $webPid)"
        }
        Remove-Item $webPidFile -Force
    }

    # Stop API
    $apiPidFile = Join-Path $PID_DIR "api.pid"
    if (Test-Path $apiPidFile) {
        $apiPid = Get-Content $apiPidFile -ErrorAction SilentlyContinue
        if ($apiPid) {
            Stop-Process -Id $apiPid -Force -ErrorAction SilentlyContinue
            Write-Ok "API stopped (PID: $apiPid)"
        }
        Remove-Item $apiPidFile -Force
    }

    # Kill any orphaned processes on known ports
    foreach ($port in @($API_PORT, $WEB_PORT)) {
        Stop-PortProcess -Port $port
    }

    # Stop containers
    podman compose -f $COMPOSE_FILE down 2>$null
    Write-Ok "Podman containers stopped"

    Write-Ok "All services stopped."
}

# ── Status Check ───────────────────────────────────────────────────────────
function Show-Status {
    Write-Header "Service Status"

    Write-Host "Containers:" -ForegroundColor White
    podman compose -f $COMPOSE_FILE ps 2>$null
    if ($LASTEXITCODE -ne 0) { Write-Warn "  Containers not running" }

    Write-Host ""
    Write-Host "Ports:" -ForegroundColor White
    $services = @(
        @{ Port = $POSTGRES_PORT; Name = "PostgreSQL" },
        @{ Port = $REDIS_PORT;    Name = "Redis" },
        @{ Port = $API_PORT;      Name = "Node API" },
        @{ Port = $WEB_PORT;      Name = "Next.js" }
    )
    foreach ($svc in $services) {
        if (Test-Port -Port $svc.Port) {
            Write-Ok "$($svc.Name) (port $($svc.Port)) - RUNNING"
        } else {
            Write-Fail "$($svc.Name) (port $($svc.Port)) - DOWN"
        }
    }

    Write-Host ""
    Write-Host "PIDs:" -ForegroundColor White
    foreach ($service in @("api", "web")) {
        $pidFile = Join-Path $PID_DIR "$service.pid"
        if (Test-Path $pidFile) {
            $pid = Get-Content $pidFile -ErrorAction SilentlyContinue
            try {
                $proc = Get-Process -Id $pid -ErrorAction Stop
                Write-Ok "$service - PID $pid (alive)"
            } catch {
                Write-Warn "$service - PID $pid (stale)"
            }
        } else {
            Write-Warn "$service - no PID file"
        }
    }
}

# ── Banner ─────────────────────────────────────────────────────────────────
function Show-Banner {
    Write-Host ""
    Write-Host "  +=============================================+" -ForegroundColor Cyan
    Write-Host "  |         Koi Bus Dev Launcher                |" -ForegroundColor Cyan
    Write-Host "  |=============================================|" -ForegroundColor Cyan
    Write-Host "  |  PostgreSQL ........... localhost:$POSTGRES_PORT  |" -ForegroundColor Cyan
    Write-Host "  |  Redis ............... localhost:$REDIS_PORT  |" -ForegroundColor Cyan
    Write-Host "  |  API Server .......... localhost:$API_PORT   |" -ForegroundColor Cyan
    Write-Host "  |  Frontend ............ localhost:$WEB_PORT   |" -ForegroundColor Cyan
    Write-Host "  +=============================================+" -ForegroundColor Cyan
    Write-Host ""
}

# ── Main ───────────────────────────────────────────────────────────────────
if ($Help) {
    Write-Host "Usage: .\start.ps1 [-Stop] [-Status] [-Help]"
    Write-Host "  (no flags)   Start all services"
    Write-Host "  -Stop        Stop all services"
    Write-Host "  -Status      Check status of all services"
    exit 0
}

if ($Stop) {
    Stop-All
    exit 0
}

if ($Status) {
    Show-Status
    exit 0
}

# Default: start everything
Show-Banner
Test-Dependencies
Start-Containers
Start-Api
Start-Web

Write-Header "All Services Running"
Write-Host "  * PostgreSQL   -> localhost:$POSTGRES_PORT" -ForegroundColor Green
Write-Host "  * Redis        -> localhost:$REDIS_PORT" -ForegroundColor Green
Write-Host "  * API          -> http://localhost:$API_PORT/api" -ForegroundColor Green
Write-Host "  * Frontend     -> http://localhost:$WEB_PORT" -ForegroundColor Green
Write-Host "  * Swagger      -> http://localhost:$API_PORT/api/docs" -ForegroundColor Green
Write-Host ""
Write-Host "  Logs: $PID_DIR\api.log, $PID_DIR\web.log" -ForegroundColor Yellow
Write-Host "  Stop: .\start.ps1 -Stop" -ForegroundColor Yellow
Write-Host ""
