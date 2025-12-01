import { useTranslation } from 'react-i18next';
import { Button, Popover } from '../ui';
import { ArrowBendUpLeftIcon, ArrowBendUpRightIcon, CopyIcon, DotsThreeIcon, PencilIcon, TrashSimpleIcon, XIcon } from "@phosphor-icons/react";

interface MessageActionsProps {
  onCancel: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onReply?: () => void;
  onForward?: () => void;
  onReact?: (emoji: string) => void;
  userReactions?: string[];
}

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🎉'];
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

export default function MessageActions({ onCancel, onEdit, onDelete, onCopy, onReply, onForward, onReact, userReactions }: MessageActionsProps) {
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
            <Button key={emoji} variant="ghost" size="icon" isSelected={userReactions?.includes(emoji)} onClick={() => onReact(emoji)} className="text-xl center">{emoji}</Button>
          ))}
          <Popover trigger={<Button as="div" variant="ghost" size="icon" className="text-xl center"><DotsThreeIcon weight="bold" size={20} className="text-accent" /></Button>}>
            <div className="grid grid-cols-8 gap-1">
              {MORE_EMOJIS.map(emoji => (
                <Button key={emoji} variant="ghost" size="icon" isSelected={userReactions?.includes(emoji)} onClick={() => onReact(emoji)} className="text-xl center">{emoji}</Button>
              ))}
            </div>
          </Popover>
        </>
      )}
      {onReply && <Button variant="ghost" onClick={onReply}><ArrowBendUpLeftIcon size={20} className="text-accent" /><span className="hidden sm:inline ml-1">{t('messageActions.reply')}</span></Button>}
      {onForward && <Button variant="ghost" onClick={onForward}><ArrowBendUpRightIcon size={20} className="text-accent" /><span className="hidden sm:inline ml-1">{t('messageActions.forward')}</span></Button>}
      {onCopy && <Button variant="ghost" size="icon" onClick={onCopy}><CopyIcon size={20} className="text-accent" /></Button>}
      {onEdit && <Button variant="ghost" size="icon" onClick={onEdit}><PencilIcon size={20} className="text-accent" /></Button>}
      {onDelete && <Button variant="ghost" size="icon" onClick={onDelete}><TrashSimpleIcon size={20} className="text-accent" /></Button>}
      <div className="flex-1" />
    </div>
  );
}
