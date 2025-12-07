# Nokta Native Apps

WebView wrappers for iOS and Android with push notifications and share extensions.

## Android

```bash
cd android
./gradlew assembleDebug
# APK: app/build/outputs/apk/debug/app-debug.apk
```

**Release build:** Add keystore config to `~/.nokta/nokta-keystore.properties`

## iOS

```bash
cd ios
open Nokta.xcodeproj
```

1. Select team in **Signing & Capabilities** (requires paid Apple Developer account for push)
2. Build (⌘B) or Run (⌘R)

**Requirements:** Xcode 15+, iOS 15+ target
