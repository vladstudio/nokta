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
      title="Delete Message"
      description="Are you sure you want to delete this message? This action cannot be undone."
      footer={
        <>
          <Button variant="default" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDelete}>
            Delete
          </Button>
        </>
      }
    >
      {/* No content needed for confirmation dialog */}
    </Dialog>
  );
}
