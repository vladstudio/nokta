import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import ChatWindow from '../components/ChatWindow';
import CallView from '../components/CallView';
import RightSidebar, { type RightSidebarView } from '../components/RightSidebar';
import { callsAPI } from '../services/calls';
import { chats, auth } from '../services/pocketbase';
import { messageQueue } from '../utils/messageQueue';
import { messageCache } from '../utils/messageCache';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { useIsMobile } from '../hooks/useIsMobile';
import { useToastManager } from '../ui';
import { activeCallChatAtom, showCallViewAtom } from '../store/callStore';
import { isVideoCallsEnabled } from '../config/features';
import { pb } from '../services/pocketbase';
import type { Chat } from '../types';

export default function SpacePage() {
  const { t } = useTranslation();
  const [, params] = useRoute('/spaces/:spaceId/chat/:chatId?');
  const [, setLocation] = useLocation();
  const toastManager = useToastManager();
  const chatId = params?.chatId;
  const spaceId = params?.spaceId;
  const currentUser = auth.user;
  const isMobile = useIsMobile();
  const [activeCallChat, setActiveCallChat] = useAtom(activeCallChatAtom);
  const [showCallView, setShowCallView] = useAtom(showCallViewAtom);
  const { isOnline } = useConnectionStatus();
  const [rightSidebarView, setRightSidebarView] = useState<RightSidebarView | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);

  useEffect(() => {
    const handleNotificationClick = (event: Event) => {
      const { chatId: targetChatId, spaceId: targetSpaceId } = (event as CustomEvent).detail;
      if (targetSpaceId && targetChatId) {
        setLocation(`/spaces/${targetSpaceId}/chat/${targetChatId}`);
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

  // Load user's active call on mount
  useEffect(() => {
    if (!isVideoCallsEnabled || !spaceId) return;

    const loadActiveCall = async () => {
      try {
        const currentUserId = pb.authStore.model?.id;
        if (!currentUserId) return;

        const activeCalls = await callsAPI.getActiveCallsInSpace(spaceId);
        const myActiveCall = activeCalls.find(chat =>
          chat.call_participants?.includes(currentUserId)
        );

        if (myActiveCall) {
          setActiveCallChat(myActiveCall);
          // Only show call view if no chat is selected
          if (!chatId) setShowCallView(true);
        }
      } catch (error) {
        console.error('Failed to load active call:', error);
        setActiveCallChat(null);
      }
    };

    loadActiveCall();
  }, [spaceId, chatId, setActiveCallChat, setShowCallView]);

  // Subscribe to chat updates for active calls
  useEffect(() => {
    if (!isVideoCallsEnabled || !spaceId) return;

    const unsubscribe = callsAPI.subscribeToActiveCalls(spaceId, (data) => {
      // Only process events for the current active call
      if (!activeCallChat || data.record.id !== activeCallChat.id) return;

      const currentUserId = pb.authStore.model?.id;
      if (!currentUserId) return;

      if (data.action === 'delete' || data.action === 'update') {
        // Check if user is still in participants
        if (data.record.call_participants?.includes(currentUserId) && data.record.is_active_call) {
          // Still in call, update state
          setActiveCallChat(data.record);
        } else {
          // User removed from call or call ended
          setActiveCallChat(null);
          setShowCallView(false);
        }
      }
    });

    return () => { unsubscribe.then(fn => fn?.()); };
  }, [spaceId, activeCallChat, setActiveCallChat, setShowCallView]);

  // Offline reconciliation: verify call still exists when reconnecting
  useEffect(() => {
    if (!isVideoCallsEnabled || !activeCallChat || !spaceId || !isOnline) return;

    const reconcileCall = async () => {
      try {
        const currentUserId = pb.authStore.model?.id;
        if (!currentUserId) return;

        // Verify chat still exists and user is still in participants
        const chat = await pb.collection('chats').getOne<Chat>(activeCallChat.id);
        if (chat.is_active_call && chat.call_participants?.includes(currentUserId)) {
          setActiveCallChat(chat);
        } else {
          // User no longer in call or call ended
          setActiveCallChat(null);
          setShowCallView(false);
        }
      } catch {
        // Call was deleted while offline
        console.log('[Reconciliation] Call no longer exists, clearing state');
        setActiveCallChat(null);
        setShowCallView(false);
      }
    };

    // Only reconcile on online event (not on mount)
    const handleOnline = () => {
      reconcileCall();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [activeCallChat, spaceId, setActiveCallChat, setShowCallView]);

  const handleDeleteChat = async () => {
    if (!chat) return;
    try {
      messageQueue.clearChat(chat.id);
      await messageCache.clearChat(chat.id);
      await chats.delete(chat.id);
      setLocation(`/spaces/${spaceId}/chat`);
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
      setLocation(`/spaces/${spaceId}/chat`);
      toastManager.add({ title: t('chats.leftChat'), data: { type: 'success' } });
    } catch (error) {
      console.error('Failed to leave chat:', error);
      toastManager.add({ title: t('chats.failedToLeave'), data: { type: 'error' } });
    }
  };

  if (isMobile && !chatId) return null;

  // Mobile: show only one component at a time
  if (isMobile) {
    if (showCallView && activeCallChat) {
      return <CallView show={showCallView} chat={activeCallChat} />;
    }
    if (rightSidebarView && chatId) {
      return (
        <RightSidebar
          chatId={chatId}
          chat={chat}
          currentUser={currentUser}
          view={rightSidebarView}
          onClose={() => setRightSidebarView(null)}
          onDeleteChat={handleDeleteChat}
          onLeaveChat={handleLeaveChat}
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
            isMobile={false}
          />
        )}
      </div>
    </>
  );
}
