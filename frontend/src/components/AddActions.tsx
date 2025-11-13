import { useTranslation } from 'react-i18next';
import { Button } from '../ui';
import { FileIcon, ImageIcon, VideoIcon, XIcon, MicrophoneIcon } from "@phosphor-icons/react";

interface AddActionsProps {
  onCancel: () => void;
  onImageSelect: () => void;
  onVideoSelect: () => void;
  onFileSelect: () => void;
  onVoiceSelect: () => void;
}

export default function AddActions({ onCancel, onImageSelect, onVideoSelect, onFileSelect, onVoiceSelect }: AddActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-1 w-full">
      <Button variant="ghost" size="icon" onClick={onCancel}>
        <XIcon size={20} className="text-accent" />
      </Button>
      <div className="bg-(--color-border-default) w-px h-6" />
      <Button variant="ghost" onClick={onImageSelect}>
        <ImageIcon size={20} className="text-accent" />
        <span className="hidden lg:flex">{t('addActions.image')}</span>
      </Button>
      <Button variant="ghost" onClick={onVideoSelect}>
        <VideoIcon size={20} className="text-accent" />
        <span className="hidden lg:flex">{t('addActions.video')}</span>
      </Button>
      <Button variant="ghost" onClick={onVoiceSelect}>
        <MicrophoneIcon size={20} className="text-accent" />
        <span className="hidden lg:flex">{t('addActions.voice')}</span>
      </Button>
      <Button variant="ghost" onClick={onFileSelect}>
        <FileIcon size={20} className="text-accent" />
        <span className="hidden lg:flex">{t('addActions.file')}</span>
      </Button>
      <div className="flex-1" />
    </div>
  );
}
