import { useTranslation } from 'react-i18next';
import type { Message } from '../types';
import { messages as messagesAPI } from '../services/pocketbase';

interface ChatMessageProps {
  message: Message & { isPending?: boolean; isFailed?: boolean; tempId?: string; uploadProgress?: number };
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

  const renderContent = () => {
    // Uploading state (for image/file)
    if (message.isPending && (message.type === 'image' || message.type === 'file')) {
      return (
        <div className="space-y-2">
          <p className="text-sm">{t('common.uploading')} {message.content}...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${message.uploadProgress || 0}%` }}
            />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); message.tempId && onCancelUpload?.(message.tempId); }}
            className="text-xs text-gray-500 hover:text-gray-700 underline"
          >
            {t('common.cancel')}
          </button>
        </div>
      );
    }

    // Failed upload state
    if (message.isFailed && (message.type === 'image' || message.type === 'file')) {
      return (
        <div className="space-y-2">
          <p className="text-sm text-red-700">{t('common.uploadFailed')}: {message.content}</p>
          <button
            onClick={(e) => { e.stopPropagation(); message.tempId && onRetry?.(message.tempId); }}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            {t('common.send')}
          </button>
        </div>
      );
    }

    // Text message
    if (message.type === 'text') {
      return <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>;
    }

    // Image message (uploaded successfully)
    if (message.type === 'image' && message.file) {
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
    }

    // File message (uploaded successfully)
    if (message.type === 'file' && message.file) {
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
    }

    return null;
  };

  return (
    <div
      id={`msg-${message.id}`}
      onClick={onSelect}
      className={`flex cursor-pointer rounded-lg transition-colors ${isOwn ? 'justify-end' : 'justify-start'} ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
    >
      <div className={`max-w-xl p-2 ${isOwn ? 'order-2' : 'order-1'}`}>
        <div className="flex items-baseline space-x-2 mb-1">
          <span className="text-xs font-medium text-gray-700">
            {isOwn ? t('common.you') : senderName}
          </span>
          {message.created && !message.isPending && (
            <span className="text-xs text-gray-400">
              {new Date(message.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {message.isPending && message.type === 'text' && (
            <span className="text-xs text-gray-400">{t('common.uploading')}...</span>
          )}
          {message.isFailed && message.type === 'text' && (
            <button
              onClick={(e) => { e.stopPropagation(); message.tempId && onRetry?.(message.tempId); }}
              className="text-xs text-red-500 hover:text-red-700 underline"
            >
              {t('common.uploadFailed')} - {t('common.send')}
            </button>
          )}
        </div>
        <div className={`rounded-lg px-4 py-2 ${isOwn ? message.isFailed ? 'bg-red-100 text-red-900 border border-red-300' : message.isPending ? 'bg-blue-400 text-white opacity-70' : 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
