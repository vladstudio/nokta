import { useEffect, useState, useRef } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import ChatWindow from '../components/ChatWindow';
import CallView from '../components/CallView';
import RightSidebar, { type RightSidebarView } from '../components/RightSidebar';
import { callsAPI } from '../services/calls';
import { chats, auth, messages } from '../services/pocketbase';
import { messageQueue } from '../utils/messageQueue';
import { messageCache } from '../utils/messageCache';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { useIsMobile } from '../hooks/useIsMobile';
import { useToastManager } from '../ui';
import { activeCallChatAtom, showCallViewAtom } from '../store/callStore';
import { isVideoCallsEnabled } from '../config/features';
import type { Chat } from '../types';

export default function ChatPage() {
  const { t } = useTranslation();
  const [, params] = useRoute('/chat/:chatId?');
  const [, setLocation] = useLocation();
  const toastManager = useToastManager();
  const chatId = params?.chatId;
  const currentUser = auth.user;
  const isMobile = useIsMobile();
  const [activeCallChat, setActiveCallChat] = useAtom(activeCallChatAtom);
  const [showCallView, setShowCallView] = useAtom(showCallViewAtom);
  const { isOnline } = useConnectionStatus();
  const [rightSidebarView, setRightSidebarView] = useState<RightSidebarView | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);

  useEffect(() => {
    const handleNotificationClick = (event: Event) => {
      const { chatId: targetChatId } = (event as CustomEvent).detail;
      if (targetChatId) {
        setLocation(`/chat/${targetChatId}`);
      }
    };
    window.addEventListener('notification-click', handleNotificationClick);
    return () => window.removeEventListener('notification-click', handleNotificationClick);
  }, [setLocation]);

  // Load chat data
  useEffect(() => {
    if (!chatId) {
      setChat(null);
      return;
    }
    chats.getOne(chatId).then(setChat).catch(() => setChat(null));
  }, [chatId]);

  const refetchChat = () => {
    if (chatId) {
      chats.getOne(chatId).then(setChat).catch(() => setChat(null));
    }
  };

  // Load user's active call on mount
  useEffect(() => {
    if (!isVideoCallsEnabled || !currentUser) return;
    let stale = false;

    (async () => {
      try {
        const activeCalls = await callsAPI.getActiveCalls();
        if (stale) return;
        const myActiveCall = activeCalls.find(c => c.call_participants?.includes(currentUser.id));
        if (myActiveCall) {
          setActiveCallChat(myActiveCall);
          if (!chatId) setShowCallView(true);
        }
      } catch (error) {
        if (stale) return;
        console.error('Failed to load active call:', error);
        setActiveCallChat(null);
      }
    })();

    return () => { stale = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // Subscribe to chat updates for active calls
  const activeCallChatRef = useRef(activeCallChat);
  activeCallChatRef.current = activeCallChat;

  useEffect(() => {
    if (!isVideoCallsEnabled || !currentUser) return;

    const unsubscribe = callsAPI.subscribeToActiveCalls(async (data) => {
      const currentActiveCall = activeCallChatRef.current;
      if (!currentActiveCall || data.record.id !== currentActiveCall.id) return;

      if (data.action === 'delete' || data.action === 'update') {
        const wasMultiple = (currentActiveCall.call_participants?.length || 0) > 1;
        const nowAlone = data.record.call_participants?.length === 1;

        // Auto-leave if others left and we're alone (prevents stale calls)
        if (wasMultiple && nowAlone && data.record.call_participants?.includes(currentUser.id)) {
          await callsAPI.leaveCall(data.record.id, currentUser.id);
          setActiveCallChat(null);
          setShowCallView(false);
          return;
        }

        if (data.record.call_participants?.includes(currentUser.id) && data.record.is_active_call) {
          setActiveCallChat(data.record);
        } else {
          setActiveCallChat(null);
          setShowCallView(false);
        }
      }
    });

    return () => { unsubscribe.then(fn => fn?.()); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  // Offline reconciliation: verify call still exists when reconnecting
  useEffect(() => {
    if (!isVideoCallsEnabled || !activeCallChat || !isOnline || !currentUser) return;

    const handleOnline = async () => {
      try {
        const chat = await chats.getOne(activeCallChat.id);
        if (chat.is_active_call && chat.call_participants?.includes(currentUser.id)) {
          setActiveCallChat(chat);
        } else {
          setActiveCallChat(null);
          setShowCallView(false);
        }
      } catch {
        setActiveCallChat(null);
        setShowCallView(false);
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [activeCallChat, currentUser, setActiveCallChat, setShowCallView, isOnline]);

  const handleDeleteChat = async () => {
    if (!chat) return;
    try {
      messageQueue.clearChat(chat.id);
      await messageCache.clearChat(chat.id);
      await chats.delete(chat.id);
      setLocation('/chat');
      toastManager.add({ title: t('chats.chatDeleted'), data: { type: 'success' } });
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toastManager.add({ title: t('chats.failedToDelete'), data: { type: 'error' } });
    }
  };

  const handleLeaveChat = async () => {
    if (!chat || !currentUser) return;
    try {
      await chats.removeParticipant(chat.id, currentUser.id);
      setLocation('/chat');
      toastManager.add({ title: t('chats.leftChat'), data: { type: 'success' } });
    } catch (error) {
      console.error('Failed to leave chat:', error);
      toastManager.add({ title: t('chats.failedToLeave'), data: { type: 'error' } });
    }
  };

  const handleClearChat = async () => {
    if (!chat) return;
    try {
      await messages.clearChat(chat.id);
      await messageCache.clearChat(chat.id);
      toastManager.add({ title: t('chats.chatCleared'), data: { type: 'success' } });
    } catch (error) {
      console.error('Failed to clear chat:', error);
      toastManager.add({ title: t('chats.failedToClear'), data: { type: 'error' } });
    }
  };

  // Mobile: show only one component at a time
  if (isMobile) {
    if (showCallView && activeCallChat) {
      return <CallView show={showCallView} chat={activeCallChat} />;
    }
    if (!chatId) return null;
    if (rightSidebarView) {
      return (
        <RightSidebar
          chatId={chatId}
          chat={chat}
          currentUser={currentUser}
          view={rightSidebarView}
          onClose={() => setRightSidebarView(null)}
          onDeleteChat={handleDeleteChat}
          onLeaveChat={handleLeaveChat}
          onClearChat={handleClearChat}
          onChatUpdated={refetchChat}
          isMobile={isMobile}
        />
      );
    }
    return (
      <ChatWindow
        key={chatId || 'empty'}
        chatId={chatId}
        chat={chat}
        rightSidebarView={rightSidebarView}
        onToggleRightSidebar={setRightSidebarView}
        onDeleteChat={handleDeleteChat}
        onLeaveChat={handleLeaveChat}
      />
    );
  }

  // Desktop: show all components
  return (
    <>
      {isVideoCallsEnabled && activeCallChat && (
        <CallView show={showCallView} chat={activeCallChat} />
      )}
      <div className={`flex-1 flex overflow-hidden ${showCallView ? 'hidden' : ''}`}>
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatWindow
            key={chatId || 'empty'}
            chatId={chatId}
            chat={chat}
            rightSidebarView={rightSidebarView}
            onToggleRightSidebar={setRightSidebarView}
            onDeleteChat={handleDeleteChat}
            onLeaveChat={handleLeaveChat}
          />
        </div>
        {rightSidebarView && chatId && (
          <RightSidebar
            chatId={chatId}
            chat={chat}
            currentUser={currentUser}
            view={rightSidebarView}
            onClose={() => setRightSidebarView(null)}
            onDeleteChat={handleDeleteChat}
            onLeaveChat={handleLeaveChat}
            onClearChat={handleClearChat}
            onChatUpdated={refetchChat}
            isMobile={false}
          />
        )}
      </div>
    </>
  );
}
