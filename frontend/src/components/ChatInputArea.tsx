import { useTranslation } from 'react-i18next';
import { XIcon } from '@phosphor-icons/react';
import MessageInput from './MessageInput';
import MessageActions from './MessageActions';
import AddActions from './AddActions';
import { Button } from '../ui';
import type { Message } from '../types';

interface DisplayMessage extends Message {
  isPending?: boolean;
  isFailed?: boolean;
  tempId?: string;
  uploadProgress?: number;
}

interface ChatInputAreaProps {
  showAddActions: boolean;
  selectedMessageId: string | null;
  selectedMessage: DisplayMessage | undefined;
  canEditOrDelete: boolean;
  currentUserId: string;
  replyingTo: Message | null;
  onSend: (content: string) => void;
  onTyping: () => void;
  onCancelAddActions: () => void;
  onImageSelect: () => void;
  onVideoSelect: () => void;
  onFileSelect: () => void;
  onVoiceSelect: () => void;
  onQuickVideoSelect: () => void;
  onShowAddActions: () => void;
  onCancelMessageSelection: () => void;
  onPasteImage?: (file: File) => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReply: () => void;
  onForward: () => void;
  onCancelReply: () => void;
  onReact: (emoji: string) => void;
}

export default function ChatInputArea({
  showAddActions,
  selectedMessageId,
  selectedMessage,
  canEditOrDelete,
  currentUserId,
  replyingTo,
  onSend,
  onTyping,
  onCancelAddActions,
  onImageSelect,
  onVideoSelect,
  onFileSelect,
  onVoiceSelect,
  onQuickVideoSelect,
  onShowAddActions,
  onCancelMessageSelection,
  onPasteImage,
  onCopy,
  onEdit,
  onDelete,
  onReply,
  onForward,
  onCancelReply,
  onReact,
}: ChatInputAreaProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full shrink-0 bg-(--color-bg-primary) border-t border-(--color-border-default) flex flex-col">
      {replyingTo && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-(--color-bg-hover) border-b border-(--color-border-default)">
          <span className="text-xs text-light">{t('messageActions.replyingTo')}:</span>
          <span className="text-xs truncate flex-1">{replyingTo.content}</span>
          <Button variant="ghost" size="icon" onClick={onCancelReply}><XIcon size={16} /></Button>
        </div>
      )}
      <div className="flex items-stretch p-2 min-h-16!">
        {showAddActions ? (
          <AddActions
            onCancel={onCancelAddActions}
            onImageSelect={onImageSelect}
            onVideoSelect={onVideoSelect}
            onFileSelect={onFileSelect}
            onVoiceSelect={onVoiceSelect}
            onQuickVideoSelect={onQuickVideoSelect}
          />
        ) : selectedMessageId ? (
          <MessageActions
            onCancel={onCancelMessageSelection}
            onCopy={selectedMessage?.type !== 'file' ? onCopy : undefined}
            onEdit={canEditOrDelete && selectedMessage?.type === 'text' ? onEdit : undefined}
            onDelete={canEditOrDelete ? onDelete : undefined}
            onReply={selectedMessage && !selectedMessage.isPending ? onReply : undefined}
            onForward={selectedMessage && !selectedMessage.isPending ? onForward : undefined}
            onReact={!canEditOrDelete && selectedMessageId ? onReact : undefined}
            userReactions={
              selectedMessage?.reactions
                ? Object.keys(selectedMessage.reactions).filter((emoji) =>
                    selectedMessage.reactions![emoji].includes(currentUserId)
                  )
                : undefined
            }
          />
        ) : (
          <MessageInput onSend={onSend} onTyping={onTyping} onAddClick={onShowAddActions} onPasteImage={onPasteImage} />
        )}
      </div>
    </div>
  );
}
