# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Talk is a real-time chat application for direct messaging and group chats. Frontend is a React SPA, backend is PocketBase (standalone executable).

**Tech Stack:**
- Frontend: React 19 + TypeScript + Vite + Tailwind CSS 4 + Jotai + wouter
- Backend: PocketBase with custom hooks and migrations
- Package Manager: bun
- Real-time: PocketBase SSE (Server-Sent Events) subscriptions

## Development Commands

### Frontend
```bash
cd frontend
bun install           # Install dependencies
bun run dev          # Start dev server on port 3000
bun run build        # Production build
bun run preview      # Preview production build
```

### Backend (PocketBase)
```bash
cd backend
./pocketbase serve   # Start server on port 8090

# Reset database and setup test data
./reset-and-setup.sh              # Automated reset
# Then manually create admin at http://127.0.0.1:8090/_/
# Credentials: vlad@vlad.studio / 1234567890

npm install          # Install setup script dependencies
npm run setup        # Create test users and data
```

Test users: `a@test.com` / `1234567890` and `b@test.com` / `1234567890`

### Production Build
```bash
./build.sh          # Creates deploy/ with frontend build + backend files
```

## Architecture

### Backend: PocketBase

**Collections:**
- `users` (auth) - name, email, avatar, language, theme, background, role
- `chats` - participants (DMs or group chats)
- `messages` - chat + sender + content + type (text/image/video/audio)
- `chat_read_status` - tracks last read message per user per chat
- `presence` - real-time user online status

**Custom Hooks** (`pb_hooks/`):
- `auth_logging.pb.js` - logs authentication events
- `chat_hooks.pb.js` - auto-creates chats, message logic, FCM push notifications
- `invitations.pb.js` - secure signup endpoint, role/password validation

**Migrations** (`pb_migrations/`) - schema definitions and access rules

### Frontend: React SPA

**Routing** (wouter):
- `/login` - authentication
- `/admin` - admin panel (user management)
- `/settings` - user settings (profile, preferences, logout)
- `/chat/:chatId?` - main chat interface

**State Management:**
- Jotai for global state (call store)
- React hooks + local state for component state
- PocketBase real-time subscriptions for live data

**Service Layer** (`src/services/pocketbase.ts`):
Organized by collection: `auth`, `users`, `chats`, `messages`, `chatReadStatus`, `presence`.
Each service exports CRUD methods and real-time subscription helpers.

**Custom Hooks** (`src/hooks/`):
- `useMessageList` - infinite scroll message loading with real-time updates
- `useUnreadMessages` - tracks unread counts across chats
- `useTypingIndicator` - typing status broadcast/display
- `usePresence` - user online/offline status
- `useFileUpload` - image/video upload with compression
- `useConnectionStatus` - network connectivity monitoring
- `useTheme` - theme management (light/dark/system)

**Component Structure:**
- `pages/` - route-level components (ChatPage, AdminPage, UserSettingsPage, LoginPage)
- `components/` - reusable UI components (Sidebar, ChatWindow, ChatDialog, etc.)
- `ui/` - base UI primitives (@base-ui-components/react + custom)

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

### Message Loading
Uses cursor-based pagination with `useMessageList` hook. Loads older messages on scroll, subscribes to new messages via SSE.

### File Uploads
Images/videos are compressed client-side before upload. See `useFileUpload` and `useVideoCompression` hooks.

### Chat Creation Logic
Users can create chats with any combination of participants. Backend hook auto-creates read status for all participants.
See `pb_hooks/chat_hooks.pb.js`

### Authentication Flow
- Login via `auth.login()` from service layer
- Auth state stored in PocketBase SDK authStore
- `ProtectedRoute` and `AdminRoute` wrappers enforce access
- Auth changes trigger app-wide re-renders via `auth.onChange()`

### Presence System
Users broadcast online status every 30s via `presence` collection. Offline if no update in 60s. See `usePresence` hook.

## Environment Variables

**Frontend** (`.env` in `frontend/`):
```
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

**Backend** (`.env` in `backend/`):
```
FCM_API_KEY=<random-secret-key>  # Required for push notifications
```

Generate a secure key: `openssl rand -hex 32`

Both PocketBase and FCM service read this variable for authenticated communication.

## Important Notes

- Always use `bun` not `npm` for frontend dependencies
- PocketBase must be running before frontend can work
- When modifying schema, create migrations via PocketBase admin UI
- Real-time subscriptions auto-reconnect on disconnect
- All dates/times are handled by PocketBase (created/updated fields)
- File uploads go to PocketBase storage, URLs are relative
- User roles: "Admin" (full access) or "Member" (limited)
