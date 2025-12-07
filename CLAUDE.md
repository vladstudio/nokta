# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nokta is a real-time chat application with video calls, available on web, desktop (Electron), iOS (WebView), and Android (WebView).

**Tech Stack:**
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS 4 + Jotai + wouter
- Backend: PocketBase with custom hooks and migrations
- Video Calls: Daily.co
- Package Manager: bun
- Real-time: PocketBase SSE (Server-Sent Events) subscriptions
- i18n: i18next

## Development Commands

### Frontend
```bash
cd frontend
bun install          # Install dependencies
bun run dev          # Start dev server on port 3000
bun run build        # Production build
bun run preview      # Preview production build
```

### Backend (PocketBase)
```bash
cd backend
./pocketbase serve   # Start server on port 8090
bun install          # Install setup script dependencies
```

### Production Build
```bash
./build.sh           # Creates deploy/ with frontend build + backend files
```

### Native Apps
```bash
./build-apps.sh      # Build desktop (Electron), iOS, Android apps
```

## Architecture

### Backend: PocketBase

**Collections:**
- `users` (auth) - name, email, avatar, birthday, role
- `chats` - participants, daily_room_url, is_active_call, call_participants, created_by
- `messages` - chat, sender, content, type (text/image/file/video/voice), reactions, favs, reply_to, forwarded_from
- `chat_read_status` - tracks last read message per user per chat
- `presence` - real-time user online status
- `typing_events` - real-time typing indicators
- `device_tokens` - push notification tokens (Android/iOS/web)
- `invitations` - invitation codes with expiration

**Custom Hooks** (`pb_hooks/`):
- `nokta.pb.js` - API info endpoint
- `daily.pb.js` - video call room management (create/delete/leave)
- `chat_hooks.pb.js` - auto-creates chats, message logic, FCM push notifications
- `invitations.pb.js` - secure signup endpoint, role/password validation

**Migrations** (`pb_migrations/`) - schema definitions and access rules

### Frontend: React SPA

**Routing** (wouter):
- `/login` - authentication
- `/signup/:code` - invitation-based signup
- `/invites` - manage invitations
- `/admin` - admin panel (user management)
- `/settings` - user settings (profile, preferences, logout)
- `/chat/:chatId?` - main chat interface
- `/new` - create new chat

**State Management:**
- Jotai for global state (call store)
- React hooks + local state for component state
- PocketBase real-time subscriptions for live data

**Service Layer** (`src/services/pocketbase.ts`):
Organized by collection: `auth`, `users`, `chats`, `messages`, `chatReadStatus`, `presence`, `invitations`, `stats`, `nokta`.
Each service exports CRUD methods and real-time subscription helpers.

**Custom Hooks** (`src/hooks/`):
- `useMessageList` - infinite scroll message loading with real-time updates
- `useUnreadMessages` - tracks unread counts across chats
- `useTypingIndicator` - typing status broadcast/display
- `usePresence` - user online/offline status
- `useFileUpload` - image/video upload with compression
- `useVideoCompression` - advanced video compression with quality presets
- `useConnectionStatus` - network connectivity monitoring
- `useTheme` - theme management (light/dark/system)
- `useSearchMessages` - message search within chat
- `useIsMobile` - mobile device detection

**Component Structure:**
- `pages/` - route-level components
- `components/` - reusable UI components (Sidebar, ChatWindow, ChatDialog, CallView, etc.)
- `ui/` - base UI primitives (@base-ui-components/react + custom)

**Utilities** (`src/utils/`):
- `messageQueue.ts` - pending message queue for offline support
- `messageCache.ts` - IndexedDB-based message caching
- `notifications.ts` - browser notifications with mute settings

## Key Patterns

### Real-time Updates
PocketBase SSE subscriptions are used throughout. Pattern:
```typescript
pb.collection('messages').subscribe('*', (e) => {
  if (e.action === 'create') { /* handle new message */ }
})
```

### Service Organization
All PocketBase API calls go through `src/services/pocketbase.ts`. Never call `pb.collection()` directly in components.

### Message Features
- Reactions (emoji), favorites, replies, forwarding
- Types: text, image, file, video, voice
- Search with full-text query
- File uploads up to 100MB with thumbnails

### Video Calls
Daily.co integration for video calls. Backend manages room creation/cleanup via `daily.pb.js` hook.

### Authentication Flow
- Invitation-based signup with code validation
- Login via `auth.login()` from service layer
- Auth state stored in PocketBase SDK authStore
- `ProtectedRoute` and `AdminRoute` wrappers enforce access
- Password minimum: 10 characters

### Native App Bridge
Push token registration:
- Android: `window.NoktaAndroid.registerPushToken()`
- iOS: `window.webkit.messageHandlers.NoktaiOS.postMessage()`

## Environment Variables

**Frontend** (`.env` in `frontend/`):
```
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

**Backend** (`.env` in `backend/`):
```
DAILY_CO_API_KEY=<daily-co-api-key>   # Required for video calls
FCM_API_KEY=<random-secret-key>       # Required for push notifications
SECRETS_PATH=<path-to-firebase-json>  # Firebase service account file
```

## Native Apps

**Desktop (Electron):** Mac (ARM64/Intel), Windows, Linux via electron-builder
**Android:** Gradle-based with Firebase, package: `com.nokta.app`
**iOS:** Xcode project with push notification entitlements, iOS 15+

See `native-app/` for all native app code.

## Important Notes

- Always use `bun` not `npm` for frontend dependencies
- PocketBase must be running before frontend can work
- When modifying schema, create migrations via PocketBase admin UI
- Real-time subscriptions auto-reconnect on disconnect
- File uploads go to PocketBase storage, URLs are relative
- User roles: "Admin" (full access) or "Member" (limited)
