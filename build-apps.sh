#!/bin/bash
set -e
cd "$(dirname "$0")/native-app"

rm -rf releases
mkdir -p releases

echo "Building macOS..."
npm run build:mac
cp -r dist/*.dmg dist/*.zip releases/ 2>/dev/null || true

echo "Building Windows..."
npm run build:win
cp -r dist/*.exe releases/ 2>/dev/null || true

echo "Building Linux..."
npm run build:linux
cp -r dist/*.AppImage dist/*.deb releases/ 2>/dev/null || true

echo "Building Android..."
cd ../android && ./gradlew assembleRelease
cp app/build/outputs/apk/release/*.apk ../native-app/releases/ 2>/dev/null || true
cd ../native-app

echo "Done! Apps in releases/"
ls -la releases/
