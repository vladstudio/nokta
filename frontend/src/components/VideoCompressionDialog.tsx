import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Button } from '../ui';
import { useVideoCompression } from '../hooks/useVideoCompression';
import { formatFileSize, formatDuration } from '../utils/videoUtils';
import type { VideoMetadata, VideoQuality } from '../types/video';

interface VideoCompressionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File;
  onComplete: (file: File, metadata: VideoMetadata) => void;
}

const QUALITY_ESTIMATES = {
  lq: { label: 'Low', multiplier: 0.1 }, // ~10% of original
  md: { label: 'Medium', multiplier: 0.3 }, // ~30% of original
  hq: { label: 'High', multiplier: 0.6 }, // ~60% of original
};

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

  const handleCancel = () => {
    if (isCompressing) {
      cancel();
    }
    onOpenChange(false);
  };

  const getEstimatedSize = (q: VideoQuality) => {
    if (!metadata) return '...';
    const estimated = metadata.size * QUALITY_ESTIMATES[q].multiplier;
    return formatFileSize(estimated);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('videoCompression.title')}
      footer={
        <>
          <Button variant="ghost" onClick={handleCancel} disabled={isCompressing}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleAdd} disabled={isCompressing || !metadata}>
            {isCompressing ? `${t('videoCompression.compressing')}... ${progress}%` : t('common.add')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
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

        {/* Original File Info */}
        {metadata && (
          <div className="text-sm text-(--color-text-secondary)">
            {t('videoCompression.original')}: {formatFileSize(metadata.size)} • {formatDuration(metadata.duration)}
          </div>
        )}

        {/* Quality Selection */}
        <div className="space-y-2">
          <div className="text-sm font-medium">{t('videoCompression.quality')}:</div>
          <div className="flex gap-2">
            {(['lq', 'md', 'hq'] as const).map((q) => (
              <Button
                key={q}
                variant={quality === q ? 'primary' : 'ghost'}
                onClick={() => setQuality(q)}
                disabled={isCompressing}
                className="flex-1"
              >
                <div className="flex flex-col items-center">
                  <span>{t(`videoCompression.quality${q.toUpperCase()}`)}</span>
                  <span className="text-xs opacity-75">
                    {getEstimatedSize(q)} {t('videoCompression.estimatedSize')}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        {isCompressing && (
          <div className="w-full bg-(--color-bg-secondary) rounded-full h-2 overflow-hidden">
            <div
              className="bg-(--color-accent) h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-sm text-red-500 p-2 bg-red-50 rounded">
            {t('videoCompression.compressionFailed')}: {error.message}
          </div>
        )}
      </div>
    </Dialog>
  );
}
