import { useState, useEffect, useRef, useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { Phone } from 'lucide-react';
import { messages as messagesAPI, auth, chatReadStatus, chats } from '../services/pocketbase';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { useMessageList } from '../hooks/useMessageList';
import { useFileUpload } from '../hooks/useFileUpload';
import { messageQueue } from '../utils/messageQueue';
import LoadingSpinner from './LoadingSpinner';
import ChatMessage from './ChatMessage';
import MessageActions from './MessageActions';
import AddActions from './AddActions';
import MessageInput from './MessageInput';
import EditMessageDialog from './EditMessageDialog';
import DeleteMessageDialog from './DeleteMessageDialog';
import { ScrollArea, useToastManager, Button } from '../ui';
import { callsAPI } from '../services/calls';
import { activeCallChatAtom, showCallViewAtom } from '../store/callStore';
import type { Message, Chat } from '../types';

interface ChatWindowProps {
  chatId: string;
}

interface DisplayMessage extends Message {
  isPending?: boolean;
  isFailed?: boolean;
  tempId?: string;
  uploadProgress?: number;
}

export default function ChatWindow({ chatId }: ChatWindowProps) {
  const { t } = useTranslation();
  const toastManager = useToastManager();
  const currentUser = auth.user;
  const { isOnline } = useConnectionStatus();
  const [chat, setChat] = useState<Chat | null>(null);
  const [activeCallChat, setActiveCallChat] = useAtom(activeCallChatAtom);
  const [, setShowCallView] = useAtom(showCallViewAtom);

  // Use custom hooks
  const {
    messages,
    pendingMessages,
    loading,
    loadingOlder,
    hasMore,
    loadOlderMessages,
    typingUsers,
    setTypingUsers,
  } = useMessageList(chatId);

  const { onTyping } = useTypingIndicator(chatId, setTypingUsers);

  const {
    uploadingFiles,
    fileInputRef,
    handleFileSelect,
    handleFileChange,
    handleCancelUpload,
    handleRetryUpload,
  } = useFileUpload(chatId, isOnline, (title, description) => {
    toastManager.add({ title, description, data: { type: 'error' } });
  });

  // Local UI state
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showAddActions, setShowAddActions] = useState(false);
  const [isCreatingCall, setIsCreatingCall] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollStateRef = useRef({
    lastMsgId: '',
    pendingCount: 0,
    hasScrolledInitially: false,
    lastScrollLoadTime: 0,
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  const isAtBottom = () => {
    const c = messagesContainerRef.current;
    return c && c.scrollHeight - c.scrollTop - c.clientHeight < 150;
  };

  // Load chat data
  useEffect(() => {
    chats.getOne(chatId).then(setChat).catch(() => setChat(null));
  }, [chatId]);

  // Mark chat as read when opened
  useEffect(() => {
    if (currentUser?.id) {
      chatReadStatus.markAsRead(currentUser.id, chatId);
    }
  }, [chatId, currentUser?.id]);

  // Mark as read when window regains focus
  useEffect(() => {
    const handleFocus = () => {
      if (currentUser?.id) {
        chatReadStatus.markAsRead(currentUser.id, chatId);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [chatId, currentUser?.id]);

  // Reset selected message and scroll state when chat changes
  useEffect(() => {
    setSelectedMessageId(null);
    scrollStateRef.current = {
      lastMsgId: '',
      pendingCount: 0,
      hasScrolledInitially: false,
      lastScrollLoadTime: 0,
    };
  }, [chatId]);

  // Process queue when connection is restored
  useEffect(() => {
    if (isOnline) {
      messageQueue.processQueue(
        (chatId, content) => messagesAPI.create(chatId, content),
        isOnline
      );
    }
  }, [isOnline]);

  // Auto-scroll: on initial load, when current user sends, OR when new message arrives and already at bottom
  useEffect(() => {
    const { lastMsgId: prevLastId, pendingCount: prevPending, hasScrolledInitially } = scrollStateRef.current;
    const lastMsg = messages[messages.length - 1];
    const lastMsgId = lastMsg?.id || '';

    scrollStateRef.current.lastMsgId = lastMsgId;
    scrollStateRef.current.pendingCount = pendingMessages.length;

    if (!loading && messages.length > 0) {
      // Initial load: scroll to bottom once
      if (!hasScrolledInitially) {
        scrollStateRef.current.hasScrolledInitially = true;
        requestAnimationFrame(scrollToBottom);
      }
      // New message arrived: scroll if user sent it or already at bottom
      else if (lastMsgId !== prevLastId && lastMsg) {
        if (lastMsg.sender === currentUser?.id || isAtBottom()) requestAnimationFrame(scrollToBottom);
      }
    }
    if (prevPending && pendingMessages.length > prevPending) requestAnimationFrame(scrollToBottom);
  }, [messages, pendingMessages, loading, currentUser?.id]);

  // Scroll handler for loading older messages
  // Dependencies: only re-run when loading state changes (initial mount -> loaded)
  // This ensures the handler attaches once after ScrollArea renders, avoiding unnecessary re-attachments
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || loading) return;

    const handleScroll = () => {
      const timeSinceLastLoad = Date.now() - scrollStateRef.current.lastScrollLoadTime;
      if (container.scrollTop < 100 && hasMore && !loadingOlder && timeSinceLastLoad > 1000) {
        scrollStateRef.current.lastScrollLoadTime = Date.now();
        loadOlderMessages();
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, loadingOlder, loadOlderMessages]);

  const handleSend = async (content: string) => {
    if (!isOnline) {
      messageQueue.add(chatId, content);
      return;
    }

    const tempId = messageQueue.add(chatId, content);

    try {
      messageQueue.updateStatus(tempId, 'sending');
      await messagesAPI.create(chatId, content);
      messageQueue.remove(tempId);
    } catch (err) {
      console.error('Failed to send message:', err);
      messageQueue.updateStatus(tempId, 'failed');
    }
  };

  const handleRetryMessage = async (tempId: string) => {
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

  const handleEditMessage = () => {
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async (newContent: string) => {
    if (!selectedMessageId) return;

    try {
      await messagesAPI.update(selectedMessageId, newContent);
      setSelectedMessageId(null);
      toastManager.add({
        title: t('chatWindow.messageUpdated'),
        description: 'Your message has been updated successfully',
        data: { type: 'success' },
      });
    } catch (err) {
      console.error('Failed to update message:', err);
      toastManager.add({
        title: 'Failed to update message',
        description: 'Could not update message. Please try again.',
        data: { type: 'error' },
      });
    }
  };

  const handleDeleteMessage = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMessageId) return;

    try {
      await messagesAPI.delete(selectedMessageId);
      setSelectedMessageId(null);
      toastManager.add({
        title: t('chatWindow.messageDeleted'),
        description: 'Your message has been deleted successfully',
        data: { type: 'success' },
      });
    } catch (err) {
      console.error('Failed to delete message:', err);
      toastManager.add({
        title: 'Failed to delete message',
        description: 'Could not delete message. Please try again.',
        data: { type: 'error' },
      });
    }
  };

  const handleCopyMessage = async () => {
    if (!selectedMessage) return;

    try {
      if (selectedMessage.type === 'text') {
        await navigator.clipboard.writeText(selectedMessage.content);
        toastManager.add({ title: t('chatWindow.copied'), data: { type: 'success' } });
      } else if (selectedMessage.type === 'image' && selectedMessage.file) {
        const imageUrl = messagesAPI.getFileURL(selectedMessage);
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob })
        ]);
        toastManager.add({ title: t('chatWindow.imageCopied'), data: { type: 'success' } });
      }
      setSelectedMessageId(null);
    } catch (err) {
      console.error('Copy failed:', err);
      toastManager.add({
        title: 'Copy failed',
        description: 'Could not copy to clipboard',
        data: { type: 'error' },
      });
    }
  };

  const handleStartCall = async () => {
    if (!chat || activeCallChat || isCreatingCall) return;

    setIsCreatingCall(true);
    try {
      const callChat = await callsAPI.startCall(chat.id);
      setActiveCallChat(callChat);
      setShowCallView(true);
    } catch (error) {
      console.error('Failed to start call:', error);
      toastManager.add({
        title: 'Failed to start call',
        description: 'Could not start the call. Please try again.',
        data: { type: 'error' }
      });
    } finally {
      setIsCreatingCall(false);
    }
  };

  useHotkeys('esc', () => {
    setSelectedMessageId(null);
    (document.activeElement as HTMLElement)?.blur();
  });

  // Combine real and pending messages for display
  const allMessages: DisplayMessage[] = useMemo(() => [
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
    ...uploadingFiles.map(u => ({
      id: u.tempId,
      chat: u.chatId,
      sender: currentUser?.id || '',
      type: u.type,
      content: u.file.name,
      created: new Date().toISOString(),
      isPending: u.status === 'uploading',
      isFailed: u.status === 'failed',
      tempId: u.tempId,
      uploadProgress: u.progress,
    })),
  ], [messages, pendingMessages, uploadingFiles, currentUser?.id]);

  // Get selected message for action buttons
  const selectedMessage = useMemo(
    () => allMessages.find(m => m.id === selectedMessageId),
    [allMessages, selectedMessageId]
  );

  const canEditOrDelete = useMemo(
    () => selectedMessage?.sender === currentUser?.id && !selectedMessage?.isPending,
    [selectedMessage, currentUser?.id]
  );

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-white">
        <LoadingSpinner size="lg" />
        <div className="text-gray-600 text-sm">{t('chatWindow.loadingMessages')}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0">
      {/* Header */}
      <div className="header">
        <h2 className="text-lg font-semibold text-gray-900">{chat?.name || 'Chat'}</h2>
        <Button
          onClick={handleStartCall}
          variant="ghost"
          size="default"
          className="gap-2 btn-ghost"
          disabled={isCreatingCall || !!activeCallChat}
          title={activeCallChat ? 'Leave current call first' : 'Start a call'}
        >
          <Phone className="w-5 h-5" />
          <span className="text-sm">{isCreatingCall ? 'Starting...' : activeCallChat ? 'In call' : 'Call'}</span>
        </Button>
      </div>

      {/* Messages Area */}
      <ScrollArea ref={messagesContainerRef}>
          <div className="px-6 py-4 space-y-3">
            {loadingOlder && (
              <div className="flex justify-center py-2">
                <LoadingSpinner size="sm" />
              </div>
            )}
            {allMessages.length === 0 ? (
              <div className="empty-state">
                <p className="text-sm">{t('chatWindow.noMessages')}</p>
              </div>
            ) : (
              allMessages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwn={message.sender === currentUser?.id}
                  currentUserId={currentUser?.id || ''}
                  isSelected={selectedMessageId === message.id}
                  onSelect={() => setSelectedMessageId(selectedMessageId === message.id ? null : message.id)}
                  onRetry={message.type === 'text' ? handleRetryMessage : handleRetryUpload}
                  onCancelUpload={handleCancelUpload}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
      </ScrollArea>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="px-6 py-2 text-xs text-gray-500 italic border-t border-gray-100">
          {typingUsers.length === 1
            ? `${typingUsers[0].userName} ${t('chatWindow.isTyping')}`
            : typingUsers.length === 2
              ? `${typingUsers[0].userName} and ${typingUsers[1].userName} ${t('chatWindow.areTyping')}`
              : `${typingUsers.length} people ${t('chatWindow.areTyping')}`}
        </div>
      )}

      {/* Message Input or Actions */}
      {showAddActions ? (
        <AddActions
          onCancel={() => setShowAddActions(false)}
          onImageSelect={() => {
            handleFileSelect('image');
            setShowAddActions(false);
          }}
          onFileSelect={() => {
            handleFileSelect('file');
            setShowAddActions(false);
          }}
        />
      ) : selectedMessageId ? (
        <MessageActions
          onCancel={() => setSelectedMessageId(null)}
          onCopy={selectedMessage?.type !== 'file' ? handleCopyMessage : undefined}
          onEdit={canEditOrDelete && selectedMessage?.type === 'text' ? handleEditMessage : undefined}
          onDelete={canEditOrDelete ? handleDeleteMessage : undefined}
        />
      ) : (
        <MessageInput
          onSend={handleSend}
          onTyping={onTyping}
          onAddClick={() => setShowAddActions(true)}
        />
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Edit Message Dialog */}
      <EditMessageDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialContent={selectedMessage?.content || ''}
        onSave={handleSaveEdit}
      />

      {/* Delete Message Dialog */}
      <DeleteMessageDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
