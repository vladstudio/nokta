import { Button } from '../ui';

interface AddActionsProps {
  onCancel: () => void;
  onImageSelect: () => void;
  onFileSelect: () => void;
}

export default function AddActions({ onCancel, onImageSelect, onFileSelect }: AddActionsProps) {
  return (
    <div className="border-t border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant="primary" onClick={onImageSelect}>
            Image
          </Button>
          <Button variant="primary" onClick={onFileSelect}>
            File
          </Button>
        </div>
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
