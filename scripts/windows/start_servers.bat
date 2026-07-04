@echo off
setlocal
echo ==============================================
echo       Starting Koi Bus Servers (Windows)
echo ==============================================

:: Always stop existing servers first to prevent EADDRINUSE crashes
call stop_servers.bat

echo.
echo [1/5] Checking Docker / Podman...
set CONTAINER_ENGINE=
where docker >nul 2>&1
if %errorlevel% equ 0 set CONTAINER_ENGINE=docker
if "%CONTAINER_ENGINE%"=="" (
    where podman >nul 2>&1
    if %errorlevel% equ 0 set CONTAINER_ENGINE=podman
)

if "%CONTAINER_ENGINE%"=="" (
    echo [ERROR] Neither Docker nor Podman is installed. Please install one to run the database.
    pause
    exit /b 1
)

echo Using %CONTAINER_ENGINE%...
%CONTAINER_ENGINE% info >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] %CONTAINER_ENGINE% daemon is not running! 
    echo Attempting to start Docker Desktop... 
    if "%CONTAINER_ENGINE%"=="docker" (
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    ) else (
        echo Please start Podman Desktop manually.
    )
    echo Waiting 15 seconds for daemon to start...
    timeout /t 15 /nobreak >nul
    %CONTAINER_ENGINE% info >nul 2>&1
    if errorlevel 1 (
        echo [ERROR] Could not start %CONTAINER_ENGINE%. Please start it manually and try again.
        pause
        exit /b 1
    )
)

echo.
echo [2/5] Starting Database Containers...
cd ..\..\koi-bus-web
%CONTAINER_ENGINE% compose up -d
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start containers. Check compose.yml.
    pause
    exit /b 1
)

echo.
echo [3/5] Starting Node API...
if not exist "services\node-api\package.json" (
    echo [ERROR] Node API directory not found. Are you running this from the scripts folder?
    pause
    exit /b 1
)
start "KoiBus - Node API" cmd /c "cd services\node-api && npm run dev || pause"

echo [4/5] Starting Web Portal...
if not exist "apps\web\package.json" (
    echo [ERROR] Web app directory not found.
    pause
    exit /b 1
)
start "KoiBus - Web Portal" cmd /c "cd apps\web && npm run dev || pause"

echo [5/5] Starting Python Analytics & Importer...
if not exist "..\python-analytics\venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment for Analytics not found.
) else (
    start "KoiBus - Analytics" cmd /c "cd ..\python-analytics && .\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8001 || pause"
)

if not exist "..\python-importer\venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment for Importer not found.
) else (
    start "KoiBus - Importer" cmd /c "cd ..\python-importer && .\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8002 || pause"
)

echo.
echo All backend services and containers have been launched successfully!
pause
