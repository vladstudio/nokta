import { PhoneIncoming, X, Check } from 'lucide-react';
import { Button } from '../ui';
import type { CallInvite } from '../types';

interface CallInviteWidgetProps {
  invite: CallInvite;
  onAccept: (inviteId: string) => void;
  onDecline: (inviteId: string) => void;
  isAccepting?: boolean;
  isDeclining?: boolean;
  isInCall?: boolean;
}

export default function CallInviteWidget({
  invite,
  onAccept,
  onDecline,
  isAccepting = false,
  isDeclining = false,
  isInCall = false
}: CallInviteWidgetProps) {
  const isLoading = isAccepting || isDeclining;
  return (
    <div className="p-3 border-t border-gray-200 bg-blue-50">
      <div className="flex items-center gap-2 mb-2">
        <PhoneIncoming className="w-4 h-4 text-blue-600" />
        <p className="text-sm font-medium text-gray-900">Incoming call</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-600 truncate flex-1">
          {invite.expand?.inviter?.name || invite.expand?.inviter?.email}
        </p>
        <div className="flex items-center gap-1">
          <Button
            onClick={() => onAccept(invite.id)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-green-600 hover:text-green-700"
            disabled={isLoading || isInCall}
            title={isInCall ? 'Leave current call first' : 'Accept'}
          >
            <Check className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onDecline(invite.id)}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700"
            disabled={isLoading}
            title="Decline"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
