import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useRoute } from 'wouter';
import { useHotkeys } from 'react-hotkeys-hook';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useSearchMessages } from '../../hooks/useSearchMessages';
import { ScrollArea, Input } from '../../ui';
import LoadingSpinner from '../LoadingSpinner';
import type { Message } from '../../types';

interface SearchProps {
  chatId: string;
  onClose: () => void;
  isMobile: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
};

const truncateContent = (content: string, maxLength = 100) => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + '...';
};

const EMPTY_STATE_ICON_SIZE = 80;

export default function Search({ chatId, onClose, isMobile }: SearchProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/spaces/:spaceId/chat/:chatId?');
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { results, loading } = useSearchMessages(chatId, query);
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelectMessage = (message: Message, index: number) => {
    setSelectedIndex(index);
    setLocation(`/spaces/${params?.spaceId}/chat/${chatId}?msg=${message.id}`);
    if (isMobile) onClose();
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
    resultRefs.current = resultRefs.current.slice(0, results.length);
  }, [results]);

  useEffect(() => {
    if (results.length > 0 && resultRefs.current[selectedIndex]) {
      resultRefs.current[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, results.length]);

  useHotkeys('up', () => {
    if (results.length > 0) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    }
  }, { preventDefault: true, enabled: results.length > 0 });

  useHotkeys('down', () => {
    if (results.length > 0) {
      setSelectedIndex(prev => Math.min(results.length - 1, prev + 1));
    }
  }, { preventDefault: true, enabled: results.length > 0 });

  useHotkeys('enter', () => {
    if (results.length > 0 && results[selectedIndex]) {
      handleSelectMessage(results[selectedIndex], selectedIndex);
    }
  }, { preventDefault: true, enabled: results.length > 0 });

  return (
    <>
      <div className="p-2 bg-(--color-bg-primary)">
        <div className="relative">
          <MagnifyingGlassIcon
            size={16}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-light"
          />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8"
            placeholder={t('search.placeholder')}
            aria-label={t('search.label')}
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 grid gap-1 bg-(--color-bg-primary)">
          {loading && (
            <div className="flex justify-center p-4">
              <LoadingSpinner size="sm" />
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center p-4 text-sm text-light">
              {t('search.noResults')}
            </div>
          )}

          {!loading && !query && (
            <div className="flex justify-center p-4">
              <MagnifyingGlassIcon size={EMPTY_STATE_ICON_SIZE} className="text-(--color-border-light)" />
            </div>
          )}

          {!loading && results.map((message, index) => (
            <button
              key={message.id}
              ref={el => { resultRefs.current[index] = el; }}
              onClick={() => handleSelectMessage(message, index)}
              className={`w-full p-2 text-left rounded hover:bg-(--color-bg-secondary) transition-colors ${selectedIndex === index ? 'bg-(--color-bg-active)' : ''
                }`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium truncate">
                      {message.expand?.sender?.name || message.expand?.sender?.email || t('common.unknown')}
                    </span>
                    <span className="text-xs text-light shrink-0">
                      {message.created ? formatDate(message.created) : ''}
                    </span>
                  </div>
                  <div className="text-sm text-(--color-text-primary) wrap-break-word">
                    {truncateContent(message.content)}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
