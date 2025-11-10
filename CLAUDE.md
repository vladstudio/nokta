# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Tech Stack

**Frontend (React SPA - Port 3000)**
- React 19.1.1 + TypeScript 5.7
- Vite 7.0 (build tool)
- Tailwind CSS 4 (no CSS-in-JS)
- wouter (lightweight routing, NOT React Router)
- PocketBase SDK 0.26.3
- i18next (internationalization: en, ru)
- @daily-co/daily-react (video calling)
- @base-ui-components/react (headless UI)
- Jotai (minimal state management)

**Backend (PocketBase - Port 8090)**
- PocketBase 0.26.3 (standalone binary, no npm)
- SQLite (embedded database)
- JavaScript hooks (pb_hooks/*.pb.js)

**Package Manager**: Use `bun` for all package operations (project.md requirement)

## Development Commands

### Frontend
```bash
cd frontend
bun install          # Install dependencies
bun run dev          # Start dev server (http://localhost:3000)
bun run build        # Production build
bun run preview      # Preview production build
```

### Backend
```bash
cd backend
./pocketbase serve   # Start PocketBase (http://127.0.0.1:8090)

# Database reset + test data setup
rm -rf pb_data
./pocketbase serve   # Create admin at http://127.0.0.1:8090/_/ first
npm run setup        # Creates test users/spaces/messages
```

**Test Credentials**:
- Admin: vlad@vlad.studio / 1234567890 (PocketBase dashboard)
- Alice: a@test.com / 1234567890 (frontend app)
- Bob: b@test.com / 1234567890 (frontend app)

## Architecture Principles

### State Management Pattern
- **NO** Redux, Zustand, or Recoil for most state
- Pure React hooks (useState/useEffect) + PocketBase real-time subscriptions
- Jotai ONLY for minimal global state (e.g., video call state)
- Custom hooks in `src/hooks/` encapsulate complex real-time logic

### Service Layer Pattern
- Single `src/services/pocketbase.ts` file (6.4KB)
- Namespace-based API: `auth.login()`, `spaces.list()`, `messages.send()`, `calls.*`
- NO class-based services, NO Redux thunks

### Real-Time Protocol
- **SSE (Server-Sent Events)**, NOT WebSockets
- ~30 second latency for message delivery (acceptable for chat, NOT real-time gaming)
- Subscriptions in custom hooks (useMessageList, usePresence, useTypingIndicator)
- PocketBase SDK handles reconnection automatically

### Optimistic UI + Offline Support
- Messages appear instantly with `tempId` before server confirmation
- IndexedDB cache (`utils/messageCache.ts`) for offline message viewing
- Message queue (`utils/messageQueue.ts`) retries failed sends on reconnect
- `useConnectionStatus` hook monitors online/offline state

### PocketBase Hooks (Server-Side Logic)
- `pb_hooks/auto_create_chats.pb.js` - Auto-creates General chat + DM chats
- Hooks use PocketBase's JavaScript runtime (NOT Node.js)
- Use `onRecordAfterCreateSuccess`, `onRecordAfterUpdateSuccess` events
- Always add error handling and logging

## Key Custom Hooks

Located in `src/hooks/`:

- `useMessageList` - Fetch messages with pagination, real-time updates via SSE
- `usePresence` - Heartbeat every 30s, tracks user online status
- `useTypingIndicator` - Broadcasts/listens to typing events (debounced 500ms)
- `useUnreadMessages` - Tracks unread count per chat
- `useConnectionStatus` - Browser online/offline + PocketBase health check
- `useFileUpload` - File upload with progress tracking
- `useFavicon` - Updates favicon badge for unread messages

## Database Schema (PocketBase Collections)

- **users** (auth) - id, email, name, avatar, last_seen, language
- **spaces** - id, name
- **space_members** - space, user, role (admin|member)
- **chats** - space, type (public|private), participants[], name, last_message_at
- **messages** - chat, sender, type (text|image|file), content, file
- **chat_read_status** - user, chat, last_read_at
- **typing_events** (ephemeral) - chat, user, userName, timestamp

## Environment Variables

Create `frontend/.env`:
```
VITE_POCKETBASE_URL=http://127.0.0.1:8090
```

## Important Patterns & Conventions

### Message Flow
1. User sends message → Create optimistic message with `tempId`
2. Add to state + IndexedDB + message queue → POST to API
3. Success → Replace `tempId` with real ID, remove from queue
4. Failure → Keep in queue, show retry button

### File Uploads
- Images (JPEG, PNG) generate thumbnails
- PDFs and documents supported
- Progress tracking via `useFileUpload`
- Queued if offline

### Routing (wouter)
- `/login` - LoginPage (public)
- `/my-spaces` - MySpacesPage (list of spaces)
- `/spaces/:spaceId/chat/:chatId?` - SpacePage (main chat UI)

### Video Calling
- Daily.co SDK integration (`@daily-co/daily-react`)
- Service layer: `src/services/daily.ts` and `src/services/calls.ts`
- Video features conditionally rendered based on Daily.co configuration
- See `docs/daily-react.md` for comprehensive Daily.co documentation

### TypeScript
- Strict mode enabled
- Types in `src/types/` (User, Space, Chat, Message, etc.)
- No `any` types allowed (noUnusedLocals, noUnusedParameters enabled)

### UI Components
- Base components in `src/ui/` (Button, Input, Dialog, etc.)
- Built with @base-ui-components/react (headless)
- Styled with Tailwind CSS 4 classes
- See `docs/base-ui.md` for component documentation

### Internationalization
- `src/i18n/` contains translations (en.json, ru.json)
- User language stored in `users.language` field
- Use `useTranslation()` hook from react-i18next

## Deployment Constraints

- **Backend**: Single PocketBase binary, NOT horizontally scalable
- SQLite database in `pb_data/` (backup this directory)
- **Frontend**: Static SPA, deploy to CDN/Vercel/Netlify

## Notable Architectural Decisions

1. **No external state management library** - React hooks + PocketBase SSE is sufficient
2. **Single service file** - Keeps API layer simple and discoverable
3. **Custom hooks over Context** - Better performance, easier testing
4. **SSE over WebSocket** - PocketBase limitation, but simpler infrastructure
5. **Optimistic UI everywhere** - Better perceived performance
6. **IndexedDB cache** - Enables offline message viewing

## Documentation

- `docs/pocketbase/` - PocketBase API documentation
- `docs/wouter.md` - Router documentation
- `docs/base-ui.md` - UI component documentation
- `docs/daily-react.md` - Daily.co video call documentation
- `project.md` - Original project specification
- `ARCHITECTURE_SUMMARY.txt` - Detailed architecture overview
