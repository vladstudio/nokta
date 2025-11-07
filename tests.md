# E2E Test Workflows for Space Chat Application

This document describes comprehensive end-to-end test workflows for the Space Chat application, covering both the Admin and Frontend applications.

## Test Environment Setup

- **Backend**: PocketBase server running on `http://127.0.0.1:8090`
- **Admin App**: Running on `http://localhost:5173` (default Vite port)
- **Frontend App**: Running on `http://localhost:5174` (or next available port)
- **Test Data**: Requires at least 2 test users and 1 space for comprehensive testing

---

## Admin Application Tests

### 1. Admin Authentication Flow

**Objective**: Verify admin login and route protection

**Steps**:
1. Navigate to admin app (`http://localhost:5173`)
2. Verify redirect to `/login` if not authenticated
3. Enter valid admin credentials (email/password)
4. Click "Login" button
5. Verify redirect to spaces list (`/`)
6. Verify auth token stored in PocketBase authStore
7. Logout and verify redirect back to `/login`
8. Try accessing protected route while logged out (e.g., `/spaces/new`)
9. Verify redirect to `/login`

**Expected Results**:
- Successful login redirects to spaces list
- Protected routes are blocked when unauthenticated
- Auth state persists across page refreshes
- Logout clears auth state

**Errors to Check**:
- Invalid credentials show error message
- Network errors handled gracefully
- No console errors during auth flow

---

### 2. Space Management Flow

**Objective**: Test CRUD operations on spaces

**Steps**:
1. Login as admin
2. View spaces list at `/`
3. Click "Create New Space" button
4. Enter space name (e.g., "Test Family Space")
5. Submit form
6. Verify new space appears in list
7. Click on space to view details
8. Click "Edit" button
9. Change space name
10. Save changes
11. Verify updated name shows in list

**Expected Results**:
- New space created successfully
- Space appears in list immediately
- Edit updates space name
- Changes persist after refresh

**Errors to Check**:
- Empty space name shows validation error
- Duplicate space names handled
- Network errors show appropriate message
- No console errors

---

### 3. Member Management Flow

**Objective**: Test adding users to spaces and managing roles

**Steps**:
1. Login as admin
2. Navigate to a space detail page
3. Click "Add Member" button
4. Select a user from dropdown
5. Assign role (admin or member)
6. Submit
7. Verify user appears in members list
8. Click "Change Role" for the user
9. Switch role (member → admin or vice versa)
10. Save changes
11. Verify role updated in list

**Expected Results**:
- Users can be added to spaces
- Roles can be changed
- Space-wide chat auto-created when first member added
- DM chats auto-generated between all members
- Changes reflect in frontend app immediately

**Errors to Check**:
- Cannot add same user twice
- Role changes validate correctly
- PocketBase hooks execute (chat creation)
- No console errors

---

### 4. Chat Management Flow

**Objective**: View and verify chats in a space

**Steps**:
1. Login as admin
2. Navigate to a space
3. Click "View Chats" or navigate to `/spaces/:id/chats`
4. Verify space-wide chat exists (type: public)
5. Verify DM chats between members exist (type: private)
6. Check chat participants
7. Verify chat names (space-wide has name, DMs may not)

**Expected Results**:
- All expected chats are visible
- Chat types correctly labeled
- Participants list accurate
- Space-wide chat appears first

**Errors to Check**:
- Missing chats indicate hook failure
- Participant relations load correctly
- No console errors

---

## Frontend Application Tests

### 5. User Registration & Authentication Flow

**Objective**: Test user signup, login, and logout

**Steps**:
1. Navigate to frontend app (`http://localhost:5174`)
2. Verify redirect to `/login` if not authenticated
3. Click "Sign up" toggle
4. Enter email
5. Enter invalid password (too short) - verify validation error
6. Enter valid password (8+ chars, uppercase, lowercase, numbers)
7. Submit registration
8. Verify redirect to `/spaces`
9. Logout
10. Login with same credentials
11. Verify redirect to `/spaces`
12. Try invalid credentials - verify error message

**Expected Results**:
- Registration validates password requirements
- Successful registration logs user in
- Login works with registered credentials
- Logout clears auth state
- Invalid credentials show error

**Errors to Check**:
- Password validation shows clear messages
- Network errors handled
- No console errors during auth flow

---

### 6. Space Navigation Flow

**Objective**: Navigate spaces and chats

**Steps**:
1. Login as user who is member of multiple spaces
2. View spaces list at `/spaces`
3. Verify only spaces user is member of appear
4. Click on a space
5. Verify redirect to `/spaces/:id`
6. Verify chat list appears in sidebar
7. Verify space-wide chat listed first
8. Verify DM chats listed with participant names
9. Click on a chat
10. Verify chat loads in main window

**Expected Results**:
- Only user's spaces visible
- Chat list shows all accessible chats
- Space-wide chat clearly marked
- DM chats show other participant's name
- Chat selection loads messages

**Errors to Check**:
- No unauthorized spaces visible
- Empty states handled (no spaces, no chats)
- Loading states show appropriately
- No console errors

---

### 7. Messaging Flow (Online)

**Objective**: Send and receive messages while online

**Steps**:
1. Login as user
2. Navigate to a chat
3. Type a message in input field
4. Press Enter to send
5. Verify message appears immediately with "Sending..." or sent indicator
6. Verify message persists after send completes
7. Send another message with Send button
8. Refresh page
9. Verify both messages still visible
10. Check IndexedDB cache contains messages

**Expected Results**:
- Messages appear instantly (optimistic UI)
- Sent messages have timestamp
- Messages persist after refresh
- Messages cached in IndexedDB
- Scroll auto-scrolls to latest message

**Errors to Check**:
- Empty messages not sent
- Send failures show retry button
- Message order correct (by timestamp)
- No console errors
- No duplicate messages

---

### 8. Real-time Messaging Flow (Multi-User)

**Objective**: Test real-time message delivery between users

**Setup**: Open two browser windows or use two devices

**Steps**:
1. Window 1: Login as User A
2. Window 2: Login as User B (different user in same space)
3. Both: Navigate to same chat
4. Window 1: Send message "Hello from User A"
5. Window 2: Verify message appears in real-time (no refresh)
6. Window 2: Send message "Hello from User B"
7. Window 1: Verify message appears in real-time
8. Verify message order correct in both windows
9. Verify timestamps accurate

**Expected Results**:
- Messages appear in both windows instantly
- No refresh needed
- Message order consistent
- Timestamps accurate
- WebSocket subscription active

**Errors to Check**:
- No message duplication
- No missing messages
- Subscription reconnects on disconnect
- No console errors in either window

---

### 9. Typing Indicator Flow

**Objective**: Test typing indicators between users

**Setup**: Two browser windows with different users in same chat

**Steps**:
1. Window 1 (User A): Start typing in message input
2. Window 2 (User B): Verify typing indicator appears showing "User A is typing..."
3. Window 1: Stop typing for 3+ seconds
4. Window 2: Verify typing indicator disappears
5. Window 2 (User B): Start typing
6. Window 1 (User A): Verify typing indicator appears
7. Window 2: Send message
8. Verify typing indicator disappears in Window 1

**Expected Results**:
- Typing indicator appears within 500ms (debounced)
- Indicator shows correct user name
- Indicator disappears after 3 seconds of inactivity
- Indicator disappears when message sent
- Multiple typers handled correctly

**Errors to Check**:
- Typing events not sent excessively (debounce working)
- No stuck indicators
- No console errors
- PocketBase `typing_events` collection working

---

### 10. Online Presence Flow

**Objective**: Test user online/offline status indicators

**Setup**: Two browser windows with different users

**Steps**:
1. Window 1: Login as User A
2. Window 2: Login as User B (in same space)
3. Both: Navigate to chat with both users
4. Verify both users show as online (green dot or similar)
5. Window 1: Close browser or disconnect network
6. Window 2: Wait 2+ minutes
7. Verify User A shows as offline
8. Window 1: Reconnect/reopen
9. Window 2: Verify User A shows as online again

**Expected Results**:
- Online users have visual indicator
- Offline threshold is 2 minutes
- Presence updates automatically (30-second polling)
- Last seen timestamp accurate

**Errors to Check**:
- Heartbeat sent every 30 seconds (check network tab)
- No excessive requests
- Presence state accurate
- No console errors

---

### 11. Offline Messaging Flow

**Objective**: Test message queuing when offline

**Steps**:
1. Login and navigate to a chat
2. Open DevTools Network tab
3. Set network to "Offline" (Chrome) or disconnect
4. Verify connection banner appears ("You are offline")
5. Type and send message "Offline message 1"
6. Verify message appears with "Queued" or "Sending..." status
7. Send another message "Offline message 2"
8. Verify both messages queued
9. Reconnect network (set to "Online")
10. Verify connection banner disappears
11. Verify both messages send successfully
12. Verify messages persist on refresh

**Expected Results**:
- Offline banner appears immediately
- Messages queue locally (not lost)
- Queued messages visible with status indicator
- On reconnect, queue processes automatically
- All queued messages send successfully
- No duplicate messages

**Errors to Check**:
- Message queue persists (in memory)
- Failed messages show retry button
- Max retry attempts respected (3 retries)
- No console errors
- IndexedDB cache updated after send

---

### 12. Message Cache & Performance Flow

**Objective**: Test IndexedDB message caching

**Steps**:
1. Login and navigate to a chat
2. Send 5-10 messages
3. Open DevTools → Application → IndexedDB
4. Verify `message-cache` database exists
5. Verify messages stored by chat ID
6. Close and reopen browser (or hard refresh)
7. Login again and navigate to same chat
8. Verify messages load instantly from cache
9. Verify fresh data syncs from server
10. Check Network tab - verify API call made to fetch fresh messages
11. Compare cached vs fresh messages

**Expected Results**:
- Messages cached in IndexedDB immediately after send
- Cache organized by chat ID
- Messages load from cache instantly (no loading spinner)
- Fresh data syncs in background
- Cache updates with fresh data
- Old messages cleaned up (if cache strategy implemented)

**Errors to Check**:
- IndexedDB operations don't fail
- Cache/server data conflicts resolved
- No duplicate messages from cache + server
- No console errors

---

### 13. Connection Status Monitoring

**Objective**: Test connection status indicator

**Steps**:
1. Login and navigate to a chat
2. Open DevTools Console
3. Go offline (network tab or disconnect)
4. Verify connection banner appears with "You are offline" message
5. Verify banner styled prominently (red/yellow background)
6. Go back online
7. Verify banner disappears
8. Simulate PocketBase server down (kill backend process)
9. Wait 10 seconds (health check interval)
10. Verify connection banner appears
11. Restart PocketBase
12. Verify banner disappears

**Expected Results**:
- Banner appears on browser offline
- Banner appears on PocketBase health check failure
- Banner dismisses when connection restored
- Health checks run every 10 seconds
- No false positives/negatives

**Errors to Check**:
- Health check endpoint working (`/api/health`)
- Browser `navigator.onLine` events firing
- Connection state updates across all components
- No console errors

---

### 14. Error Handling & Recovery

**Objective**: Test error boundaries and retry mechanisms

**Steps**:
1. **Invalid Login**: Enter wrong credentials, verify error message
2. **Network Error During Send**:
   - Send message while online
   - Quickly go offline mid-send
   - Verify retry mechanism kicks in
3. **Failed Message Retry**:
   - Send message that fails
   - Click retry button
   - Verify message sends successfully
4. **Component Crash**:
   - Trigger error (if possible, inject error in component)
   - Verify ErrorBoundary catches and shows fallback UI
5. **Message Fetch Error**:
   - Disconnect from PocketBase
   - Try loading chat
   - Verify error handled gracefully

**Expected Results**:
- All errors show user-friendly messages
- Retry mechanisms work correctly
- ErrorBoundary prevents full app crash
- Failed operations recoverable
- Network errors don't lose user data

**Errors to Check**:
- Console shows meaningful error logs
- No unhandled promise rejections
- Error messages clear and actionable
- Recovery mechanisms work

---

## Performance & Quality Checks

### 15. Performance Benchmarks

**Metrics to Check**:
- **Initial Load**: < 2 seconds to interactive
- **Message Send**: < 100ms to appear (optimistic UI)
- **Real-time Update**: < 500ms message delivery
- **Cache Load**: < 50ms to display cached messages
- **Memory Usage**: No memory leaks over time
- **Bundle Size**: Check Vite build output

**Tools**:
- Chrome DevTools Performance tab
- Lighthouse audit
- Network tab waterfall
- Memory profiler

---

### 16. Accessibility Checks

**Tests**:
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader compatibility (ARIA labels)
- Focus indicators visible
- Color contrast meets WCAG AA
- Touch targets 44px+ on mobile

**Tools**:
- Chrome DevTools Lighthouse accessibility audit
- axe DevTools extension

---

### 17. Responsive Design Checks

**Breakpoints to Test**:
- Mobile: 375px (iPhone SE)
- Mobile: 390px (iPhone 12/13)
- Tablet: 768px (iPad)
- Desktop: 1024px+
- Wide: 1440px+

**Tests**:
- Layout adapts at breakpoints
- Chat list collapses on mobile
- Touch interactions work
- No horizontal scroll
- Text readable at all sizes

---

## Browser Compatibility

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Known Issues / Edge Cases to Test

1. **Rapid Message Sending**: Send 10+ messages quickly - verify order
2. **Large Messages**: Send very long message (1000+ chars) - verify UI
3. **Special Characters**: Send message with emoji, Unicode - verify encoding
4. **Concurrent Edits**: Two users in same space simultaneously - verify no race conditions
5. **Token Expiration**: Wait for auth token to expire - verify reauth flow
6. **Slow Network**: Throttle to Slow 3G - verify UX remains usable
7. **Multiple Tabs**: Open app in multiple tabs as same user - verify state sync

---

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No network request failures (except intentional offline tests)
- ✅ No data loss
- ✅ No UI glitches
- ✅ Responsive and accessible
- ✅ Real-time features work reliably
- ✅ Offline support functions correctly
- ✅ Performance metrics met

---

## Test Execution Checklist

- [ ] Backend PocketBase running and healthy
- [ ] Admin app running and accessible
- [ ] Frontend app running and accessible
- [ ] Test users created in database
- [ ] Test spaces and chats set up
- [ ] Browser DevTools open for debugging
- [ ] Network tab monitoring requests
- [ ] Console tab checking for errors
- [ ] Application tab checking IndexedDB
- [ ] Execute each test workflow
- [ ] Document all bugs found
- [ ] Fix critical issues
- [ ] Retest after fixes
