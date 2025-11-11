import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { FileIcon, ImageIcon, VideoIcon, XIcon } from "@phosphor-icons/react";

interface AddActionsProps {
  onCancel: () => void;
  onImageSelect: () => void;
  onVideoSelect: () => void;
  onFileSelect: () => void;
}

export default function AddActions({ onCancel, onImageSelect, onVideoSelect, onFileSelect }: AddActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 w-full">
      <Button variant="ghost" size="icon" onClick={onCancel}>
        <XIcon size={20} className="text-accent" />
      </Button>
      <div className="bg-(--color-border-default) w-px h-6" />
      <Button variant="ghost" onClick={onImageSelect}>
        <ImageIcon size={20} className="text-accent" />
        {t('addActions.image')}
      </Button>
      <Button variant="ghost" onClick={onVideoSelect}>
        <VideoIcon size={20} className="text-accent" />
        {t('addActions.video')}
      </Button>
      <Button variant="ghost" onClick={onFileSelect}>
        <FileIcon size={20} className="text-accent" />
        {t('addActions.file')}
      </Button>
      <div className="flex-1" />
    </div>
  );
}
