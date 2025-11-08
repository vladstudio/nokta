import { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useAtom } from 'jotai';
import ChatWindow from '../components/ChatWindow';
import CallView from '../components/CallView';
import { callsAPI } from '../services/calls';
import { activeCallAtom, showCallViewAtom, isCallMinimizedAtom } from '../store/callStore';

export default function SpacePage() {
  const [, params] = useRoute('/spaces/:spaceId/chats/:chatId?');
  const [, setLocation] = useLocation();
  const chatId = params?.chatId;
  const spaceId = params?.spaceId;
  const [activeCall, setActiveCall] = useAtom(activeCallAtom);
  const [showCallView, setShowCallView] = useAtom(showCallViewAtom);
  const [isCallMinimized, setIsCallMinimized] = useAtom(isCallMinimizedAtom);

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
