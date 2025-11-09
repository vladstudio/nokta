import { useState, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../ui';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  onTyping: () => void;
  onAddClick: () => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, onTyping, onAddClick, disabled = false }: MessageInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  const handleMessageChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    onTyping();
    autoResize();
  }, [onTyping, autoResize]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending || disabled) return;

    const content = message.trim();
    setMessage('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setSending(true);
    try {
      await onSend(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="border-t border-(--color-border-default) px-4 py-3 bg-(--color-bg-primary)">
      <form onSubmit={handleSend} className="flex items-end gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onAddClick}
          className="shrink-0 w-9 h-9 p-0 text-lg font-semibold rounded-full mb-1"
          disabled={disabled}
        >
          +
        </Button>
        <Input
          as="textarea"
          ref={textareaRef}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder={t('messageInput.placeholder')}
          rows={1}
          className="flex-1 max-h-32 overflow-y-auto resize-none py-2.5"
          disabled={disabled}
        />
        <Button
          type="submit"
          disabled={!message.trim() || sending || disabled}
          className="shrink-0 px-5 mb-1"
        >
          {t('common.send')}
        </Button>
      </form>
    </div>
  );
}
