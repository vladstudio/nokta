import { useRef } from 'react';
import { useAtom } from 'jotai';
import DailyIframe from '@daily-co/daily-js';
import { PhoneOff, Minimize2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { isCallMinimizedAtom } from '../store/callStore';
import type { Call } from '../types';

interface CallViewProps {
  call: Call;
  onLeaveCall: () => void;
}

export default function CallView({ call, onLeaveCall }: CallViewProps) {
  const callFrame = useRef<HTMLIFrameElement>(null);
  const [, setIsCallMinimized] = useAtom(isCallMinimizedAtom);

  return (
    <div className="relative w-full h-full bg-black">
      <iframe
        ref={callFrame}
        src={call.daily_room_url}
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
          onClick={onLeaveCall}
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
