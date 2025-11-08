import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Button, Input } from '../ui';

interface EditMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent: string;
  onSave: (newContent: string) => void;
}

export default function EditMessageDialog({
  open,
  onOpenChange,
  initialContent,
  onSave,
}: EditMessageDialogProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState(initialContent);

  // Reset content when dialog opens with new message
  useEffect(() => {
    if (open) {
      setContent(initialContent);
    }
  }, [open, initialContent]);

  const handleSave = () => {
    const trimmed = content.trim();
    if (trimmed && trimmed !== initialContent) {
      onSave(trimmed);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('editMessageDialog.title')}
      description={t('editMessageDialog.description')}
      footer={
        <>
          <Button variant="default" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!content.trim()}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <Input
        as="textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder={t('messageInput.placeholder')}
        autoFocus
      />
    </Dialog>
  );
}
