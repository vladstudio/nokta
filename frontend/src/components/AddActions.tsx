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
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="primary" onClick={onImageSelect}>
            {t('addActions.image')}
          </Button>
          <Button variant="primary" onClick={onFileSelect}>
            {t('addActions.file')}
          </Button>
        </div>
        <Button variant="default" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  );
}
