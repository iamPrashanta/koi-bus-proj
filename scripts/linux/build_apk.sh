#!/bin/bash
set -e # Exit on error

echo "=============================================="
echo "         Building Koi Bus APK (Linux)"
echo "=============================================="

# Ensure script is run from its directory
cd "$(dirname "$0")"
cd ../../koi-bus-apk

if [ ! -f "pubspec.yaml" ]; then
    echo "[ERROR] flutter project not found here."
    exit 1
fi

if ! command -v flutter &> /dev/null; then
    echo "[ERROR] Flutter command not found in PATH."
    exit 1
fi

# Set PUB_CACHE to bypass any cross-drive or permission issues
export PUB_CACHE=$(pwd)/../pub-cache
echo "Local PUB_CACHE set to: $PUB_CACHE"

echo "[1/3] Cleaning previous builds..."
flutter clean || { echo "[ERROR] Clean failed"; exit 1; }

echo "[2/3] Fetching dependencies..."
flutter pub get || { echo "[ERROR] Pub get failed"; exit 1; }

echo "[3/3] Compiling Release APK..."
flutter build apk || { echo "[ERROR] APK build failed"; exit 1; }

echo ""
echo "=============================================="
echo "Build Process Finished Successfully!"
echo "Check koi-bus-apk/build/app/outputs/flutter-apk/app-release.apk"
