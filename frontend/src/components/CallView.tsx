import { useRef } from 'react';
import { useSetAtom } from 'jotai';
import { PhoneOff, Minimize2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { activeCallChatAtom, showCallViewAtom, isCallMinimizedAtom } from '../store/callStore';
import { callsAPI } from '../services/calls';
import { pb } from '../services/pocketbase';
import type { Chat } from '../types';

interface CallViewProps {
  chat: Chat;
}

export default function CallView({ chat }: CallViewProps) {
  const callFrame = useRef<HTMLIFrameElement>(null);
  const setIsCallMinimized = useSetAtom(isCallMinimizedAtom);
  const setActiveCallChat = useSetAtom(activeCallChatAtom);
  const setShowCallView = useSetAtom(showCallViewAtom);

  const handleLeaveCall = async () => {
    const currentUserId = pb.authStore.model?.id;
    if (!currentUserId) {
      console.error('Cannot leave call: user not authenticated');
      return;
    }

    try {
      await callsAPI.leaveCall(chat.id, currentUserId);
    } catch (error) {
      console.error('Failed to leave call:', error);
    } finally {
      // Always clear local state, even if API call fails
      setActiveCallChat(null);
      setShowCallView(false);
      setIsCallMinimized(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-black">
      <iframe
        ref={callFrame}
        src={chat.daily_room_url}
        allow="camera; microphone; fullscreen; display-capture"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: 'none'
        }}
      />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <Button
          onClick={() => setIsCallMinimized(true)}
          variant="default"
          className="rounded-full bg-gray-700 text-white hover:bg-gray-800 px-6 py-3"
        >
          <Minimize2 className="w-5 h-5 mr-2" />
          Minimize
        </Button>
        <Button
          onClick={handleLeaveCall}
          variant="default"
          className="rounded-full bg-red-600 text-white hover:bg-red-700 px-6 py-3"
        >
          <PhoneOff className="w-6 h-6 mr-2" />
          Leave
        </Button>
      </div>
    </div>
  );
}
