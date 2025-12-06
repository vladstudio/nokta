import { useEffect, useMemo, useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, ArrowRightIcon, DownloadSimpleIcon, XIcon } from '@phosphor-icons/react';
import { messages as messagesAPI } from '../services/pocketbase';
import type { Message } from '../types';
import { Button } from "../ui";

interface MediaViewerProps {
  messages: Message[];
  currentMessageId: string;
  onClose: () => void;
  onNavigate: (messageId: string) => void;
}

export default function MediaViewer({ messages, currentMessageId, onClose, onNavigate }: MediaViewerProps) {
  const { t } = useTranslation();

  const mediaMessages = useMemo(
    () => messages.filter(m => (m.type === 'image' || m.type === 'video') && m.file),
    [messages]
  );

  const currentIndex = useMemo(
    () => mediaMessages.findIndex(m => m.id === currentMessageId),
    [mediaMessages, currentMessageId]
  );

  const current = mediaMessages[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < mediaMessages.length - 1;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(mediaMessages[currentIndex - 1].id);
  }, [hasPrev, currentIndex, mediaMessages, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(mediaMessages[currentIndex + 1].id);
  }, [hasNext, currentIndex, mediaMessages, onNavigate]);

  useHotkeys('left', goPrev, [goPrev]);
  useHotkeys('right', goNext, [goNext]);
  useHotkeys('esc', onClose, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!current) return null;

  const fileUrl = messagesAPI.getFileURL(current);
  const senderName = current.expand?.sender?.name || current.expand?.sender?.email || t('common.unknown');
  const time = current.created ? new Date(current.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <div
      className="media-viewer"
      onClick={onClose}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 pl-5 text-white" onClick={e => e.stopPropagation()}>
        <div className="text-sm">
          <span className="font-medium">{senderName}</span>
          {time && <span className="ml-2 opacity-70">{time}</span>}
        </div>
        <div className="flex sm:gap-1">
          <Button variant="ghost" size="icon" onClick={goPrev} disabled={!hasPrev}>
            <ArrowLeftIcon size={20} className="text-white" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goNext} disabled={!hasNext}>
            <ArrowRightIcon size={20} className="text-white" />
          </Button>
          <Button variant="ghost" size="icon" href={fileUrl + '?download=1'} download={current.file}>
            <DownloadSimpleIcon size={20} className="text-white" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon size={20} className="text-white" />
          </Button>
        </div>
      </div>

      {/* Media */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 min-h-0" onClick={e => e.stopPropagation()}>
        {current.type === 'image' ? (
          <img
            key={current.id}
            src={fileUrl}
            alt={current.content || 'Image'}
            className="max-w-full max-h-full object-contain animate-fade-in"
          />
        ) : (
          <video
            key={current.id}
            src={fileUrl}
            controls
            autoPlay
            className="max-w-full max-h-full object-contain animate-fade-in"
          />
        )}
      </div>
    </div>
  );
}
