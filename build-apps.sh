#!/bin/bash
set -e

cd "$(dirname "$0")/native-app"

# Check required tools
for cmd in node npm; do
  command -v $cmd &>/dev/null || { echo "Error: $cmd not found"; exit 1; }
done
[ -f "android/gradlew" ] || { echo "Error: android/gradlew not found"; exit 1; }
[ -f "package.json" ] || { echo "Error: package.json not found"; exit 1; }

VERSION=$(node -p "require('./package.json').version")
OUTDIR="releases/$VERSION"

rm -rf releases
mkdir -p "$OUTDIR"

echo "Building v$VERSION..."

echo "Building Android..."
cd android && ./gradlew assembleRelease
cp app/build/outputs/apk/release/app-release.apk "../$OUTDIR/Nokta-$VERSION-android.apk"
cd ..

echo "Building macOS..."
bun run build:mac-arm
bun run build:mac-intel
cp dist/*.dmg dist/*.zip "$OUTDIR/"

echo "Building Windows..."
bun run build:win
cp dist/*.exe "$OUTDIR/"

echo "Building Linux..."
bun run build:linux
cp dist/*.AppImage dist/*.deb "$OUTDIR/"

echo "Done! Apps in $OUTDIR/"
ls -la "$OUTDIR/"
