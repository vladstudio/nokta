import { Button } from '../ui';

interface MessageActionsProps {
  onCancel: () => void;
  onEdit?: () => void;
}

export default function MessageActions({ onCancel, onEdit }: MessageActionsProps) {
  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {onEdit && (
            <Button variant="primary" onClick={onEdit}>
              Edit
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
