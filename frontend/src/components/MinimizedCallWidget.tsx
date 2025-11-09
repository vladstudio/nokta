import { useAtom } from 'jotai';
import { Maximize2, PhoneOff } from 'lucide-react';
import { activeCallChatAtom, isCallMinimizedAtom, showCallViewAtom } from '../store/callStore';
import { callsAPI } from '../services/calls';
import { auth } from '../services/pocketbase';
import { Button } from '../ui';

export default function MinimizedCallWidget() {
  const [activeCallChat, setActiveCallChat] = useAtom(activeCallChatAtom);
  const [isCallMinimized, setIsCallMinimized] = useAtom(isCallMinimizedAtom);
  const [showCallView, setShowCallView] = useAtom(showCallViewAtom);

  // Only show minimized widget if user has actively joined the call
  if (!activeCallChat || !showCallView || !isCallMinimized) return null;

  const handleLeaveCall = async () => {
    if (activeCallChat && auth.user) {
      try {
        await callsAPI.leaveCall(activeCallChat.id, auth.user.id);
      } catch (error) {
        console.error('Failed to leave call:', error);
      } finally {
        setActiveCallChat(null);
        setShowCallView(false);
        setIsCallMinimized(false);
      }
    }
  };

  const handleMaximize = () => {
    setShowCallView(true);
    setIsCallMinimized(false);
  };

  return (
    <div className="p-3 border-t border-gray-200 bg-green-50">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">Call in progress</p>
          <p className="text-xs text-gray-600">Active call</p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            onClick={handleMaximize}
            variant="ghost"
            size="icon"
            className="h-8 w-8"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={handleLeaveCall}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700"
          >
            <PhoneOff className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
