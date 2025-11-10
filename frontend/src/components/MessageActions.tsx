import { useTranslation } from 'react-i18next';
import { Button, Popover } from '../ui';

interface MessageActionsProps {
  onCancel: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onReact?: (emoji: string) => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉'];
const MORE_EMOJIS = ['🔥', '👏', '💯', '✅', '😍', '🤔', '👀', '💪', '🙏', '⭐', '🚀', '💡'];

export default function MessageActions({ onCancel, onEdit, onDelete, onCopy, onReact }: MessageActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 w-full">
      {onReact && (
        <>
          {QUICK_EMOJIS.map(emoji => (
            <button key={emoji} onClick={() => onReact(emoji)} className="text-xl hover:scale-110 transition-transform">{emoji}</button>
          ))}
          <Popover trigger={<span className="text-lg cursor-pointer hover:scale-110 transition-transform">...</span>}>
            <div className="grid grid-cols-6 gap-1">
              {MORE_EMOJIS.map(emoji => (
                <button key={emoji} onClick={() => onReact(emoji)} className="text-xl hover:scale-110 transition-transform p-1">{emoji}</button>
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
