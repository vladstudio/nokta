import { useCallback, useRef } from 'react';
import { useSetAtom } from 'jotai';
import { DailyProvider, useCallFrame, useDailyEvent } from '@daily-co/daily-react';
import { activeCallChatAtom, showCallViewAtom } from '../store/callStore';
import { callsAPI } from '../services/calls';
import { pb } from '../services/pocketbase';
import type { Chat } from '../types';

interface CallViewProps {
  chat: Chat;
}

// Inner component that uses useDailyEvent
function CallContent({ chat }: CallViewProps) {
  const setActiveCallChat = useSetAtom(activeCallChatAtom);
  const setShowCallView = useSetAtom(showCallViewAtom);

  const handleLeaveCall = useCallback(async () => {
    const currentUserId = pb.authStore.model?.id;
    if (!currentUserId) return;

    try {
      await callsAPI.leaveCall(chat.id, currentUserId);
      // Only clear state if successfully left
      setActiveCallChat(null);
      setShowCallView(false);
    } catch (error) {
      console.error('Failed to leave call:', error);
      // Clear state anyway to prevent stuck UI
      setActiveCallChat(null);
      setShowCallView(false);
    }
  }, [chat.id, setActiveCallChat, setShowCallView]);

  useDailyEvent('left-meeting', handleLeaveCall);

  return null;
}

export default function CallView({ chat }: CallViewProps) {
  // Check for required data BEFORE calling any hooks
  if (!chat.daily_room_url) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white">
        <div className="text-center">
          <p className="text-xl mb-2">Call room not available</p>
          <p className="text-sm text-gray-400">Please try starting the call again</p>
        </div>
      </div>
    );
  }

  const containerRef = useRef<HTMLDivElement>(null);

  const callFrame = useCallFrame({
    parentElRef: containerRef,
    options: {
      url: chat.daily_room_url,
      showLeaveButton: true,
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none',
      },
    },
  });

  return (
    <DailyProvider callObject={callFrame}>
      <div ref={containerRef} className="relative w-full h-full bg-black" />
      <CallContent chat={chat} />
    </DailyProvider>
  );
}
