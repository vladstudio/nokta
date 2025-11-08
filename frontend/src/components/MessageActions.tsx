import { Button } from '../ui';

interface MessageActionsProps {
  onCancel: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy: () => void;
}

export default function MessageActions({ onCancel, onEdit, onDelete, onCopy }: MessageActionsProps) {
  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="primary" onClick={onCopy}>
            Copy
          </Button>
          {onEdit && (
            <Button variant="primary" onClick={onEdit}>
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="primary" onClick={onDelete}>
              Delete
            </Button>
          )}
        </div>
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
