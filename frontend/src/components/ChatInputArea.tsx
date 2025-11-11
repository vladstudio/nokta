import MessageInput from './MessageInput';
import MessageActions from './MessageActions';
import AddActions from './AddActions';
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
  onSend: (content: string) => void;
  onTyping: () => void;
  onCancelAddActions: () => void;
  onImageSelect: () => void;
  onFileSelect: () => void;
  onShowAddActions: () => void;
  onCancelMessageSelection: () => void;
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReact: (emoji: string) => void;
}

export default function ChatInputArea({
  showAddActions,
  selectedMessageId,
  selectedMessage,
  canEditOrDelete,
  currentUserId,
  onSend,
  onTyping,
  onCancelAddActions,
  onImageSelect,
  onFileSelect,
  onShowAddActions,
  onCancelMessageSelection,
  onCopy,
  onEdit,
  onDelete,
  onReact,
}: ChatInputAreaProps) {
  return (
    <div className="w-full shrink-0 min-h-16! bg-(--color-bg-primary) border-t border-(--color-border-default) flex items-stretch p-2">
      {showAddActions ? (
        <AddActions
          onCancel={onCancelAddActions}
          onImageSelect={onImageSelect}
          onFileSelect={onFileSelect}
        />
      ) : selectedMessageId ? (
        <MessageActions
          onCancel={onCancelMessageSelection}
          onCopy={selectedMessage?.type !== 'file' ? onCopy : undefined}
          onEdit={canEditOrDelete && selectedMessage?.type === 'text' ? onEdit : undefined}
          onDelete={canEditOrDelete ? onDelete : undefined}
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
        <MessageInput onSend={onSend} onTyping={onTyping} onAddClick={onShowAddActions} />
      )}
    </div>
  );
}
