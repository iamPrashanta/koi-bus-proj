@echo off
setlocal
echo ==============================================
echo       Starting Koi Bus Servers (Windows)
echo ==============================================

:: Always stop existing servers first to prevent EADDRINUSE crashes
call stop_servers.bat

cd ..\..\koi-bus-web

echo.
echo [1/4] Starting Node API...
if not exist "services\node-api\package.json" (
    echo [ERROR] Node API directory not found. Are you running this from the scripts folder?
    pause
    exit /b 1
)
start "KoiBus - Node API" cmd /c "cd services\node-api && npm run dev || pause"

echo [2/4] Starting Web Portal...
if not exist "apps\web\package.json" (
    echo [ERROR] Web app directory not found.
    pause
    exit /b 1
)
start "KoiBus - Web Portal" cmd /c "cd apps\web && npm run dev || pause"

echo [3/4] Starting Python Analytics...
if not exist "..\python-analytics\venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment for Analytics not found. Please setup venv first.
) else (
    start "KoiBus - Analytics" cmd /c "cd ..\python-analytics && .\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8001 || pause"
)

echo [4/4] Starting Python Importer...
if not exist "..\python-importer\venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment for Importer not found. Please setup venv first.
) else (
    start "KoiBus - Importer" cmd /c "cd ..\python-importer && .\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8002 || pause"
)

echo.
echo All backend services have been launched in separate windows!
echo If a window stays open or says 'pause', check that window for errors.
pause
