import { useState, useEffect, useRef, useCallback } from 'react';
import { messages as messagesAPI } from '../services/pocketbase';
import { messageQueue, type PendingMessage } from '../utils/messageQueue';
import { messageCache } from '../utils/messageCache';
import type { Message, PocketBaseEvent } from '../types';

export interface UseMessageListReturn {
  messages: Message[];
  pendingMessages: PendingMessage[];
  loading: boolean;
  loadingOlder: boolean;
  hasMore: boolean;
  hasMoreAfter: boolean;
  loadOlderMessages: () => Promise<void>;
  typingUsers: Array<{ userId: string; userName: string }>;
  setTypingUsers: React.Dispatch<React.SetStateAction<Array<{ userId: string; userName: string }>>>;
}

export function useMessageList(chatId: string, anchorMessageId?: string): UseMessageListReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [hasMoreAfter, setHasMoreAfter] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; userName: string }>>([]);
  const lastLoadTimeRef = useRef(0);

  const loadMessages = useCallback(async () => {
    try {
      if (anchorMessageId) {
        const result = await messagesAPI.getAround(anchorMessageId, 50);
        setMessages(result.items);
        setHasMore(result.hasMoreBefore);
        setHasMoreAfter(result.hasMoreAfter);
      } else {
        const cached = await messageCache.getMessages(chatId);
        if (cached.length > 0) setMessages(cached);

        const result = await messagesAPI.list(chatId, 1, 50);
        const chronologicalMessages = [...result.items].reverse();
        setMessages(chronologicalMessages);
        setHasMore(result.totalPages > 1);
        setHasMoreAfter(false);

        await messageCache.saveMessages(chatId, chronologicalMessages);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [chatId, anchorMessageId]);

  const loadOlderMessages = useCallback(async () => {
    if (loadingOlder || !hasMore) return;
    lastLoadTimeRef.current = Date.now();
    setLoadingOlder(true);

    try {
      const firstMsg = messages[0];
      if (!firstMsg) {
        setLoadingOlder(false);
        return;
      }

      const result = await messagesAPI.list(chatId, 1, 50, firstMsg.created);
      if (result.items.length === 0) {
        setHasMore(false);
        setLoadingOlder(false);
        return;
      }

      const olderMessages = [...result.items].reverse();
      setMessages((prev) => {
        const firstMsgId = prev[0]?.id;
        const updated = [...olderMessages, ...prev];
        requestAnimationFrame(() => {
          document.getElementById(`msg-${firstMsgId}`)?.scrollIntoView();
        });
        return updated;
      });
      setHasMore(result.totalPages > 1);
    } catch (err) {
      console.error('Failed to load older messages:', err);
    } finally {
      setLoadingOlder(false);
    }
  }, [loadingOlder, hasMore, chatId, messages]);

  // Initial load and real-time subscriptions
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setHasMore(false);
    setHasMoreAfter(false);
    setLoadingOlder(false);
    loadMessages();

    // Subscribe to real-time updates
    const unsubscribe = messagesAPI.subscribe(chatId, async (data: PocketBaseEvent<Message>) => {
      if (data.action === 'create') {
        // Clear typing indicator for this sender
        setTypingUsers((prev) => prev.filter((u) => u.userId !== data.record.sender));
        // Fetch the full message with expanded sender data
        try {
          const expandedMsg = await messagesAPI.getOne(data.record.id);
          setMessages((prev) => [...prev, expandedMsg]);
          // Cache new message
          messageCache.addMessage(expandedMsg).catch(console.error);
        } catch (err) {
          console.error('Failed to fetch expanded message:', err);
          const newMsg = data.record as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      } else if (data.action === 'update') {
        try {
          const expandedMsg = await messagesAPI.getOne(data.record.id);
          setMessages((prev) =>
            prev.map((msg) => (msg.id === data.record.id ? expandedMsg : msg))
          );
        } catch (err) {
          console.error('Failed to fetch expanded message:', err);
          setMessages((prev) =>
            prev.map((msg) => (msg.id === data.record.id ? (data.record as Message) : msg))
          );
        }
      } else if (data.action === 'delete') {
        setMessages((prev) => prev.filter((msg) => msg.id !== data.record.id));
      }
    });

    // Subscribe to pending messages queue
    const unsubscribeQueue = messageQueue.subscribe((queue) => {
      setPendingMessages(queue.filter((m) => m.chatId === chatId));
    });

    return () => {
      unsubscribe.then((unsub) => unsub());
      unsubscribeQueue();
    };
  }, [chatId, loadMessages]);

  return {
    messages,
    pendingMessages,
    loading,
    loadingOlder,
    hasMore,
    hasMoreAfter,
    loadOlderMessages,
    typingUsers,
    setTypingUsers,
  };
}
