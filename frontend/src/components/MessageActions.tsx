import { useTranslation } from 'react-i18next';
import { Button, Popover } from '../ui';
import { CopyIcon, DotsThreeIcon, PencilIcon, TrashSimpleIcon, XIcon } from "@phosphor-icons/react";

interface MessageActionsProps {
  onCancel: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onReact?: (emoji: string) => void;
  userReactions?: string[];
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉'];
const MORE_EMOJIS = ['🔥', '👏', '💯', '✅', '😍', '🤔', '👀', '💪', '🙏', '⭐', '🚀', '💡', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎵', '🎸', '🎹', '🎺', '🎻', '🥁', '🎮', '🎲', '🎰', '🧩', '🎳', '🎯', '🎱', '🏆', '🥇', '🥈', '🥉', '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊'];

export default function MessageActions({ onCancel, onEdit, onDelete, onCopy, onReact, userReactions }: MessageActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 w-full">
      <Button variant="ghost" size="icon" onClick={onCancel}>
        <XIcon size={20} className="text-accent" />
      </Button>
      <div className="bg-(--color-border-default) w-px h-6" />
      {onReact && (
        <>
          {QUICK_EMOJIS.map(emoji => (
            <Button key={emoji} variant="ghost" size="icon" isSelected={userReactions?.includes(emoji)} onClick={() => onReact(emoji)} className="text-xl">{emoji}</Button>
          ))}
          <Popover trigger={<Button variant="ghost" size="icon" className="text-lg"><DotsThreeIcon weight="bold" size={20} className="text-accent" /></Button>}>
            <div className="grid grid-cols-8 gap-1">
              {MORE_EMOJIS.map(emoji => (
                <Button key={emoji} variant="ghost" size="icon" isSelected={userReactions?.includes(emoji)} onClick={() => onReact(emoji)} className="text-xl">{emoji}</Button>
              ))}
            </div>
          </Popover>
        </>
      )}
      {onCopy && <Button variant="ghost" size="icon" onClick={onCopy}><CopyIcon size={20} className="text-accent" /></Button>}
      {onEdit && <Button variant="ghost" size="icon" onClick={onEdit}><PencilIcon size={20} className="text-accent" /></Button>}
      {onDelete && <Button variant="ghost" size="icon" onClick={onDelete}><TrashSimpleIcon size={20} className="text-accent" /></Button>}
      <div className="flex-1" />
    </div>
  );
}
