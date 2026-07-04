@echo off
setlocal
echo ==============================================
echo       Stopping Koi Bus Servers (Windows)
echo ==============================================

echo Closing all server windows (if any)...
taskkill /F /FI "WindowTitle eq KoiBus - *" /T >nul 2>&1

echo Freeing Port 4000 (Node API)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":4000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Freeing Port 3000 (Next.js Web Portal)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Freeing Port 8001 (Python Analytics)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8001" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Freeing Port 8002 (Python Importer)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8002" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo All ports are successfully cleared!
