import { useTranslation } from 'react-i18next';
import { Dialog, Button } from '../ui';

interface DeleteMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function DeleteMessageDialog({
  open,
  onOpenChange,
  onConfirm,
}: DeleteMessageDialogProps) {
  const { t } = useTranslation();
  const handleDelete = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('deleteMessageDialog.title')}
      description={t('deleteMessageDialog.description')}
      footer={
        <>
          <Button variant="default" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleDelete}>
            {t('common.delete')}
          </Button>
        </>
      }
    >
      {null}
    </Dialog>
  );
}
