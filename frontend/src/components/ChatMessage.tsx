import type { Message } from '../types';

interface ChatMessageProps {
  message: Message & { isPending?: boolean; isFailed?: boolean; tempId?: string };
  isOwn: boolean;
  currentUserId: string;
  isSelected: boolean;
  onSelect: () => void;
  onRetry?: (tempId: string) => void;
}

export default function ChatMessage({ message, isOwn, isSelected, onSelect, onRetry }: ChatMessageProps) {
  const senderName = message.expand?.sender?.name || message.expand?.sender?.email || 'Unknown';

  return (
    <div
      id={`msg-${message.id}`}
      onClick={onSelect}
      className={`flex cursor-pointer rounded-lg transition-colors ${isOwn ? 'justify-end' : 'justify-start'} ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
    >
      <div className={`max-w-xl p-2 ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-xs font-medium text-gray-700">
            {isOwn ? 'You' : senderName}
          </span>
          {message.created && !message.isPending && (
            <span className="text-xs text-gray-400">
              {new Date(message.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {message.isPending && <span className="text-xs text-gray-400">Sending...</span>}
          {message.isFailed && (
            <button
              onClick={(e) => { e.stopPropagation(); message.tempId && onRetry?.(message.tempId); }}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              Failed - Retry
            </button>
          )}
        </div>
        <div className={`rounded-lg px-4 py-2 ${isOwn ? message.isFailed ? 'bg-red-100 text-red-900 border border-red-300' : message.isPending ? 'bg-blue-400 text-white opacity-70' : 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
          <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>
        </div>
      </div>
    </div>
  );
}
