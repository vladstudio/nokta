# Space Chat Implementation Plan

## Phase 1: Backend Setup
- [x] Initialize PocketBase
- [x] Create collections schema (users, spaces, space_members, chats, messages)
- [x] Configure auth & access rules (email/password only)
- [x] Test API endpoints

## Phase 2: Admin UI
- [x] Setup Vite + React + wouter + Tailwind (not 9ui yet)
- [x] Login page with PocketBase auth
- [x] Protected routes (basic auth check, not admin-specific)
- [x] Spaces list page
- [x] Create/edit space (no delete)
- [x] Space members management (add, view, change roles)
- [x] Chats page (read-only admin view)

## Phase 3: Chat Infrastructure
- [x] Auto-generate space-wide chat (backend hook)
- [x] Auto-generate DM chats between members (backend hook)
- [x] Backend collections created
- [ ] PocketBase real-time subscriptions (frontend)
- [ ] TinyBase MergeableStore setup (frontend)
- [ ] Message sync logic (frontend)
- [ ] Message sending UI

## Phase 4: Frontend Core
- [x] Vite + React + TinyBase setup
- [x] Auth forms (login/register)
- [x] Space dashboard
- [x] Chat list sidebar
- [x] Chat window with messages
- [x] Real-time message updates (PocketBase SSE)
- [x] Responsive layouts (mobile-first)

## Phase 5: Polish & Advanced
- [ ] Typing indicators
- [ ] Online status
- [ ] Profile management
- [ ] File uploads (future)
- [ ] Notifications (future)
