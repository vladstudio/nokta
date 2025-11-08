import { Button } from '../ui';

interface MessageActionsProps {
  onCancel: () => void;
}

export default function MessageActions({ onCancel }: MessageActionsProps) {
  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Actions coming soon</span>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
