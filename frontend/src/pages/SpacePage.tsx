import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAtom } from 'jotai';
import ChatWindow from '../components/ChatWindow';
import CallView from '../components/CallView';
import { callsAPI } from '../services/calls';
import { useCallHeartbeat } from '../hooks/useCallHeartbeat';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { activeCallAtom, showCallViewAtom, isCallMinimizedAtom } from '../store/callStore';
import { pb } from '../services/pocketbase';

export default function SpacePage() {
  const [, params] = useRoute('/spaces/:spaceId/chats/:chatId?');
  const [, setLocation] = useLocation();
  const chatId = params?.chatId;
  const spaceId = params?.spaceId;
  const [activeCall, setActiveCall] = useAtom(activeCallAtom);
  const [showCallView, setShowCallView] = useAtom(showCallViewAtom);
  const [isCallMinimized, setIsCallMinimized] = useAtom(isCallMinimizedAtom);
  const { isOnline } = useConnectionStatus();

  // Maintain call activity heartbeat
  useCallHeartbeat(activeCall);

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

    callsAPI.getMyCall(spaceId).then(call => {
      if (call) {
        setActiveCall(call);
        setShowCallView(true);
        setIsCallMinimized(true); // Show minimized by default
      }
    }).catch(() => {
      setActiveCall(null);
    });
  }, [spaceId, setActiveCall, setShowCallView, setIsCallMinimized]);

  // Subscribe to call updates
  useEffect(() => {
    if (!spaceId) return;

    const unsubscribe = callsAPI.subscribeToCalls((data) => {
      // Only process events for the current active call
      if (!activeCall || data.record.id !== activeCall.id) return;

      if (data.action === 'delete') {
        // Our active call was deleted
        setActiveCall(null);
        setShowCallView(false);
        setIsCallMinimized(false);
      } else if (data.action === 'update') {
        // Our active call was updated (e.g., participant changes)
        setActiveCall(data.record);
      }
    });

    return () => { unsubscribe.then(fn => fn?.()); };
  }, [spaceId, activeCall, setActiveCall, setShowCallView, setIsCallMinimized]);

  // Offline reconciliation: verify call still exists when reconnecting
  useEffect(() => {
    if (!activeCall || !spaceId || !isOnline) return;

    const reconcileCall = async () => {
      try {
        // Verify call still exists
        await pb.collection('calls').getOne(activeCall.id);
        // Call exists, refresh data to ensure we have latest participants
        const freshCall = await callsAPI.getMyCall(spaceId);
        if (freshCall?.id === activeCall.id) {
          setActiveCall(freshCall);
        } else {
          // User no longer in call
          setActiveCall(null);
          setShowCallView(false);
          setIsCallMinimized(false);
        }
      } catch {
        // Call was deleted while offline
        console.log('[Reconciliation] Call no longer exists, clearing state');
        setActiveCall(null);
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
  }, [activeCall, spaceId, isOnline, setActiveCall, setShowCallView, setIsCallMinimized]);

  const handleLeaveCall = async () => {
    if (activeCall) {
      try {
        await callsAPI.leave(activeCall.id);
      } catch (error) {
        console.error('Failed to leave call:', error);
      } finally {
        setActiveCall(null);
        setShowCallView(false);
        setIsCallMinimized(false);
      }
    }
  };

  if (showCallView && activeCall && !isCallMinimized) {
    return <CallView call={activeCall} onLeaveCall={handleLeaveCall} />;
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
