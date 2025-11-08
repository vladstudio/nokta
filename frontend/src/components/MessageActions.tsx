import { useTranslation } from 'react-i18next';
import { Button } from '../ui';

interface MessageActionsProps {
  onCancel: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
}

export default function MessageActions({ onCancel, onEdit, onDelete, onCopy }: MessageActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {onCopy && (
            <Button variant="primary" onClick={onCopy}>
              {t('chatWindow.copied')}
            </Button>
          )}
          {onEdit && (
            <Button variant="primary" onClick={onEdit}>
              {t('common.save')}
            </Button>
          )}
          {onDelete && (
            <Button variant="primary" onClick={onDelete}>
              {t('common.delete')}
            </Button>
          )}
        </div>
        <Button variant="default" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}
