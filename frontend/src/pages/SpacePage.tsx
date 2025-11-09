import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAtom } from 'jotai';
import ChatWindow from '../components/ChatWindow';
import CallView from '../components/CallView';
import { callsAPI } from '../services/calls';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { activeCallChatAtom, showCallViewAtom, isCallMinimizedAtom } from '../store/callStore';
import { pb } from '../services/pocketbase';

export default function SpacePage() {
  const [, params] = useRoute('/spaces/:spaceId/chats/:chatId?');
  const [, setLocation] = useLocation();
  const chatId = params?.chatId;
  const spaceId = params?.spaceId;
  const [activeCallChat, setActiveCallChat] = useAtom(activeCallChatAtom);
  const [showCallView, setShowCallView] = useAtom(showCallViewAtom);
  const [isCallMinimized, setIsCallMinimized] = useAtom(isCallMinimizedAtom);
  const { isOnline } = useConnectionStatus();

  useEffect(() => {
    const handleNotificationClick = (event: Event) => {
      const { chatId: targetChatId, spaceId: targetSpaceId } = (event as CustomEvent).detail;
      if (targetSpaceId && targetChatId) {
        setLocation(`/spaces/${targetSpaceId}/chats/${targetChatId}`);
      }
    };
    window.addEventListener('notification-click', handleNotificationClick);
    return () => window.removeEventListener('notification-click', handleNotificationClick);
  }, [setLocation]);

  // Load user's active call on mount
  useEffect(() => {
    if (!spaceId) return;

    // Find chat where user is in call_participants and is_active_call is true
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
          setShowCallView(true);
          setIsCallMinimized(true); // Show minimized by default
        }
      } catch (error) {
        console.error('Failed to load active call:', error);
        setActiveCallChat(null);
      }
    };

    loadActiveCall();
  }, [spaceId, setActiveCallChat, setShowCallView, setIsCallMinimized]);

  // Subscribe to chat updates for active calls
  useEffect(() => {
    if (!spaceId) return;

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
          setIsCallMinimized(false);
        }
      }
    });

    return () => { unsubscribe.then(fn => fn?.()); };
  }, [spaceId, activeCallChat, setActiveCallChat, setShowCallView, setIsCallMinimized]);

  // Offline reconciliation: verify call still exists when reconnecting
  useEffect(() => {
    if (!activeCallChat || !spaceId || !isOnline) return;

    const reconcileCall = async () => {
      try {
        const currentUserId = pb.authStore.model?.id;
        if (!currentUserId) return;

        // Verify chat still exists and user is still in participants
        const chat = await pb.collection('chats').getOne(activeCallChat.id);
        if (chat.is_active_call && chat.call_participants?.includes(currentUserId)) {
          setActiveCallChat(chat);
        } else {
          // User no longer in call or call ended
          setActiveCallChat(null);
          setShowCallView(false);
          setIsCallMinimized(false);
        }
      } catch {
        // Call was deleted while offline
        console.log('[Reconciliation] Call no longer exists, clearing state');
        setActiveCallChat(null);
        setShowCallView(false);
        setIsCallMinimized(false);
      }
    };

    // Only reconcile on online event (not on mount)
    const handleOnline = () => {
      reconcileCall();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [activeCallChat, spaceId, setActiveCallChat, setShowCallView, setIsCallMinimized]);

  if (showCallView && activeCallChat && !isCallMinimized) {
    return <CallView chat={activeCallChat} />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {chatId ? (
        <ChatWindow chatId={chatId} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
}
