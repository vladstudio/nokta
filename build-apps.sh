#!/bin/bash
set -e

cd "$(dirname "$0")/native-app"

# Ask user what to build
echo "What do you want to build?"
echo "1) all"
echo "2) android"
echo "3) macos"
echo "4) win"
echo "5) linux"
read -p "Choice [1-5]: " choice

case $choice in
  1) BUILD="all" ;;
  2) BUILD="android" ;;
  3) BUILD="macos" ;;
  4) BUILD="win" ;;
  5) BUILD="linux" ;;
  *) echo "Invalid choice"; exit 1 ;;
esac

# Check required tools
for cmd in node npm; do
  command -v $cmd &>/dev/null || { echo "Error: $cmd not found"; exit 1; }
done
[ -f "package.json" ] || { echo "Error: package.json not found"; exit 1; }
[[ "$BUILD" == "android" || "$BUILD" == "all" ]] && [ ! -f "android/gradlew" ] && { echo "Error: android/gradlew not found"; exit 1; }

VERSION=$(node -p "require('./package.json').version")
OUTDIR="releases/$VERSION"

rm -rf releases
mkdir -p "$OUTDIR"

echo "Building v$VERSION ($BUILD)..."

if [[ "$BUILD" == "android" || "$BUILD" == "all" ]]; then
  echo "Building Android..."
  cd android && ./gradlew assembleRelease
  cp app/build/outputs/apk/release/app-release.apk "../$OUTDIR/Nokta-$VERSION-android.apk"
  cd ..
fi

if [[ "$BUILD" == "macos" || "$BUILD" == "all" ]]; then
  echo "Building macOS (native Swift app)..."
  cd macos
  rm -rf build
  xcodebuild -project Nokta.xcodeproj -scheme Nokta -configuration Release -derivedDataPath build/DerivedData build
  cp -R build/DerivedData/Build/Products/Release/Nokta.app "../$OUTDIR/"
  hdiutil create -volname Nokta -srcfolder "../$OUTDIR/Nokta.app" -ov -format UDZO "../$OUTDIR/Nokta-$VERSION-macos.dmg"
  cd ..
fi

if [[ "$BUILD" == "win" || "$BUILD" == "all" ]]; then
  echo "Building Windows..."
  bun run build:win
  cp dist/*.exe "$OUTDIR/"
fi

if [[ "$BUILD" == "linux" || "$BUILD" == "all" ]]; then
  echo "Building Linux..."
  bun run build:linux
  cp dist/*.AppImage dist/*.deb "$OUTDIR/"
fi

echo "Done! Apps in $OUTDIR/"
ls -la "$OUTDIR/"
