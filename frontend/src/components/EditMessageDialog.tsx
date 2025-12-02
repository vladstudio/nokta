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

  const handleSave = (e?: React.FormEvent) => {
    e?.preventDefault();
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
      footer={
        <>
          <Button variant="outline" className="flex-1 center" onClick={handleCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" className="flex-1 center" type="submit" form="edit-message-form" disabled={!content.trim()}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <form id="edit-message-form" onSubmit={handleSave}>
        <Input
          as="textarea"
          autoHeight
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('messageInput.placeholder')}
          autoFocus
          className="max-h-[70dvh]"
        />
      </form>
    </Dialog>
  );
}
