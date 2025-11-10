import { useTranslation } from 'react-i18next';
import { Button, Popover } from '../ui';

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
      {onReact && (
        <>
          {QUICK_EMOJIS.map(emoji => (
            <Button key={emoji} variant="ghost" size="icon" isSelected={userReactions?.includes(emoji)} onClick={() => onReact(emoji)} className="text-xl">{emoji}</Button>
          ))}
          <Popover trigger={<Button variant="ghost" size="icon" className="text-lg">...</Button>}>
            <div className="grid grid-cols-8 gap-1">
              {MORE_EMOJIS.map(emoji => (
                <Button key={emoji} variant="ghost" size="icon" isSelected={userReactions?.includes(emoji)} onClick={() => onReact(emoji)} className="text-xl">{emoji}</Button>
              ))}
            </div>
          </Popover>
        </>
      )}
      {onCopy && <Button variant="primary" onClick={onCopy}>{t('common.copy')}</Button>}
      {onEdit && <Button variant="primary" onClick={onEdit}>{t('common.edit')}</Button>}
      {onDelete && <Button variant="primary" onClick={onDelete}>{t('common.delete')}</Button>}
      <div className="flex-1" />
      <Button variant="default" onClick={onCancel}>{t('common.cancel')}</Button>
    </div>
  );
}
