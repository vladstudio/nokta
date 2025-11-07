# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Talk is a real-time chat application built with PocketBase (backend) and React (frontend, admin). The architecture consists of three separate applications:
- **Backend**: PocketBase server with custom hooks for auto-generating chats
- **Frontend**: User-facing React SPA for messaging
- **Admin**: React SPA for space and member management

## Development Commands

### Running the applications
```bash
# Backend (PocketBase server)
cd backend && ./pocketbase serve

# Frontend (runs on port 3000)
cd frontend && npm run dev

# Admin (runs on port 5173)
cd admin && npm run dev
```

### Building
```bash
# Frontend
cd frontend && npm run build

# Admin
cd admin && npm run build
cd admin && npm run lint  # Run ESLint
```

### Access URLs
- Frontend: http://localhost:3000
- Admin: http://localhost:5173
- PocketBase API: http://127.0.0.1:8090/api/
- PocketBase Dashboard: http://127.0.0.1:8090/_/

### Test Credentials
- **Admin (PocketBase Dashboard)**: vlad@vlad.studio / 1234567890
- **Test Users (Frontend App)**:
  - a@test.com / 1234567890 (Alice)
  - b@test.com / 1234567890 (Bob)

## Architecture

### Backend (PocketBase)
- **Location**: `/backend`
- **Database**: SQLite stored in `pb_data/`
- **Migrations**: `pb_migrations/` - auto-generated schema migrations
- **Hooks**: `pb_hooks/auto_create_chats.pb.js` - critical business logic for auto-generating chats

### Collections Schema
- **users**: Auth collection with `last_seen` field for presence tracking
- **spaces**: Base collection for workspaces/groups
- **space_members**: Junction table linking users to spaces with role (admin/member)
- **chats**: Conversations with `type` (public/private) and `participants` array
- **messages**: Chat messages with `sender`, `content`, and `type` fields
- **typing_events**: Ephemeral typing indicator events

### Auto-Chat Creation Logic
The `auto_create_chats.pb.js` hook automatically:
1. Creates a "General" public chat when a space is created
2. Creates DM (private) chats between all members when a user joins a space
3. Uses sorted participant IDs to prevent duplicates
4. Includes comprehensive error handling and logging

### Frontend Architecture

#### Frontend App (`/frontend`)
- **Router**: wouter (lightweight React router)
- **Styling**: Tailwind CSS 4
- **State**: React hooks + PocketBase real-time subscriptions
- **Key Features**:
  - Real-time messaging via PocketBase SSE
  - IndexedDB caching (`messageCache.ts`)
  - Offline message queue with retry (`messageQueue.ts`)
  - Optimistic UI updates
  - Connection status monitoring
  - Typing indicators
  - User presence/online status

#### Admin App (`/admin`)
- **Purpose**: Space and member management (admin-only)
- **Tech**: Same stack as frontend (React + wouter + Tailwind)
- **Features**: CRUD for spaces, member management, role assignment

### PocketBase Integration Pattern

Both frontend and admin use a service layer pattern (`services/pocketbase.ts`):
```typescript
// API modules
auth      // login, register, logout, user state
spaces    // list, getOne
chats     // list, getOne, subscribe/unsubscribe
messages  // list, create, subscribe/unsubscribe
```

Real-time subscriptions use PocketBase SSE:
```typescript
pb.collection('messages').subscribe('*', callback, { filter })
```

### Key React Hooks
- `usePresence`: Tracks user online/offline status via heartbeat
- `useConnectionStatus`: Monitors PocketBase connection health
- `useTypingIndicator`: Manages typing event broadcast/display

### State Management Strategy
- No external state library (Zustand, Redux, etc.)
- Local React state + PocketBase real-time sync
- IndexedDB for offline cache
- Message queue for failed sends

## Important Implementation Details

### Message Handling Flow
1. User sends message → Optimistic UI update
2. Message added to retry queue
3. API call to PocketBase
4. On success: remove from queue, update cache
5. On failure: keep in queue for retry on reconnect

### Chat Name Display Logic
- **Public chats**: Use `chat.name` field (e.g., "General")
- **Private (DM) chats**: Generate name from participants excluding current user

### Access Control
PocketBase rules enforce that users can only:
- See messages in chats where they're participants
- View space members for spaces they belong to
- Access chats within their spaces

### Presence System
- Users update `last_seen` every 30 seconds
- Considered online if `last_seen` < 2 minutes old
- Heartbeat sent even when idle to maintain presence

## Common Development Patterns

### Adding a new message type
1. Update `messages.type` enum in PocketBase schema
2. Add type to TypeScript types (`types/index.ts`)
3. Update message rendering in `ChatWindow` component
4. Add send logic in message input handler

### Adding real-time features
1. Check if collection exists or create migration
2. Add subscribe/unsubscribe methods to `services/pocketbase.ts`
3. Create React hook for subscription lifecycle
4. Use hook in component with cleanup

### Modifying auto-chat logic
- Edit `backend/pb_hooks/auto_create_chats.pb.js`
- PocketBase auto-reloads hooks on file change
- Check logs in terminal where PocketBase is running
- Test by creating spaces/adding members via admin

## Testing
- Test users and data available via PocketBase dashboard
- Use admin app to create test spaces and members
- Monitor PocketBase logs for hook execution
- Check browser DevTools for real-time subscription events

## Build & Deployment Notes
- Frontend/admin build to static files (`npm run build`)
- PocketBase is a single binary (`./pocketbase`)
- `pb_data/` contains all database and uploaded files
- Migrations are version-controlled in `pb_migrations/`
- Environment variables: Set `VITE_POCKETBASE_URL` for production builds

## Key Files Reference
- `backend/pb_hooks/auto_create_chats.pb.js`: Auto-chat creation logic
- `frontend/src/services/pocketbase.ts`: API client and real-time subscriptions
- `frontend/src/utils/messageCache.ts`: IndexedDB caching layer
- `frontend/src/utils/messageQueue.ts`: Offline message retry queue
- `frontend/src/hooks/usePresence.ts`: User online/offline tracking
- `project.md`: Full technical specification and UI/UX design
- `plan.md`: Implementation progress checklist
