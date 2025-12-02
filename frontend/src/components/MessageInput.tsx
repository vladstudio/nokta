import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '../ui';
import { PaperPlaneTiltIcon, PlusIcon } from "@phosphor-icons/react";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  onTyping: () => void;
  onAddClick: () => void;
  onPasteImage?: (file: File) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, onTyping, onAddClick, onPasteImage, disabled = false }: MessageInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

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

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items || !onPasteImage) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) onPasteImage(file);
        break;
      }
    }
  }, [onPasteImage]);

  return (
    <form onSubmit={handleSend} className="w-full min-h-12! flex items-stretch gap-2">
      <Button
        type="button"
        variant="ghost"
        onClick={onAddClick}
        className="shrink-0"
        disabled={disabled}
      >
        <PlusIcon size={20} className="text-accent" />
      </Button>
      <Input
        as="textarea"
        ref={textareaRef}
        value={message}
        onChange={handleMessageChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={t('messageInput.placeholder')}
        rows={1}
        className="flex-1 max-h-64! overflow-y-auto resize-none "
        disabled={disabled}
      />
      <Button
        type="submit"
        variant="ghost"
        disabled={!message.trim() || sending || disabled}
        className="shrink-0"
      >
        <PaperPlaneTiltIcon size={20} weight="duotone" className="text-accent" />
      </Button>
    </form>
  );
}
