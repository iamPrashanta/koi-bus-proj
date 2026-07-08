@echo off
setlocal
:: Ensure script runs in its own directory
cd /d "%~dp0"

echo ==============================================
echo          Building Koi Bus APK (Windows)
echo ==============================================

cd ..\..\koi-bus-apk
if not exist "pubspec.yaml" (
    echo [ERROR] Flutter app directory not found. Are you running this from the scripts folder?
    pause
    exit /b 1
)

:: Check for Flutter
where flutter >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Flutter is not installed or not in your PATH.
    pause
    exit /b 1
)

:: Bypass Kotlin Incremental Cross-Drive Bug by setting PUB_CACHE locally
set PUB_CACHE=%cd%\..\pub-cache
echo Local PUB_CACHE set to: %PUB_CACHE%

echo [1/3] Cleaning previous builds...
call flutter clean
if %errorlevel% neq 0 (
    echo [ERROR] Flutter clean failed!
    pause
    exit /b 1
)

echo [2/3] Fetching dependencies...
call flutter pub get
if %errorlevel% neq 0 (
    echo [ERROR] Flutter pub get failed! Check your internet connection or pubspec.yaml.
    pause
    exit /b 1
)

echo [3/3] Compiling Release APK...
call flutter build apk
if %errorlevel% neq 0 (
    echo [ERROR] APK Build failed! Check the error logs above.
    pause
    exit /b 1
)

echo.
echo ==============================================
echo Build Process Finished Successfully!
echo Check koi-bus-apk\build\app\outputs\flutter-apk\app-release.apk
pause
