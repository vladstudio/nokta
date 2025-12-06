import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Popover } from '../ui';
import { ArrowBendUpLeftIcon, ArrowBendUpRightIcon, CopyIcon, DotsThreeIcon, PencilIcon, StarIcon, TrashSimpleIcon, XIcon } from "@phosphor-icons/react";

const STORAGE_KEY = 'quick_emojis';

interface MessageActionsProps {
  onCancel: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onReply?: () => void;
  onForward?: () => void;
  onReact?: (emoji: string) => void;
  onFav?: () => void;
  userReactions?: string[];
  isFaved?: boolean;
}

const DEFAULT_QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉'];

function getStoredQuickEmojis(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === 4) return parsed;
    }
  } catch {}
  return DEFAULT_QUICK_EMOJIS;
}

function updateStoredQuickEmojis(emoji: string): string[] {
  const current = getStoredQuickEmojis();
  if (current.includes(emoji)) return current;
  const updated = [emoji, ...current.slice(0, 3)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
const MORE_EMOJIS = [
  // Happy faces
  '😊', '😄', '😁', '🙂', '😃', '🥰', '😇', '☺️',
  // Hearts & love
  '💙', '💚', '💛', '🧡', '💜', '🖤', '💖', '💕',
  // Laughing
  '🤣', '😆', '😅', '😹', '🤪', '😜', '😝', '😸',
  // Celebration
  '🥳', '🎊', '🤩', '🙌', '👏', '🎈', '🍾', '🥂',
  // Support & encouragement
  '💪', '✌️', '🤝', '🙏', '👊', '🤛', '🤜', '🤞',
  // Thinking & ideas
  '🤔', '🧠', '💡', '🤓', '📚', '✍️', '💭', '🎯',
  // Approval & success
  '✅', '✔️', '💯', '👌', '🏆', '🥇', '⭐', '🌟',
  // Surprise & shock
  '😮', '😲', '🤯', '😳', '👀', '🙈', '🙊', '😱',
  // Sad & disappointed
  '😢', '😭', '😞', '😔', '😟', '🥺', '😿', '💔',
  // Angry & frustrated
  '😠', '😡', '🤬', '😤', '😾', '💢', '👿', '😒',
  // Tired & sick
  '😴', '💤', '🥱', '😪', '🤧', '🤒', '🤕', '😵',
  // Cool & awesome
  '😎', '🤙', '🆒', '🔥', '🚀', '💎', '⚡', '🎸',
];

export default function MessageActions({ onCancel, onEdit, onDelete, onCopy, onReply, onForward, onReact, onFav, userReactions, isFaved }: MessageActionsProps) {
  const { t } = useTranslation();
  const [quickEmojis, setQuickEmojis] = useState(getStoredQuickEmojis);

  const handleReact = (emoji: string) => {
    setQuickEmojis(updateStoredQuickEmojis(emoji));
    onReact?.(emoji);
  };

  return (
    <div className="flex items-center gap-1 w-full">
      <Button variant="ghost" size="icon" onClick={onCancel}>
        <XIcon size={20} className="text-accent" />
      </Button>
      <div className="bg-(--color-border-default) w-px h-6" />
      {onReply && <Button variant="ghost" onClick={onReply}><ArrowBendUpLeftIcon size={20} className="text-accent" /><span className="hidden sm:inline ml-1">{t('messageActions.reply')}</span></Button>}
      {onForward && <Button variant="ghost" onClick={onForward}><ArrowBendUpRightIcon size={20} className="text-accent" /><span className="hidden sm:inline ml-1">{t('messageActions.forward')}</span></Button>}
      {onReact && (
        <>
          {quickEmojis.map(emoji => (
            <Button key={emoji} variant="ghost" size="icon" isSelected={userReactions?.includes(emoji)} onClick={() => handleReact(emoji)} className="text-xl center">{emoji}</Button>
          ))}
          <Popover trigger={<Button as="div" variant="ghost" size="icon" className="text-xl center"><DotsThreeIcon weight="bold" size={20} className="text-accent" /></Button>}>
            <div className="grid grid-cols-8 gap-1">
              {MORE_EMOJIS.map(emoji => (
                <Button key={emoji} variant="ghost" size="icon" isSelected={userReactions?.includes(emoji)} onClick={() => handleReact(emoji)} className="text-xl center">{emoji}</Button>
              ))}
            </div>
          </Popover>
        </>
      )}
      {onFav && <Button variant="ghost" size="icon" isSelected={isFaved} onClick={onFav}><StarIcon size={20} weight={isFaved ? 'fill' : 'regular'} className="text-accent" /></Button>}
      {onCopy && <Button variant="ghost" size="icon" onClick={onCopy}><CopyIcon size={20} className="text-accent" /></Button>}
      {onEdit && <Button variant="ghost" size="icon" onClick={onEdit}><PencilIcon size={20} className="text-accent" /></Button>}
      {onDelete && <Button variant="ghost" size="icon" onClick={onDelete}><TrashSimpleIcon size={20} className="text-accent" /></Button>}
      <div className="flex-1" />
    </div>
  );
}
