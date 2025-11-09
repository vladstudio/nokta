import { useTranslation } from 'react-i18next';
import { Button } from '../ui';

interface AddActionsProps {
  onCancel: () => void;
  onImageSelect: () => void;
  onFileSelect: () => void;
}

export default function AddActions({ onCancel, onImageSelect, onFileSelect }: AddActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 w-full">
      <Button variant="primary" onClick={onImageSelect}>
        {t('addActions.image')}
      </Button>
      <Button variant="primary" onClick={onFileSelect}>
        {t('addActions.file')}
      </Button>
      <div className="flex-1" />
      <Button variant="default" onClick={onCancel}>
        {t('common.cancel')}
      </Button>
    </div>
  );
}
