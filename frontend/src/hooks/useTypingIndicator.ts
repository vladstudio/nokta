import { useEffect, useRef, useCallback } from 'react';
import { pb, auth } from '../services/pocketbase';

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

const TYPING_TIMEOUT = 3000; // Clear after 3 seconds
const BROADCAST_DELAY = 500; // Debounce typing events

export function useTypingIndicator(
  chatId: string,
  onTypingUsersChange: (users: TypingUser[]) => void
) {
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastBroadcastRef = useRef<number>(0);
  const typingUsersRef = useRef<Map<string, TypingUser>>(new Map());

  // Broadcast typing status
  const broadcastTyping = useCallback(() => {
    if (!auth.user || !chatId) return;

    const now = Date.now();
    // Throttle broadcasts
    if (now - lastBroadcastRef.current < BROADCAST_DELAY) return;

    lastBroadcastRef.current = now;

    // Send typing event via PocketBase realtime
    // We use a simple broadcast mechanism: create a temporary record that expires
    pb.collection('typing_events')
      .create({
        chat: chatId,
        user: auth.user.id,
        user_name: auth.user.name || auth.user.email,
        timestamp: new Date().toISOString(),
      })
      .catch(() => {
        // If collection doesn't exist, silently fail
        // This is optional functionality
      });
  }, [chatId]);

  // Signal that user started typing
  const onTyping = useCallback(() => {
    // Clear existing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    // Debounce broadcast
    if (broadcastTimerRef.current) {
      clearTimeout(broadcastTimerRef.current);
    }
    broadcastTimerRef.current = setTimeout(broadcastTyping, BROADCAST_DELAY);

    // Set timer to stop broadcasting
    typingTimerRef.current = setTimeout(() => {
      typingTimerRef.current = null;
    }, TYPING_TIMEOUT);
  }, [broadcastTyping]);

  // Subscribe to typing events
  useEffect(() => {
    if (!chatId) return;

    const cleanup = () => {
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (broadcastTimerRef.current) clearTimeout(broadcastTimerRef.current);
    };

    // Try to subscribe to typing events
    let unsubscribe: (() => void) | undefined;

    pb.collection('typing_events')
      .subscribe('*', (e) => {
        if (e.action !== 'create') return;

        const record = e.record as any;
        if (record.chat !== chatId) return;
        if (record.user === auth.user?.id) return; // Ignore own typing

        const now = Date.now();
        const typingUser: TypingUser = {
          userId: record.user,
          userName: record.user_name || 'Unknown',
          timestamp: now,
        };

        typingUsersRef.current.set(record.user, typingUser);
        notifyChange();

        // Auto-remove after timeout
        setTimeout(() => {
          typingUsersRef.current.delete(record.user);
          notifyChange();
        }, TYPING_TIMEOUT);
      })
      .then((unsub) => {
        unsubscribe = unsub;
      })
      .catch(() => {
        // Collection doesn't exist, typing indicators disabled
      });

    return () => {
      cleanup();
      if (unsubscribe) unsubscribe();
    };
  }, [chatId]);

  const notifyChange = () => {
    const users = Array.from(typingUsersRef.current.values());
    onTypingUsersChange(users);
  };

  return { onTyping };
}
