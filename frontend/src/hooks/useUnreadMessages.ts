import { useState, useEffect, useRef } from 'react';
import { chatReadStatus, messages, auth } from '../services/pocketbase';
import { showMessageNotification } from '../utils/notifications';
import type { Chat } from '../types';

/**
 * Manages unread message counts for all chats in a space
 * Also shows browser notifications for new messages
 *
 * @param spaceId - Current space ID
 * @param chats - List of chats in the space
 * @param currentChatId - ID of currently open chat (to prevent notifications)
 * @returns Object with unread counts and mark-as-read function
 */
export function useUnreadMessages(
  spaceId: string | undefined,
  chats: Chat[],
  currentChatId?: string
) {
  const [unreadCounts, setUnreadCounts] = useState<Map<string, number>>(new Map());
  const userId = auth.user?.id;
  const readStatusMapRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!spaceId || !userId || chats.length === 0) {
      return;
    }

    // Load initial unread counts
    const loadUnreadCounts = async () => {
      try {
        // Get read status for all chats
        const readStatusMap = await chatReadStatus.getForSpace(userId, spaceId);
        readStatusMapRef.current = readStatusMap;

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

          // Show notification
          try {
            // Fetch expanded message data to get sender info
            const expandedMsg = await messages.getOne(message.id);
            const chat = chats.find(c => c.id === message.chat);

            if (chat && expandedMsg.expand?.sender) {
              const sender = expandedMsg.expand.sender;
              const chatName = chat.type === 'public'
                ? chat.name || 'Public Chat'
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

      // Handle deleted messages - refetch count
      if (data.action === 'delete') {
        const message = data.record;
        const lastReadAt = readStatusMapRef.current.get(message.chat);

        if (lastReadAt) {
          try {
            const count = await messages.countUnread(message.chat, lastReadAt);
            setUnreadCounts(prev => {
              const newCounts = new Map(prev);
              newCounts.set(message.chat, count);
              return newCounts;
            });
          } catch (err) {
            console.error('Failed to update unread count after message deletion:', err);
          }
        }
      }
    };

    // Subscribe to messages in this space
    let isMounted = true;
    let messagesUnsubscribe: (() => void) | undefined;
    let readStatusUnsubscribe: (() => void) | undefined;

    // Subscribe to read status changes (for multi-device sync)
    const handleReadStatusUpdate = async (data: any) => {
      if (data.action === 'update' || data.action === 'create') {
        const status = data.record;

        // Update ref
        readStatusMapRef.current.set(status.chat, status.last_read_at);

        // Refetch unread count for this chat
        try {
          const count = await messages.countUnread(status.chat, status.last_read_at);
          setUnreadCounts(prev => {
            const newCounts = new Map(prev);
            newCounts.set(status.chat, count);
            return newCounts;
          });
        } catch (err) {
          console.error('Failed to update unread count after read status change:', err);
        }
      }
    };

    // Set up subscriptions
    const setupSubscriptions = async () => {
      try {
        // Subscribe to all messages across chats in this space
        const chatIds = chats.map(c => c.id);
        if (chatIds.length > 0) {
          // Subscribe to each chat individually
          const unsubscribePromises = chatIds.map(chatId =>
            messages.subscribe(chatId, handleNewMessage)
          );
          const unsubscribeFns = await Promise.all(unsubscribePromises);

          if (isMounted) {
            messagesUnsubscribe = () => {
              unsubscribeFns.forEach(fn => fn());
            };
          } else {
            // Component unmounted while subscribing, clean up immediately
            unsubscribeFns.forEach(fn => fn());
          }
        }

        // Subscribe to read status changes
        const unsubFn = await chatReadStatus.subscribe(userId, handleReadStatusUpdate);

        if (isMounted) {
          readStatusUnsubscribe = unsubFn;
        } else {
          // Component unmounted while subscribing, clean up immediately
          unsubFn();
        }
      } catch (err) {
        console.error('Failed to set up subscriptions:', err);
      }
    };

    setupSubscriptions();

    return () => {
      isMounted = false;
      if (messagesUnsubscribe) messagesUnsubscribe();
      if (readStatusUnsubscribe) readStatusUnsubscribe();
    };
  }, [spaceId, userId, chats, currentChatId]);

  /**
   * Mark a chat as read and reset its unread count
   */
  const markChatAsRead = async (chatId: string) => {
    if (!userId) return;

    try {
      await chatReadStatus.markAsRead(userId, chatId);

      // Update ref
      readStatusMapRef.current.set(chatId, new Date().toISOString());

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
