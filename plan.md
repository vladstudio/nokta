# "Talk" Implementation Plan

## Phase 1: Backend Setup
- [x] Initialize PocketBase
- [x] Create collections schema (users, spaces, space_members, chats, messages)
- [x] Configure auth & access rules (email/password only)
- [x] Test API endpoints

## Phase 2: Admin UI
- [x] Setup Vite + React + wouter + Tailwind
- [x] Login page with PocketBase auth
- [x] Protected routes
- [x] Spaces list page
- [x] Create/edit space
- [x] Space members management (add, view, change roles)
- [x] Chats page (read-only view)

## Phase 3: Chat Infrastructure
- [x] Auto-generate space-wide chat (backend hook)
- [x] Auto-generate DM chats between members (backend hook)
- [x] Backend collections created
- [x] PocketBase real-time subscriptions (frontend)
- [x] Message sending UI

## Phase 4: Frontend Core
- [x] Vite + React + TypeScript setup
- [x] Auth forms (login/register)
- [x] Space dashboard
- [x] Chat list sidebar
- [x] Chat window with messages
- [x] Real-time message updates
- [x] Responsive layouts

## Phase 5: UX Enhancements
- [x] Optimistic UI (show message immediately, rollback on error)
- [x] IndexedDB cache (store recent messages for instant load)
- [x] Retry queue (auto-retry failed sends when reconnected)
- [x] Connection status indicator (offline banner)
- [x] Typing indicators
- [x] Online status
- [x] Profile management

## future
- [ ] File uploads
- [ ] Notifications
