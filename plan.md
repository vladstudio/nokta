# Space Chat Implementation Plan

## Phase 1: Backend Setup
- [x] Initialize PocketBase
- [x] Create collections schema (users, spaces, space_members, chats, messages)
- [x] Configure auth & access rules (email/password only)
- [x] Test API endpoints

## Phase 2: Admin UI
- [x] Setup Vite + React + wouter + 9ui
- [x] Login page with PocketBase auth
- [x] Protected routes (admin check)
- [x] Spaces list page
- [x] Create/edit space
- [x] Space members management

## Phase 3: Chat Infrastructure
- [ ] Auto-generate space-wide chat
- [ ] Auto-generate DM chats between members
- [ ] PocketBase real-time subscriptions
- [ ] TinyBase MergeableStore setup
- [ ] Message sync logic

## Phase 4: Frontend Core
- [ ] Vite + React + TinyBase setup
- [ ] Auth forms (login/register)
- [ ] Space dashboard
- [ ] Chat list sidebar
- [ ] Chat window with messages
- [ ] Real-time message updates
- [ ] Responsive layouts

## Phase 5: Polish & Advanced
- [ ] Typing indicators
- [ ] Online status
- [ ] Profile management
- [ ] File uploads (future)
- [ ] Notifications (future)
