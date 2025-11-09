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
    <div className="flex items-center gap-2 w-full">
      {onCopy && (
        <Button variant="primary" onClick={onCopy}>
          {t('common.copy')}
        </Button>
      )}
      {onEdit && (
        <Button variant="primary" onClick={onEdit}>
          {t('common.edit')}
        </Button>
      )}
      {onDelete && (
        <Button variant="primary" onClick={onDelete}>
          {t('common.delete')}
        </Button>
      )}
      <div className="flex-1" />
      <Button variant="default" onClick={onCancel}>
        {t('common.cancel')}
      </Button>
    </div>
  );
}
