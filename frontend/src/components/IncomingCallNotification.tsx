import { Phone, X } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Call } from '../types';

interface IncomingCallNotificationProps {
  call: Call;
  spaceName: string;
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallNotification({
  spaceName,
  onAccept,
  onDecline
}: IncomingCallNotificationProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-lg">
      <Phone className="w-6 h-6 text-green-600" />
      <div className="flex-1">
        <p className="font-semibold">Incoming call</p>
        <p className="text-sm text-gray-600">{spaceName}</p>
      </div>
      <Button onClick={onAccept} variant="primary" size="default">
        Accept
      </Button>
      <Button onClick={onDecline} variant="ghost" size="icon">
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
