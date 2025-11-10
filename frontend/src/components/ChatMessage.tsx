import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import type { Message } from '../types';
import { messages as messagesAPI } from '../services/pocketbase';

type MessageWithStatus = Message & {
  isPending?: boolean;
  isFailed?: boolean;
  tempId?: string;
  uploadProgress?: number;
};

interface ChatMessageProps {
  message: MessageWithStatus;
  isOwn: boolean;
  currentUserId: string;
  isSelected: boolean;
  onSelect: () => void;
  onRetry?: (tempId: string) => void;
  onCancelUpload?: (tempId: string) => void;
}

export default function ChatMessage({ message, isOwn, isSelected, onSelect, onRetry, onCancelUpload }: ChatMessageProps) {
  const { t } = useTranslation();
  const senderName = message.expand?.sender?.name || message.expand?.sender?.email || t('common.unknown');

  const renderUploadingState = () => (
    <div className="space-y-1">
      <p className="text-sm">{t('common.uploading')} {message.content}...</p>
      <div className="w-full bg-(--color-bg-active) rounded-full h-2">
        <div
          className="bg-(--color-primary-600) h-2 rounded-full transition-all"
          style={{ width: `${message.uploadProgress || 0}%` }}
        />
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); message.tempId && onCancelUpload?.(message.tempId); }}
        className="text-xs text-light hover:text-(--color-text-primary) underline"
      >
        {t('common.cancel')}
      </button>
    </div>
  );

  const renderFailedState = () => (
    <div className="space-y-2">
      <p className="text-sm text-(--color-error-600)">{t('common.uploadFailed')}: {message.content}</p>
      <button
        onClick={(e) => { e.stopPropagation(); message.tempId && onRetry?.(message.tempId); }}
        className="text-xs text-(--color-error-500) hover:text-(--color-error-600) underline"
      >
        {t('common.send')}
      </button>
    </div>
  );

  const renderTextMessage = () => (
    <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>
  );

  const renderImageMessage = () => {
    const imageUrl = messagesAPI.getFileURL(message, '600x600');
    return (
      <div>
        <img
          src={imageUrl}
          alt={message.content || 'Image'}
          className="max-w-xs rounded cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            window.open(messagesAPI.getFileURL(message), '_blank');
          }}
        />
        {message.content && message.content !== message.file && (
          <p className="text-sm mt-2">{message.content}</p>
        )}
      </div>
    );
  };

  const renderFileMessage = () => {
    const fileUrl = messagesAPI.getFileURL(message);
    return (
      <a
        href={fileUrl + '?download=1'}
        download={message.file}
        className="flex items-center gap-2 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-lg">📄</span>
        <span className="text-sm">{message.file}</span>
      </a>
    );
  };

  const renderContent = () => {
    if (message.isPending && (message.type === 'image' || message.type === 'file')) {
      return renderUploadingState();
    }
    if (message.isFailed && (message.type === 'image' || message.type === 'file')) {
      return renderFailedState();
    }
    if (message.type === 'text') {
      return renderTextMessage();
    }
    if (message.type === 'image' && message.file) {
      return renderImageMessage();
    }
    if (message.type === 'file' && message.file) {
      return renderFileMessage();
    }

    return null;
  };

  return (
    <div
      id={`msg-${message.id}`}
      onClick={onSelect}
      className={clsx(
        'p-2 flex cursor-pointer transition-colors hover:bg-(--color-bg-hover) rounded',
        isOwn ? 'justify-end' : 'justify-start',
        isSelected && 'bg-(--color-bg-active)!'
      )}
    >
      <div className={clsx('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
        <div className="flex items-baseline gap-2 px-1">
          <span className="text-xs font-medium text-light">
            {isOwn ? t('common.you') : senderName}
          </span>
          {message.created && !message.isPending && (
            <span className="text-xs text-light">
              {new Date(message.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {message.isPending && message.type === 'text' && (
            <span className="text-xs text-light">{t('common.uploading')}...</span>
          )}
          {message.isFailed && message.type === 'text' && (
            <button
              onClick={(e) => { e.stopPropagation(); message.tempId && onRetry?.(message.tempId); }}
              className="text-xs text-(--color-error-500) hover:text-(--color-error-600) underline"
            >
              {t('common.uploadFailed')} - {t('common.send')}
            </button>
          )}
        </div>
        <div className={clsx(
          'rounded-xl px-4 py-2 max-w-lg wrap-break-word shadow-(--shadow-xs) border border-(--color-border-default)',
          isOwn
            ? 'bg-(--color-bg-primary)/30 backdrop-blur-lg'
            : 'bg-(--color-bg-primary)',
          message.isFailed && 'bg-(--color-error-50)! text-(--color-error-600)! border-(--color-error-500)!',
          message.isPending && 'opacity-70'
        )}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
