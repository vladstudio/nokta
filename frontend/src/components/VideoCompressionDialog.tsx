import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { Dialog, Button, Slider } from '../ui';
import { useVideoCompression } from '../hooks/useVideoCompression';
import type { VideoMetadata, VideoQuality } from '../types/video';

interface VideoCompressionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: File[];
  onComplete: (files: File[], metadatas: VideoMetadata[]) => void;
}

const QUALITIES: VideoQuality[] = ['vlq', 'lq', 'md', 'hq', 'vhq'];
const QUALITY_MULTIPLIERS = { vlq: 0.05, lq: 0.1, md: 0.3, hq: 0.6, vhq: 0.85 };

export default function VideoCompressionDialog({
  open,
  onOpenChange,
  files,
  onComplete,
}: VideoCompressionDialogProps) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [metadatas, setMetadatas] = useState<({ duration: number; size: number } | null)[]>([]);
  const [qualities, setQualities] = useState<VideoQuality[]>(() => files.map(() => 'md'));
  const [progress, setProgress] = useState(0);
  const [processingIndex, setProcessingIndex] = useState(-1);
  const { compress, cancel, isCompressing, error } = useVideoCompression();

  const file = files[index];
  const videoUrl = videoUrls[index] || '';
  const metadata = metadatas[index] || null;
  const quality = qualities[index];
  const setQuality = (q: VideoQuality) => setQualities(prev => prev.map((p, i) => i === index ? q : p));

  useEffect(() => {
    const urls = files.map(f => URL.createObjectURL(f));
    setVideoUrls(urls);
    setMetadatas(files.map(() => null));

    files.forEach((f, i) => {
      const video = document.createElement('video');
      video.src = urls[i];
      video.onloadedmetadata = () => {
        setMetadatas(prev => prev.map((p, j) => j === i ? { duration: video.duration, size: f.size } : p));
      };
    });

    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [files]);

  const handleAdd = async () => {
    const results: File[] = [];
    const resultMetadatas: VideoMetadata[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        setProcessingIndex(i);
        setProgress(0);
        const result = await compress(files[i], qualities[i], (p) => setProgress(Math.round(p * 100)));
        results.push(result.compressedFile);
        resultMetadatas.push(result.metadata);
      }
      onComplete(results, resultMetadatas);
      onOpenChange(false);
    } catch (err) {
      console.error('Video compression failed:', err);
    } finally {
      setProcessingIndex(-1);
    }
  };

  const getEstimatedSize = (q: VideoQuality, meta: { size: number } | null) => {
    if (!meta) return '...';
    const bytes = meta.size * QUALITY_MULTIPLIERS[q];
    if (bytes < 1024) return `~${Math.round(bytes)} B`;
    if (bytes < 1024 * 1024) return `~${Math.round(bytes / 1024)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `~${Math.round(bytes / (1024 * 1024))} MB`;
    return `~${Math.round(bytes / (1024 * 1024 * 1024))} GB`;
  };

  const isProcessing = processingIndex >= 0;
  const allMetadatasLoaded = metadatas.every(m => m !== null);

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={files.length > 1 ? `${t('videoCompression.title')} (${index + 1}/${files.length})` : t('videoCompression.title')}
      maxWidth="4xl"
      footer={
        <Button className="flex-1 center" onClick={handleAdd} disabled={isProcessing || !allMetadatasLoaded}>
          {isProcessing ? <>{t('videoCompression.compressing')} ({processingIndex + 1}/{files.length})... <span className="font-mono">{progress}%</span></> : t('common.add')}
        </Button>
      }
    >
      <div className="grid gap-4">
        <div className="relative w-full bg-black rounded overflow-hidden">
          <video src={videoUrl} controls className="w-full max-h-[64dvh]!" preload="metadata" />
          {files.length > 1 && (
            <>
              <Button variant="outline" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-(--color-bg-elevated)/80" onClick={() => setIndex(i => i - 1)} disabled={index === 0 || isProcessing}>
                <CaretLeftIcon size={20} />
              </Button>
              <Button variant="outline" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-(--color-bg-elevated)/80" onClick={() => setIndex(i => i + 1)} disabled={index === files.length - 1 || isProcessing}>
                <CaretRightIcon size={20} />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-light whitespace-nowrap flex-1 text-right">
            <div>{t(`videoCompression.quality`)}:</div>
          </div>
          <div className="w-32">
            <Slider value={QUALITIES.indexOf(quality)} onValueChange={v => setQuality(QUALITIES[v])} min={0} max={4} step={1} showTicks disabled={isProcessing} />
          </div>
          <div className="text-sm text-light whitespace-nowrap flex-1">
            {t(`videoCompression.quality${quality.toUpperCase()}`)} ({getEstimatedSize(quality, metadata)})
          </div>
        </div>

        {error && (
          <div className="text-sm p-2 rounded text-(--color-error-500) bg-(--color-error-50)">
            {t('videoCompression.compressionFailed')}: {error.message}
          </div>
        )}
      </div>
    </Dialog>
  );
}
