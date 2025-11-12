import { useState, useEffect, useRef, useMemo } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { useLocation, useRoute, useSearch } from 'wouter';
import { useAtom } from 'jotai';
import { messages as messagesAPI, auth, chatReadStatus, chats } from '../services/pocketbase';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { useTypingIndicator } from '../hooks/useTypingIndicator';
import { useMessageList } from '../hooks/useMessageList';
import { useFileUpload } from '../hooks/useFileUpload';
import { useIsMobile } from '../hooks/useIsMobile';
import { messageQueue } from '../utils/messageQueue';
import { messageCache } from '../utils/messageCache';
import LoadingSpinner from './LoadingSpinner';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInputArea from './ChatInputArea';
import EditMessageDialog from './EditMessageDialog';
import DeleteMessageDialog from './DeleteMessageDialog';
import ImageCropDialog from './ImageCropDialog';
import VideoCompressionDialog from './VideoCompressionDialog';
import { useToastManager } from '../ui';
import { callsAPI } from '../services/calls';
import { activeCallChatAtom, showCallViewAtom } from '../store/callStore';
import type { Message, Chat } from '../types';
import type { VideoMetadata } from '../types/video';
import type { RightSidebarView } from './RightSidebar';

interface ChatWindowProps {
  chatId?: string;
  chat: Chat | null;
  rightSidebarView?: RightSidebarView | null;
  onToggleRightSidebar?: (view: RightSidebarView | null) => void;
  onDeleteChat: () => void;
  onLeaveChat: () => void;
}

interface DisplayMessage extends Message {
  isPending?: boolean;
  isFailed?: boolean;
  tempId?: string;
  uploadProgress?: number;
}

// Constants
const SCROLL_AT_BOTTOM_THRESHOLD = 150; // pixels from bottom
const MAX_ANCHOR_SCROLL_RETRIES = 60; // ~1 second at 60fps
const LOAD_OLDER_COOLDOWN = 1000; // ms between load older requests

export default function ChatWindow({ chatId, chat: externalChat, rightSidebarView, onToggleRightSidebar, onDeleteChat, onLeaveChat }: ChatWindowProps) {
  const { t } = useTranslation();
  const [, params] = useRoute('/spaces/:spaceId/chat/:chatId?');

  if (!chatId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <img src="/icon-muted.svg" alt="Icon" className="w-32 h-32" />
        <div className="text-light text-sm">{t('messages.selectChatToStart')}</div>
      </div>
    );
  }

  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const toastManager = useToastManager();
  const currentUser = auth.user;
  const { isOnline } = useConnectionStatus();
  const isMobile = useIsMobile();
  const [chat, setChat] = useState<Chat | null>(externalChat);
  const [activeCallChat, setActiveCallChat] = useAtom(activeCallChatAtom);
  const [, setShowCallView] = useAtom(showCallViewAtom);

  // Get chat name (same logic as ChatList)
  const getChatName = (chat: Chat | null) => {
    if (!chat) return t('chatWindow.defaultChatName');

    // Use explicit name if provided
    if (chat.name) {
      return chat.name;
    }

    // Fallback: show other participants' names
    if (chat.expand?.participants) {
      const otherParticipants = chat.expand.participants.filter(
        (p) => p.id !== currentUser?.id
      );
      if (otherParticipants.length > 0) {
        return otherParticipants.map((p) => p.name || p.email).join(', ');
      }
    }

    // Default fallback
    return chat.participants.length === 2 ? t('chatList.directMessage') : t('chatList.groupChat');
  };

  // Parse anchor message from URL param
  const anchorMessageId = useMemo(() => {
    const searchParams = new URLSearchParams(searchString);
    return searchParams.get('msg') || undefined;
  }, [searchString]);

  // Use custom hooks
  const {
    messages,
    pendingMessages,
    loading,
    loadingOlder,
    hasMore,
    hasMoreAfter,
    loadOlderMessages,
    typingUsers,
    setTypingUsers,
  } = useMessageList(chatId, anchorMessageId);

  const { onTyping } = useTypingIndicator(chatId, setTypingUsers);

  const {
    uploadingFiles,
    fileInputRef,
    handleFileSelect,
    handleFileChange,
    uploadFiles,
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
  const [cropDialogFile, setCropDialogFile] = useState<File | null>(null);
  const [videoCompressionDialogFile, setVideoCompressionDialogFile] = useState<File | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const scrollStateRef = useRef({
    lastMsgId: '',
    pendingCount: 0,
    hasScrolledInitially: false,
    lastScrollLoadTime: 0,
    lastScrolledAnchor: '',
  });
  const prevAnchorRef = useRef<string | undefined>(undefined);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  const isAtBottom = () => {
    const c = messagesContainerRef.current;
    return c && c.scrollHeight - c.scrollTop - c.clientHeight < SCROLL_AT_BOTTOM_THRESHOLD;
  };

  const handleImageSelect = () => {
    if (!isOnline) {
      toastManager.add({ title: 'No connection', description: 'Cannot upload files while offline', data: { type: 'error' } });
      return;
    }
    imageInputRef.current?.click();
    setShowAddActions(false);
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCropDialogFile(file);
    e.target.value = '';
  };

  const handleCropComplete = (processedFile: File) => {
    const syntheticEvent = {
      target: { files: [processedFile] }
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    handleFileChange(syntheticEvent);
  };

  const handleVideoSelect = () => {
    if (!isOnline) {
      toastManager.add({
        title: t('common.noConnection'),
        description: t('videoUpload.cannotUploadOffline'),
        data: { type: 'error' }
      });
      return;
    }
    videoInputRef.current?.click();
    setShowAddActions(false);
  };

  const handleVideoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toastManager.add({
          title: t('videoUpload.invalidType'),
          description: t('videoUpload.pleaseSelectVideo'),
          data: { type: 'error' },
        });
        return;
      }

      // Validate file size (100MB max before compression)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toastManager.add({
          title: t('videoUpload.fileTooLarge'),
          description: t('videoUpload.maxSize100MB'),
          data: { type: 'error' },
        });
        return;
      }

      setVideoCompressionDialogFile(file);
    }
    e.target.value = '';
  };

  const handleVideoCompressionComplete = (compressedFile: File, _metadata: VideoMetadata) => {
    uploadFiles([compressedFile], 'video');
    setVideoCompressionDialogFile(null);
  };

  // Load chat data
  useEffect(() => {
    chats.getOne(chatId).then(setChat).catch(() => setChat(null));
  }, [chatId]);

  // Subscribe to chat updates
  useEffect(() => {
    let subscriptionId: string | undefined;
    chats.subscribe((data) => {
      if (data.record.id === chatId) {
        chats.getOne(chatId).then(setChat);
      }
    }).then(id => { subscriptionId = id; });

    return () => {
      if (subscriptionId) chats.unsubscribe(subscriptionId);
    };
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

  // Reset selected message and scroll state when chat or anchor changes
  useEffect(() => {
    setSelectedMessageId(null);
    scrollStateRef.current = {
      lastMsgId: '',
      pendingCount: 0,
      hasScrolledInitially: false,
      lastScrollLoadTime: 0,
      lastScrolledAnchor: '',
    };
  }, [chatId, anchorMessageId]);

  // Sync selected message to hash (without scrolling)
  useEffect(() => {
    const url = new URL(window.location.href);
    url.hash = selectedMessageId ? `msg-${selectedMessageId}` : '';
    history.replaceState(null, '', url.toString());
  }, [selectedMessageId]);

  // Process queue when connection is restored
  useEffect(() => {
    if (isOnline) {
      messageQueue.processQueue(
        (chatId, content) => messagesAPI.create(chatId, content),
        isOnline
      );
    }
  }, [isOnline]);

  // Scroll to anchor message after initial load (once per anchor)
  useEffect(() => {
    if (!loading && anchorMessageId && messages.length > 0 &&
      scrollStateRef.current.lastScrolledAnchor !== anchorMessageId) {
      scrollStateRef.current.hasScrolledInitially = true;
      scrollStateRef.current.lastScrolledAnchor = anchorMessageId;

      // Wait for element to exist in DOM (with max retries)
      let retries = 0;
      const checkAndScroll = () => {
        const el = document.getElementById(`msg-${anchorMessageId}`);
        if (el) {
          el.scrollIntoView({ block: 'center' });
        } else if (retries < MAX_ANCHOR_SCROLL_RETRIES) {
          retries++;
          requestAnimationFrame(checkAndScroll);
        } else {
          console.warn(`Failed to scroll to anchor message ${anchorMessageId} after ${MAX_ANCHOR_SCROLL_RETRIES} retries`);
        }
      };
      requestAnimationFrame(checkAndScroll);
    }
  }, [loading, anchorMessageId, messages.length]);

  // Auto-scroll: on initial load, when current user sends, OR when new message arrives and already at bottom
  useEffect(() => {
    if (anchorMessageId) {
      prevAnchorRef.current = anchorMessageId;
      return; // Skip auto-scroll in anchor mode
    }

    // Force scroll on transition from anchor to present
    if (prevAnchorRef.current && !anchorMessageId) {
      scrollStateRef.current.hasScrolledInitially = false;
      prevAnchorRef.current = undefined;
    }

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
  }, [messages, pendingMessages, loading, currentUser?.id, anchorMessageId]);

  // Scroll handler for loading older messages
  // Dependencies: only re-run when loading state changes (initial mount -> loaded)
  // This ensures the handler attaches once after ScrollArea renders, avoiding unnecessary re-attachments
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container || loading) return;

    const handleScroll = () => {
      const timeSinceLastLoad = Date.now() - scrollStateRef.current.lastScrollLoadTime;
      if (container.scrollTop < 100 && hasMore && !loadingOlder && timeSinceLastLoad > LOAD_OLDER_COOLDOWN) {
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

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await messagesAPI.toggleReaction(messageId, emoji);
      setSelectedMessageId(null);
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
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
        description: t('messages.messageUpdatedSuccess'),
        data: { type: 'success' },
      });
    } catch (err) {
      console.error('Failed to update message:', err);
      toastManager.add({
        title: t('messages.failedToUpdateMessage'),
        description: t('messages.couldNotUpdateMessage'),
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
        description: t('messages.messageDeletedSuccess'),
        data: { type: 'success' },
      });
    } catch (err) {
      console.error('Failed to delete message:', err);
      toastManager.add({
        title: t('messages.failedToDeleteMessage'),
        description: t('messages.couldNotDeleteMessage'),
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
        title: t('messages.copyFailed'),
        description: t('messages.couldNotCopyToClipboard'),
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
      setLocation(`/spaces/${params?.spaceId}/chat`);
    } catch (error) {
      console.error('Failed to start call:', error);
      toastManager.add({
        title: t('calls.failedToStartCall'),
        description: t('calls.couldNotStartCall'),
        data: { type: 'error' }
      });
    } finally {
      setIsCreatingCall(false);
    }
  };

  const handleBack = () => {
    setLocation(`/spaces/${params?.spaceId}/chat`);
  };

  // Sync external chat with local state
  useEffect(() => {
    if (externalChat) setChat(externalChat);
  }, [externalChat]);

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
      <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-(--color-bg-primary)">
        <LoadingSpinner size="sm" />
        <div className="text-light text-sm">{t('chatWindow.loadingMessages')}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-(--color-bg-secondary) min-h-0">
      <ChatHeader
        chat={chat}
        chatName={getChatName(chat)}
        typingUsers={typingUsers}
        isMobile={isMobile}
        rightSidebarView={rightSidebarView}
        isCreatingCall={isCreatingCall}
        activeCallChat={activeCallChat}
        currentUser={currentUser}
        onBack={handleBack}
        onToggleRightSidebar={onToggleRightSidebar!}
        onStartCall={handleStartCall}
      />

      <MessageList
        ref={messagesContainerRef}
        messages={allMessages}
        loadingOlder={loadingOlder}
        selectedMessageId={selectedMessageId}
        hasMoreAfter={hasMoreAfter}
        currentUserId={currentUser?.id || ''}
        chat={chat}
        onSelectMessage={setSelectedMessageId}
        onRetryMessage={handleRetryMessage}
        onRetryUpload={handleRetryUpload}
        onCancelUpload={handleCancelUpload}
        onReaction={handleReaction}
        onJumpToPresent={() => setLocation(`/spaces/${params?.spaceId}/chat/${chatId}`)}
        messagesEndRef={messagesEndRef}
      />
      <ChatInputArea
        showAddActions={showAddActions}
        selectedMessageId={selectedMessageId}
        selectedMessage={selectedMessage}
        canEditOrDelete={canEditOrDelete}
        currentUserId={currentUser?.id || ''}
        onSend={handleSend}
        onTyping={onTyping}
        onCancelAddActions={() => setShowAddActions(false)}
        onImageSelect={handleImageSelect}
        onVideoSelect={handleVideoSelect}
        onFileSelect={() => {
          handleFileSelect('file');
          setShowAddActions(false);
        }}
        onShowAddActions={() => setShowAddActions(true)}
        onCancelMessageSelection={() => setSelectedMessageId(null)}
        onPasteImage={setCropDialogFile}
        onCopy={handleCopyMessage}
        onEdit={handleEditMessage}
        onDelete={handleDeleteMessage}
        onReact={(emoji) => handleReaction(selectedMessageId!, emoji)}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Hidden image input for crop */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageInputChange}
      />

      {/* Hidden video input for compression */}
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleVideoInputChange}
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

      {/* Image Crop Dialog */}
      {cropDialogFile && (
        <ImageCropDialog
          open={!!cropDialogFile}
          onOpenChange={(open) => !open && setCropDialogFile(null)}
          file={cropDialogFile}
          onComplete={handleCropComplete}
        />
      )}

      {/* Video Compression Dialog */}
      {videoCompressionDialogFile && (
        <VideoCompressionDialog
          open={!!videoCompressionDialogFile}
          onOpenChange={(open) => !open && setVideoCompressionDialogFile(null)}
          file={videoCompressionDialogFile}
          onComplete={handleVideoCompressionComplete}
        />
      )}
    </div>
  );
}
