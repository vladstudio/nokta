# Unread Messages Implementation Plan

## Overview
Add unread message tracking and browser native notifications to the chat application, displaying unread counts in the chat list, resetting them when users open chats, and alerting users of new messages via desktop notifications.

## Requirements

### Core Functionality
1. Track number of unread messages per chat per user
2. Display unread count badge in chat list when count > 0
3. Reset unread count when user opens a chat
4. Auto-mark messages as read when user is actively viewing the chat
5. **Request notification permission on app mount (if not granted)**
6. **Show browser native notification when user receives a new message**
7. **Click notification to focus window and navigate to relevant chat**

### Additional Considerations
8. Handle real-time updates across multiple devices/tabs
9. Persist unread state (survive page refreshes)
10. Handle edge cases: deleted messages, user leaving chat, etc.
11. Optimize performance (avoid excessive DB queries)
12. Support offline mode (integrate with existing messageQueue/cache)
13. **Don't show notification if user is actively viewing the chat**
14. **Respect browser notification permissions and handle denial gracefully**

---

## Architecture Decision: Read Status Tracking Approach

### Chosen Approach: **Last Read Timestamp per User-Chat**

**Collection: `chat_read_status`**
- Stores one record per user-chat combination
- Tracks when user last read messages in that chat
- Unread count computed by counting messages created after `last_read_at`

**Why this approach:**
- ✅ Scalable: One record per user-chat (not per message)
- ✅ Simple queries: Compare timestamp to count unread
- ✅ Privacy-friendly: Only user sees their own read status
- ✅ Easy reset: Update single timestamp field
- ✅ Works with existing real-time architecture

**Alternatives considered:**
- ❌ `read_by` array on messages: Grows unbounded, complex queries
- ❌ `unread_count` field on chats: Requires aggregation logic, hard to sync

---

## Implementation Breakdown

### Phase 1: Database Schema & Backend

#### 1.1 Create Migration for `chat_read_status` Collection

**File:** `backend/pb_migrations/XXXXXXXXXX_add_chat_read_status.js`

**Schema:**
```javascript
{
  id: string (auto)
  user: string (relation to users, required)
  chat: string (relation to chats, required)
  last_read_at: datetime (required, default: NOW)
  created: datetime (auto)
  updated: datetime (auto)
}
```

**Indexes:**
- Composite unique index on `(user, chat)` to prevent duplicates
- Index on `user` for fast user-level queries

**Access Rules:**
```javascript
listRule:   "user = @request.auth.id"
viewRule:   "user = @request.auth.id"
createRule: "@request.auth.id != '' && user = @request.auth.id"
updateRule: "user = @request.auth.id"
deleteRule: "user = @request.auth.id"
```

**Why these rules:**
- Users can only see/manage their own read status
- Prevent spoofing: user field must match authenticated user
- Allow create/update for marking chats as read

#### 1.2 Initialize Read Status for Existing Data

**Options:**
- **Option A:** Lazy initialization - create read status on first chat open
- **Option B:** Migration script - create for all existing user-chat pairs
- **Option C:** Hook-based - auto-create when user joins space/chat

**Recommendation:** Use **Option A (Lazy)** + **Option C (Hook)**
- Lazy: Less DB overhead, only for active users
- Hook: Auto-create when user joins space (via `space_members` hook)

**Hook Update:** `backend/pb_hooks/auto_create_chats.pb.js`
- When user joins space, create `chat_read_status` for all chats in that space
- Set `last_read_at` to NOW (all messages marked as read initially)
- Prevents "all messages unread" on first join

---

### Phase 2: Frontend TypeScript Types

**File:** `frontend/src/types/index.ts`

#### 2.1 Add New Type

```typescript
export interface ChatReadStatus {
  id: string;
  user: string;
  chat: string;
  last_read_at: string; // ISO datetime
  created?: string;
  updated?: string;
}
```

#### 2.2 Extend Existing Chat Type

```typescript
export interface Chat {
  // ... existing fields
  unreadCount?: number; // Computed client-side, not from DB
}
```

**Note:** `unreadCount` is client-computed, not a DB field. Prevents need for complex aggregation queries.

---

### Phase 3: API Service Layer

**File:** `frontend/src/services/pocketbase.ts`

#### 3.1 Add `chatReadStatus` API Module

```typescript
export const chatReadStatus = {
  /**
   * Get read status for all chats in a space
   * Returns map of chatId -> last_read_at
   */
  async getForSpace(userId: string, spaceId: string): Promise<Map<string, string>> {
    const records = await pb.collection('chat_read_status').getFullList({
      filter: `user = "${userId}" && chat.space = "${spaceId}"`,
      expand: 'chat',
    });

    const map = new Map<string, string>();
    records.forEach(record => {
      map.set(record.chat, record.last_read_at);
    });
    return map;
  },

  /**
   * Get or create read status for a specific chat
   */
  async getOrCreate(userId: string, chatId: string): Promise<ChatReadStatus> {
    try {
      const records = await pb.collection('chat_read_status').getFullList({
        filter: `user = "${userId}" && chat = "${chatId}"`,
      });

      if (records.length > 0) {
        return records[0] as ChatReadStatus;
      }
    } catch (err) {
      // Doesn't exist, create it
    }

    return await pb.collection('chat_read_status').create({
      user: userId,
      chat: chatId,
      last_read_at: new Date().toISOString(),
    }) as ChatReadStatus;
  },

  /**
   * Mark chat as read (update last_read_at to now)
   */
  async markAsRead(userId: string, chatId: string): Promise<void> {
    const status = await this.getOrCreate(userId, chatId);

    await pb.collection('chat_read_status').update(status.id, {
      last_read_at: new Date().toISOString(),
    });
  },

  /**
   * Subscribe to read status changes (for multi-device sync)
   */
  subscribe(userId: string, callback: (data: any) => void) {
    return pb.collection('chat_read_status').subscribe('*', callback, {
      filter: `user = "${userId}"`,
    });
  },

  unsubscribe() {
    pb.collection('chat_read_status').unsubscribe();
  },
};
```

#### 3.2 Add Helper to Count Unread Messages

```typescript
/**
 * Count messages in a chat created after a specific timestamp
 */
export const messages = {
  // ... existing methods

  async countUnread(chatId: string, afterTimestamp: string): Promise<number> {
    const result = await pb.collection('messages').getList(1, 1, {
      filter: `chat = "${chatId}" && created > "${afterTimestamp}"`,
    });

    return result.totalItems;
  },
};
```

---

### Phase 4: React Hook for Unread Management

**File:** `frontend/src/hooks/useUnreadMessages.ts`

#### 4.1 Hook Implementation

```typescript
import { useState, useEffect } from 'react';
import { chatReadStatus, messages, auth } from '../services/pocketbase';
import type { Chat } from '../types';

/**
 * Manages unread message counts for all chats in a space
 *
 * @param spaceId - Current space ID
 * @param chats - List of chats in the space
 * @returns Object with unread counts and mark-as-read function
 */
export function useUnreadMessages(spaceId: string | undefined, chats: Chat[]) {
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());
  const userId = auth.user()?.id;

  useEffect(() => {
    if (!spaceId || !userId || chats.length === 0) {
      return;
    }

    // Load initial unread counts
    const loadUnreadCounts = async () => {
      try {
        // Get read status for all chats
        const readStatusMap = await chatReadStatus.getForSpace(userId, spaceId);

        // Compute unread count for each chat
        const counts = new Map<string, number>();

        await Promise.all(
          chats.map(async (chat) => {
            const lastReadAt = readStatusMap.get(chat.id);

            if (lastReadAt) {
              const count = await messages.countUnread(chat.id, lastReadAt);
              counts.set(chat.id, count);
            } else {
              // No read status yet, count all messages as unread
              const count = await messages.countUnread(chat.id, '1970-01-01 00:00:00');
              counts.set(chat.id, count);
            }
          })
        );

        setUnreadCounts(counts);
      } catch (err) {
        console.error('Failed to load unread counts:', err);
      }
    };

    loadUnreadCounts();

    // Subscribe to new messages across all chats in this space
    const handleNewMessage = (data: any) => {
      if (data.action === 'create') {
        const message = data.record;

        // Don't increment unread for messages sent by current user
        if (message.sender === userId) {
          return;
        }

        setUnreadCounts((prev) => {
          const newCounts = new Map(prev);
          const current = newCounts.get(message.chat) || 0;
          newCounts.set(message.chat, current + 1);
          return newCounts;
        });
      }
    };

    // Subscribe to messages in this space
    const chatIds = chats.map(c => c.id);
    const filter = chatIds.length > 0
      ? `chat.space = "${spaceId}"`
      : '';

    const unsubscribe = messages.subscribe('*', handleNewMessage);

    return () => {
      unsubscribe();
    };
  }, [spaceId, userId, chats]);

  /**
   * Mark a chat as read and reset its unread count
   */
  const markChatAsRead = async (chatId: string) => {
    if (!userId) return;

    try {
      await chatReadStatus.markAsRead(userId, chatId);

      // Immediately update local state
      setUnreadCounts((prev) => {
        const newCounts = new Map(prev);
        newCounts.set(chatId, 0);
        return newCounts;
      });
    } catch (err) {
      console.error('Failed to mark chat as read:', err);
    }
  };

  return {
    unreadCounts,
    markChatAsRead,
  };
}
```

---

### Phase 5: UI Component Updates

#### 5.1 Update `ChatList` Component

**File:** `frontend/src/components/ChatList.tsx`

**Changes:**
1. Accept `unreadCounts` prop from parent
2. Display unread badge when count > 0
3. Style badge (e.g., red circle with white text)
4. Bold chat name if unread

```typescript
interface ChatListProps {
  chats: Chat[];
  selectedChatId?: string;
  onChatSelect: (chatId: string) => void;
  unreadCounts?: Map<string, number>; // NEW
}

export function ChatList({
  chats,
  selectedChatId,
  onChatSelect,
  unreadCounts = new Map(), // NEW
}: ChatListProps) {
  // ... existing code

  return (
    <div className="space-y-2">
      {chats.map((chat) => {
        const unreadCount = unreadCounts.get(chat.id) || 0;
        const hasUnread = unreadCount > 0;

        return (
          <Button
            key={chat.id}
            // ... existing props
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="relative">
                <span className="text-2xl">{getChatIcon(chat)}</span>
                {/* Existing online status indicator */}
              </div>

              <div className="flex-1 min-w-0">
                {/* Make chat name bold if unread */}
                <div className={hasUnread ? 'font-semibold' : ''}>
                  {getChatName(chat)}
                </div>
                <div className="text-sm text-gray-500">
                  {chat.type === 'public' ? 'Public chat' : 'Direct message'}
                </div>
              </div>

              {/* NEW: Unread badge */}
              {hasUnread && (
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </div>
              )}
            </div>
          </Button>
        );
      })}
    </div>
  );
}
```

**Badge Styling Options:**
- Small red circle (like iOS/WhatsApp)
- Pill shape with count
- Blue (brand color) vs. red (traditional)
- Animated pulse for new messages

**Recommendation:** Red rounded pill with count, max "99+"

#### 5.2 Update `SpacePage` Component

**File:** `frontend/src/pages/SpacePage.tsx`

**Changes:**
1. Use `useUnreadMessages` hook
2. Pass `unreadCounts` to `ChatList`
3. Call `markChatAsRead` when chat is selected

```typescript
export function SpacePage() {
  const { spaceId, chatId } = useParams();
  const [chats, setChats] = useState<Chat[]>([]);

  // NEW: Unread messages hook
  const { unreadCounts, markChatAsRead } = useUnreadMessages(spaceId, chats);

  // ... existing code

  return (
    <div className="flex h-screen">
      <div className="w-80 border-r">
        <ChatList
          chats={chats}
          selectedChatId={chatId}
          onChatSelect={(id) => navigate(`/spaces/${spaceId}/${id}`)}
          unreadCounts={unreadCounts} // NEW
        />
      </div>

      <div className="flex-1">
        {chatId && (
          <ChatWindow
            chatId={chatId}
            onOpen={() => markChatAsRead(chatId)} // NEW
          />
        )}
      </div>
    </div>
  );
}
```

#### 5.3 Update `ChatWindow` Component

**File:** `frontend/src/components/ChatWindow.tsx`

**Changes:**
1. Accept `onOpen` callback prop
2. Call `onOpen()` when component mounts
3. Also call when window regains focus (tab switching)

```typescript
interface ChatWindowProps {
  chatId: string;
  onOpen?: () => void; // NEW
}

export function ChatWindow({ chatId, onOpen }: ChatWindowProps) {
  useEffect(() => {
    // Mark as read when chat is opened
    onOpen?.();
  }, [chatId, onOpen]);

  // Optional: Mark as read when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      onOpen?.();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [onOpen]);

  // ... existing code
}
```

---

### Phase 6: Edge Cases & Refinements

#### 6.1 Mark as Read on Scroll to Bottom

**Enhancement:** Only mark as read when user scrolls to the bottom of chat

**Implementation:**
```typescript
// In ChatWindow.tsx
const messagesEndRef = useRef<HTMLDivElement>(null);
const [isAtBottom, setIsAtBottom] = useState(true);

const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
  const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
  const atBottom = scrollHeight - scrollTop - clientHeight < 50;
  setIsAtBottom(atBottom);

  if (atBottom) {
    onOpen?.(); // Mark as read when scrolled to bottom
  }
};

// Only auto-mark as read if user is at bottom
useEffect(() => {
  if (isAtBottom) {
    onOpen?.();
  }
}, [messages, isAtBottom, onOpen]);
```

#### 6.2 Multi-Device Sync

**Scenario:** User opens chat on desktop, mobile should update unread count

**Solution:** Subscribe to `chat_read_status` changes in `useUnreadMessages`

```typescript
useEffect(() => {
  if (!userId || !spaceId) return;

  const handleReadStatusUpdate = (data: any) => {
    if (data.action === 'update' || data.action === 'create') {
      const status = data.record;
      // Refetch unread count for this chat
      messages.countUnread(status.chat, status.last_read_at).then(count => {
        setUnreadCounts(prev => {
          const newCounts = new Map(prev);
          newCounts.set(status.chat, count);
          return newCounts;
        });
      });
    }
  };

  const unsubscribe = chatReadStatus.subscribe(userId, handleReadStatusUpdate);
  return () => unsubscribe();
}, [userId, spaceId]);
```

#### 6.3 Offline Support

**Use Existing Infrastructure:**
- `messageCache` (IndexedDB) already stores messages
- Store read status in localStorage as fallback
- Sync when connection restored

```typescript
// In useUnreadMessages.ts
const STORAGE_KEY = 'unread_counts';

// Save to localStorage on change
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(unreadCounts.entries())));
}, [unreadCounts]);

// Load from localStorage on mount
useEffect(() => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    setUnreadCounts(new Map(JSON.parse(stored)));
  }
}, []);
```

#### 6.4 Deleted Messages

**Scenario:** User has 5 unread, 2 messages get deleted, unread should be 3

**Solution:** Refetch count when message is deleted

```typescript
// In useUnreadMessages.ts - message subscription handler
if (data.action === 'delete') {
  const message = data.record;

  // Refetch unread count for this chat
  const lastReadAt = readStatusMap.get(message.chat);
  if (lastReadAt) {
    messages.countUnread(message.chat, lastReadAt).then(count => {
      setUnreadCounts(prev => {
        const newCounts = new Map(prev);
        newCounts.set(message.chat, count);
        return newCounts;
      });
    });
  }
}
```

#### 6.5 User Leaves Chat/Space

**Scenario:** User removed from space, their read status should be cleaned up

**Options:**
- **Option A:** Keep orphaned records (harmless, small size)
- **Option B:** Cascade delete via PocketBase schema
- **Option C:** Cleanup hook when user removed from space

**Recommendation:** **Option B** - Add cascade delete to schema

```javascript
// In migration
{
  name: 'chat',
  type: 'relation',
  options: {
    cascadeDelete: true, // Delete read_status when chat deleted
  }
}
```

#### 6.6 Performance Optimization

**Problem:** Computing unread counts for many chats can be slow

**Solutions:**
1. **Batch queries:** Use `$or` filter to fetch multiple counts in one query
2. **Debounce updates:** Don't refetch on every new message
3. **Cache aggressively:** Store in localStorage, only refresh on mount/focus
4. **Virtualize list:** Only compute unread for visible chats (if >50 chats)

**Implementation of batched count:**
```typescript
// Optimize: Fetch total counts for all chats in one query
const totalMessages = await pb.collection('messages').getList(1, 500, {
  filter: `chat.space = "${spaceId}"`,
  fields: 'id,chat,created',
});

// Group by chat and count those after last_read_at
const counts = new Map<string, number>();
chats.forEach(chat => {
  const lastReadAt = readStatusMap.get(chat.id) || '1970-01-01';
  const unreadInChat = totalMessages.items.filter(
    msg => msg.chat === chat.id && msg.created > lastReadAt
  ).length;
  counts.set(chat.id, unreadInChat);
});
```

---

### Phase 6.7: Browser Native Notifications

#### Overview
Integrate browser native notifications to alert users of new messages when they're not actively viewing the chat. This includes permission management, notification display, and click handling.

---

#### 6.7.1 Notification Utility Module

**File:** `frontend/src/utils/notifications.ts`

Create a dedicated module to handle all notification-related logic:

```typescript
/**
 * Browser notification utility for new message alerts
 */

export interface NotificationPermissionState {
  granted: boolean;
  denied: boolean;
  canRequest: boolean;
}

/**
 * Check current notification permission status
 */
export function getNotificationPermission(): NotificationPermissionState {
  if (!('Notification' in window)) {
    return { granted: false, denied: true, canRequest: false };
  }

  const permission = Notification.permission;

  return {
    granted: permission === 'granted',
    denied: permission === 'denied',
    canRequest: permission === 'default',
  };
}

/**
 * Request notification permission from user
 * Should be called on user interaction (e.g., button click, app mount)
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('Browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('User has denied notification permission');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('Failed to request notification permission:', err);
    return false;
  }
}

/**
 * Show a notification for a new message
 *
 * @param title - Chat name or sender name
 * @param body - Message content (truncated if too long)
 * @param options - Additional notification options
 */
export function showMessageNotification(
  title: string,
  body: string,
  options?: {
    chatId?: string;
    spaceId?: string;
    icon?: string;
    tag?: string;
  }
): Notification | null {
  const permission = getNotificationPermission();

  if (!permission.granted) {
    return null;
  }

  try {
    // Truncate body if too long
    const truncatedBody = body.length > 100
      ? body.substring(0, 100) + '...'
      : body;

    const notification = new Notification(title, {
      body: truncatedBody,
      icon: options?.icon || '/logo.png', // App logo
      tag: options?.tag || `chat-${options?.chatId}`, // Prevent duplicates
      badge: '/logo-badge.png', // Small icon for mobile
      requireInteraction: false, // Auto-dismiss after timeout
      silent: false, // Play sound
      data: {
        chatId: options?.chatId,
        spaceId: options?.spaceId,
        timestamp: Date.now(),
      },
    });

    return notification;
  } catch (err) {
    console.error('Failed to show notification:', err);
    return null;
  }
}

/**
 * Handle notification click events
 * Focus window and navigate to the relevant chat
 */
export function setupNotificationClickHandler(
  onNotificationClick: (chatId: string, spaceId: string) => void
) {
  // Note: This needs to be set up on each Notification instance
  // We'll do this in the component that creates notifications
}

/**
 * Store notification preference in localStorage
 */
const NOTIFICATION_PREF_KEY = 'notification_preference';

export function setNotificationPreference(enabled: boolean) {
  localStorage.setItem(NOTIFICATION_PREF_KEY, JSON.stringify(enabled));
}

export function getNotificationPreference(): boolean {
  const stored = localStorage.getItem(NOTIFICATION_PREF_KEY);
  if (stored === null) {
    return true; // Default: enabled
  }
  return JSON.parse(stored);
}
```

---

#### 6.7.2 Request Permission on App Mount

**File:** `frontend/src/App.tsx` (or main layout component)

Request notification permission when the app loads:

```typescript
import { useEffect, useState } from 'react';
import { requestNotificationPermission, getNotificationPermission } from './utils/notifications';

export function App() {
  const [notificationPermission, setNotificationPermission] = useState(
    getNotificationPermission()
  );

  useEffect(() => {
    // Request permission on mount if not yet decided
    const requestPermission = async () => {
      if (notificationPermission.canRequest) {
        const granted = await requestNotificationPermission();
        setNotificationPermission(getNotificationPermission());

        if (granted) {
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied');
        }
      }
    };

    // Small delay to avoid immediate permission prompt on first visit
    // Let user see the app first
    const timer = setTimeout(requestPermission, 2000);

    return () => clearTimeout(timer);
  }, []);

  // ... rest of app
}
```

---

#### 6.7.3 Integrate Notifications with `useUnreadMessages` Hook

**File:** `frontend/src/hooks/useUnreadMessages.ts`

Extend the hook to show notifications when new messages arrive:

```typescript
import { showMessageNotification } from '../utils/notifications';

export function useUnreadMessages(
  spaceId: string | undefined,
  chats: Chat[],
  currentChatId?: string // NEW: track which chat is currently open
) {
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());
  const userId = auth.user()?.id;

  useEffect(() => {
    if (!spaceId || !userId || chats.length === 0) {
      return;
    }

    // ... existing code

    // Subscribe to new messages across all chats in this space
    const handleNewMessage = async (data: any) => {
      if (data.action === 'create') {
        const message = data.record;

        // Don't increment unread for messages sent by current user
        if (message.sender === userId) {
          return;
        }

        // Don't increment/notify if user is actively viewing this chat
        const isViewingChat = message.chat === currentChatId;
        const isWindowFocused = document.hasFocus();

        if (!isViewingChat || !isWindowFocused) {
          // Increment unread count
          setUnreadCounts((prev) => {
            const newCounts = new Map(prev);
            const current = newCounts.get(message.chat) || 0;
            newCounts.set(message.chat, current + 1);
            return newCounts;
          });

          // NEW: Show notification
          try {
            // Fetch expanded message data to get sender info
            const expandedMsg = await messages.getOne(message.id);
            const chat = chats.find(c => c.id === message.chat);

            if (chat && expandedMsg.expand?.sender) {
              const sender = expandedMsg.expand.sender;
              const chatName = chat.type === 'public'
                ? chat.name
                : `${sender.name || sender.email}`;

              const notification = showMessageNotification(
                chatName,
                expandedMsg.content,
                {
                  chatId: message.chat,
                  spaceId: spaceId,
                }
              );

              // Handle notification click
              if (notification) {
                notification.onclick = () => {
                  window.focus(); // Focus the window
                  // Navigate to the chat (will be handled by parent component)
                  notification.close();

                  // Dispatch custom event to navigate
                  window.dispatchEvent(new CustomEvent('notification-click', {
                    detail: {
                      chatId: message.chat,
                      spaceId: spaceId,
                    },
                  }));
                };
              }
            }
          } catch (err) {
            console.error('Failed to show notification:', err);
          }
        }
      }
    };

    // ... rest of existing code
  }, [spaceId, userId, chats, currentChatId]); // Add currentChatId to deps

  // ... rest of hook
}
```

---

#### 6.7.4 Handle Notification Clicks (Navigate to Chat)

**File:** `frontend/src/pages/SpacePage.tsx`

Listen for notification click events and navigate to the relevant chat:

```typescript
import { useLocation } from 'wouter';

export function SpacePage() {
  const { spaceId, chatId } = useParams();
  const [, setLocation] = useLocation();
  const [chats, setChats] = useState<Chat[]>([]);

  // Pass currentChatId to hook
  const { unreadCounts, markChatAsRead } = useUnreadMessages(spaceId, chats, chatId);

  // NEW: Handle notification clicks
  useEffect(() => {
    const handleNotificationClick = (event: CustomEvent) => {
      const { chatId: targetChatId, spaceId: targetSpaceId } = event.detail;

      // Navigate to the chat
      if (targetSpaceId && targetChatId) {
        setLocation(`/spaces/${targetSpaceId}/${targetChatId}`);
      }
    };

    window.addEventListener('notification-click', handleNotificationClick as EventListener);

    return () => {
      window.removeEventListener('notification-click', handleNotificationClick as EventListener);
    };
  }, [setLocation]);

  // ... rest of component
}
```

---

#### 6.7.6 Advanced: Notification Grouping

**Problem:** Multiple messages in same chat = notification spam

**Solution:** Use notification `tag` to replace previous notifications

```typescript
// In notifications.ts - already implemented via tag option
const notification = new Notification(title, {
  tag: `chat-${chatId}`, // Same tag = replace previous notification
  renotify: true, // Alert again even if replacing
});
```

**Enhancement:** Batch multiple messages into one notification

```typescript
// In useUnreadMessages.ts
const pendingNotifications = useRef<Map<string, number>>(new Map());

// Debounce notifications per chat
const showNotification = debounce((chatId: string) => {
  const count = pendingNotifications.current.get(chatId) || 0;
  const chat = chats.find(c => c.id === chatId);

  if (chat) {
    showMessageNotification(
      getChatName(chat),
      count === 1 ? 'New message' : `${count} new messages`,
      { chatId, spaceId }
    );
  }

  pendingNotifications.current.delete(chatId);
}, 2000); // Wait 2 seconds before showing
```

#### 6.7.9 Testing Notifications

**Test Cases:**

1. **Permission Flow**
   - [ ] Permission prompt appears on first visit (or banner shows)
   - [ ] Granting permission enables notifications
   - [ ] Denying permission prevents notifications
   - [ ] Re-requesting after denial shows browser's settings prompt

2. **Notification Display**
   - [ ] Notification shows when message received in background chat
   - [ ] Notification includes correct chat name and message preview
   - [ ] Notification does NOT show when viewing the chat where message was sent
   - [ ] Notification does NOT show for user's own messages

3. **Notification Click**
   - [ ] Clicking notification focuses the window
   - [ ] Clicking notification navigates to correct chat
   - [ ] Clicking notification closes the notification

4. **Multiple Messages**
   - [ ] Multiple messages in same chat replace previous notification (via tag)
   - [ ] Multiple messages in different chats show separate notifications

5. **Edge Cases**
   - [ ] Notifications work when tab is unfocused but open
   - [ ] Notifications don't show when tab is focused on the chat
   - [ ] Deleted messages don't trigger notifications
   - [ ] Notifications respect user preference (if toggle implemented)

---

#### 6.7.11 Implementation Checklist

**Step 1: Notification Utility**
- [ ] Create `notifications.ts` with permission and display functions
- [ ] Add notification icon assets (`/public/logo.png`, `/public/logo-badge.png`)
- [ ] Test permission request flow

**Step 2: Permission UI**
- [ ] Add permission request on app mount
- [ ] Handle denied permission state gracefully

**Step 3: Integration**
- [ ] Update `useUnreadMessages` to show notifications
- [ ] Pass `currentChatId` to hook to prevent notifications when viewing
- [ ] Fetch expanded message data for sender info

**Step 4: Click Handling**
- [ ] Set up notification click handler
- [ ] Navigate to chat when notification clicked
- [ ] Focus window when notification clicked

**Step 5: Polish**
- [ ] Add notification grouping/batching
- [ ] Truncate long messages
- [ ] Add privacy mode option
- [ ] Test across browsers

---

## Implementation Order

### Step 1: Backend (No frontend changes yet)
1. Create migration for `chat_read_status` collection
2. Test migration with existing data
3. Verify access rules in PocketBase dashboard

### Step 2: API Layer (Testable in isolation)
1. Add TypeScript types
2. Add `chatReadStatus` API methods
3. Add `countUnread` helper
4. Test API methods in browser console

### Step 3: Notifications Utility (Independent module)
1. Create `notifications.ts` utility module
2. Add notification icon assets
3. Test permission request flow in isolation
4. Test notification display and click handling

### Step 4: Hook (Reusable logic)
1. Create `useUnreadMessages` hook (without notifications first)
2. Test with dummy data
3. Verify real-time updates work
4. Add notification integration to hook
5. Test notifications with real messages

### Step 5: UI Updates (Visible changes)
1. Update `ChatList` to display badges
2. Update `SpacePage` to use hook and handle notification clicks
3. Update `ChatWindow` to mark as read
4. Add notification permission banner/prompt
5. Test user flow end-to-end

### Step 6: Refinements (Polish)
1. Add scroll-to-bottom logic
2. Implement offline support
3. Add multi-device sync
4. Performance optimization
5. Handle edge cases
6. Add notification settings UI (optional)
7. Implement notification grouping/batching

---

## Potential Issues & Solutions

### Issue 1: Race Conditions
**Problem:** User opens chat before read status is created
**Solution:** Use `getOrCreate()` pattern, handles both cases

### Issue 2: Stale Counts
**Problem:** Unread count doesn't update after marking as read
**Solution:** Optimistically update local state immediately, then sync with backend

### Issue 3: Too Many DB Queries
**Problem:** Counting unread for 50 chats = 50 queries
**Solution:** Batch queries or cache counts in localStorage

### Issue 4: Notification Spam
**Problem:** Every message triggers real-time update
**Solution:** Debounce updates, batch multiple messages

### Issue 5: Timezone Issues
**Problem:** Timestamp comparison fails due to timezone mismatch
**Solution:** Always use ISO strings, let PocketBase handle conversion
