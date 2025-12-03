import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Button, Slider } from '../ui';
import { useVideoCompression } from '../hooks/useVideoCompression';
import { formatFileSize, formatDuration } from '../utils/videoUtils';
import type { VideoMetadata, VideoQuality } from '../types/video';

interface VideoCompressionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File;
  onComplete: (file: File, metadata: VideoMetadata) => void;
}

const QUALITIES: VideoQuality[] = ['vlq', 'lq', 'md', 'hq', 'vhq'];
const QUALITY_MULTIPLIERS = { vlq: 0.05, lq: 0.1, md: 0.3, hq: 0.6, vhq: 0.85 };

export default function VideoCompressionDialog({
  open,
  onOpenChange,
  file,
  onComplete,
}: VideoCompressionDialogProps) {
  const { t } = useTranslation();
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [metadata, setMetadata] = useState<{ duration: number; size: number } | null>(null);
  const [quality, setQuality] = useState<VideoQuality>('md');
  const [progress, setProgress] = useState(0);
  const { compress, cancel, isCompressing, error } = useVideoCompression();

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      // Load video metadata
      const video = document.createElement('video');
      video.src = url;
      video.onloadedmetadata = () => {
        setMetadata({
          duration: video.duration,
          size: file.size,
        });
      };

      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [file]);

  const handleAdd = async () => {
    try {
      const result = await compress(file, quality, (p) => {
        setProgress(Math.round(p * 100));
      });
      onComplete(result.compressedFile, result.metadata);
      onOpenChange(false);
    } catch (err) {
      console.error('Video compression failed:', err);
    }
  };

  const getEstimatedSize = (q: VideoQuality) => {
    if (!metadata) return '...';
    const bytes = metadata.size * QUALITY_MULTIPLIERS[q];
    if (bytes < 1024) return `~${Math.round(bytes)} B`;
    if (bytes < 1024 * 1024) return `~${Math.round(bytes / 1024)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `~${Math.round(bytes / (1024 * 1024))} MB`;
    return `~${Math.round(bytes / (1024 * 1024 * 1024))} GB`;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('videoCompression.title')}
      maxWidth="4xl"
      footer={
        <Button className="flex-1 center" onClick={handleAdd} disabled={isCompressing || !metadata}>
          {isCompressing ? <>{t('videoCompression.compressing')}... <span className="font-mono">{progress}%</span></> : t('common.add')}
        </Button>
      }
    >
      <div className="grid gap-4">
        {/* Video Preview */}
        <div className="relative w-full bg-black rounded overflow-hidden">
          <video
            src={videoUrl}
            controls
            className="w-full max-h-96"
            preload="metadata"
          >
            Your browser does not support video playback.
          </video>
        </div>

        {/* Quality Selection */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-light whitespace-nowrap flex-1 text-right">
            <div>{t(`videoCompression.quality`)}:</div>
          </div>
          <div className="w-32">
            <Slider value={QUALITIES.indexOf(quality)} onValueChange={v => setQuality(QUALITIES[v])} min={0} max={4} step={1} showTicks disabled={isCompressing} />
          </div>
          <div className="text-sm text-light whitespace-nowrap flex-1">
            {t(`videoCompression.quality${quality.toUpperCase()}`)} ({getEstimatedSize(quality)})
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-sm p-2 rounded text-(--color-error-500) bg-(--color-error-50)">
            {t('videoCompression.compressionFailed')}: {error.message}
          </div>
        )}
      </div>
    </Dialog>
  );
}
