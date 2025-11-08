import { useState, useEffect } from 'react';
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
      title="Edit Message"
      description="Make changes to your message"
      footer={
        <>
          <Button variant="default" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!content.trim()}>
            Save
          </Button>
        </>
      }
    >
      <Input
        as="textarea"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder="Enter your message..."
        autoFocus
      />
    </Dialog>
  );
}
