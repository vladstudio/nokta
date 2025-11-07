import { useState, useEffect, useRef } from 'react';
import { messages as messagesAPI, auth } from '../services/pocketbase';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { messageQueue, type PendingMessage } from '../utils/messageQueue';
import { messageCache } from '../utils/messageCache';
import LoadingSpinner from './LoadingSpinner';
import type { Message } from '../types';

interface ChatWindowProps {
  chatId: string;
}

interface DisplayMessage extends Message {
  isPending?: boolean;
  isFailed?: boolean;
  tempId?: string;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingMessages, setPendingMessages] = useState<PendingMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Array<{ userId: string; userName: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = auth.user;
  const { isOnline } = useConnectionStatus();
  const { onTyping } = useTypingIndicator(chatId, setTypingUsers);

  useEffect(() => {
    loadMessages();

    // Subscribe to real-time updates
    const unsubscribe = messagesAPI.subscribe(chatId, async (data) => {
      if (data.action === 'create') {
        // Fetch the full message with expanded sender data
        // PocketBase doesn't support expand in subscriptions, so we fetch it separately
        try {
          const expandedMsg = await messagesAPI.getOne(data.record.id);
          setMessages((prev) => [...prev, expandedMsg]);
          // Cache new message
          messageCache.addMessage(expandedMsg).catch(console.error);
        } catch (err) {
          console.error('Failed to fetch expanded message:', err);
          // Fallback to the raw message without expand
          const newMsg = data.record as Message;
          setMessages((prev) => [...prev, newMsg]);
        }
      } else if (data.action === 'update') {
        // Fetch updated message with expand
        try {
          const expandedMsg = await messagesAPI.getOne(data.record.id);
          setMessages((prev) =>
            prev.map((msg) => (msg.id === data.record.id ? expandedMsg : msg))
          );
        } catch (err) {
          console.error('Failed to fetch expanded message:', err);
          // Fallback to the raw update
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
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, pendingMessages, loading]);

  // Process queue when connection is restored
  useEffect(() => {
    if (isOnline) {
      messageQueue.processQueue(
        (chatId, content) => messagesAPI.create(chatId, content),
        isOnline
      );
    }
  }, [isOnline]);

  const loadMessages = async () => {
    try {
      // Try to load from cache first for instant display
      const cached = await messageCache.getMessages(chatId);
      if (cached.length > 0) {
        setMessages(cached);
      }

      // Then load from server (fetches latest 50, descending)
      const result = await messagesAPI.list(chatId);
      // Reverse to display chronologically (oldest first)
      const chronologicalMessages = [...result.items].reverse();
      setMessages(chronologicalMessages);

      // Update cache with chronological order
      await messageCache.saveMessages(chatId, chronologicalMessages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    const content = newMessage.trim();
    setNewMessage('');

    if (!isOnline) {
      // Queue message for later
      messageQueue.add(chatId, content);
      return;
    }

    // Optimistic UI: add to queue immediately
    const tempId = messageQueue.add(chatId, content);
    setSending(true);

    try {
      messageQueue.updateStatus(tempId, 'sending');
      const result = await messagesAPI.create(chatId, content);
      messageQueue.remove(tempId);
    } catch (err) {
      console.error('Failed to send message:', err);
      messageQueue.updateStatus(tempId, 'failed');
    } finally {
      setSending(false);
    }
  };

  const handleRetry = async (tempId: string) => {
    const pending = pendingMessages.find((m) => m.tempId === tempId);
    if (!pending) return;

    try {
      messageQueue.updateStatus(tempId, 'sending');
      await messagesAPI.create(pending.chatId, pending.content);
      messageQueue.remove(tempId);
    } catch (err) {
      console.error('Failed to retry message:', err);
      messageQueue.updateStatus(tempId, 'failed');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <LoadingSpinner size="lg" />
        <div className="text-gray-600">Loading messages...</div>
      </div>
    );
  }

  // Combine real and pending messages for display
  const allMessages: DisplayMessage[] = [
    ...messages,
    ...pendingMessages.map((p) => ({
      id: p.tempId,
      chat: p.chatId,
      sender: currentUser?.id || '',
      type: 'text' as const,
      content: p.content,
      created: p.createdAt.toISOString(),
      updated: p.createdAt.toISOString(),
      isPending: p.status === 'sending' || p.status === 'pending',
      isFailed: p.status === 'failed',
      tempId: p.tempId,
    })),
  ];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {allMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          allMessages.map((message) => {
            const isOwn = message.sender === currentUser?.id;
            const senderName = message.expand?.sender?.name || message.expand?.sender?.email || 'Unknown';

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xl ${isOwn ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-baseline space-x-2 mb-1">
                    <span className="text-xs font-medium text-gray-700">
                      {isOwn ? 'You' : senderName}
                    </span>
                    {message.created && !message.isPending && (
                      <span className="text-xs text-gray-400">
                        {new Date(message.created).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                    {message.isPending && (
                      <span className="text-xs text-gray-400">Sending...</span>
                    )}
                    {message.isFailed && (
                      <button
                        onClick={() => message.tempId && handleRetry(message.tempId)}
                        className="text-xs text-red-500 hover:text-red-700 underline"
                      >
                        Failed - Retry
                      </button>
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      isOwn
                        ? message.isFailed
                          ? 'bg-red-100 text-red-900 border border-red-300'
                          : message.isPending
                          ? 'bg-blue-400 text-white opacity-70'
                          : 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-6 py-2 text-sm text-gray-500 italic">
          {typingUsers.length === 1
            ? `${typingUsers[0].userName} is typing...`
            : typingUsers.length === 2
            ? `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing...`
            : `${typingUsers.length} people are typing...`}
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSend} className="flex space-x-4">
          <textarea
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              onTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
            rows={2}
            className="flex-1 resize-none rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
}
