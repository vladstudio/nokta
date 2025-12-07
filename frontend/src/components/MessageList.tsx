import { useTranslation } from 'react-i18next';
import { ScrollArea, Button } from '../ui';
import LoadingSpinner from './LoadingSpinner';
import ChatMessage from './ChatMessage';
import type { Message } from '../types';

interface DisplayMessage extends Message {
  isPending?: boolean;
  isFailed?: boolean;
  tempId?: string;
  uploadProgress?: number;
}

interface MessageListProps {
  messages: DisplayMessage[];
  loadingOlder: boolean;
  selectedMessageId: string | null;
  hasMoreAfter: boolean;
  currentUserId: string;
  showFavsOnly?: boolean;
  onSelectMessage: (messageId: string | null) => void;
  onRetryMessage: (tempId: string) => void;
  onRetryUpload: (tempId: string) => void;
  onCancelUpload: (tempId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onMediaClick: (messageId: string) => void;
  onJumpToPresent: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  ref?: React.Ref<HTMLDivElement>;
}

function MessageList({
  messages,
  loadingOlder,
  selectedMessageId,
  hasMoreAfter,
  currentUserId,
  showFavsOnly,
  onSelectMessage,
  onRetryMessage,
  onRetryUpload,
  onCancelUpload,
  onReaction,
  onMediaClick,
  onJumpToPresent,
  messagesEndRef,
  ref,
}: MessageListProps) {
  const { t } = useTranslation();

  return (
    <ScrollArea ref={ref}>
      <div className="p-1 flex flex-col flex-1">
        {loadingOlder && (
          <div className="flex justify-center p-2">
            <LoadingSpinner size="sm" />
          </div>
        )}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-xs font-medium text-light text-center px-4">
            <img src="/icon-muted.svg" alt="Icon" className="w-32 h-32" />
            {showFavsOnly ? t('chatWindow.noStarredMessages') : t('chatWindow.noMessages')}
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwn={message.sender === currentUserId}
              currentUserId={currentUserId}
              isSelected={selectedMessageId === message.id}
              onSelect={() => onSelectMessage(selectedMessageId === message.id ? null : message.id)}
              onRetry={message.type === 'text' ? onRetryMessage : onRetryUpload}
              onCancelUpload={onCancelUpload}
              onReactionClick={(emoji) => onReaction(message.id, emoji)}
              onMediaClick={onMediaClick}
            />
          ))
        )}
        {hasMoreAfter && (
          <div className="flex justify-center p-4">
            <Button
              variant="default"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onJumpToPresent();
              }}
            >
              {t('chatWindow.jumpToPresent')}
            </Button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
}

export default MessageList;
