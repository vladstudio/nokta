import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import imageCompression from 'browser-image-compression';
import { Dialog, Button, Slider } from '../ui';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File;
  onComplete: (file: File) => void;
}

const QUALITY_PRESETS = {
  lq: { maxSizeMB: 0.3, maxWidthOrHeight: 800 },
  md: { maxSizeMB: 0.7, maxWidthOrHeight: 1920 },
  hq: { maxSizeMB: 1.5, maxWidthOrHeight: 3840 },
} as const;

export default function ImageCropDialog({ open, onOpenChange, file, onComplete }: ImageCropDialogProps) {
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 100, height: 100, unit: '%' });
  const [quality, setQuality] = useState<keyof typeof QUALITY_PRESETS>('md');
  const [processing, setProcessing] = useState(false);
  const imageUrl = useMemo(() => URL.createObjectURL(file), [file]);

  const handleAdd = async () => {
    const img = imgRef.current;
    if (!img) return;
    setProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const x = (crop.x / 100) * img.naturalWidth;
      const y = (crop.y / 100) * img.naturalHeight;
      const w = (crop.width / 100) * img.naturalWidth;
      const h = (crop.height / 100) * img.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
      const blob = await new Promise<Blob>((res, rej) => canvas.toBlob(b => b ? res(b) : rej(), 'image/jpeg', 0.95));
      const compressed = await imageCompression(new File([blob], file.name, { type: 'image/jpeg' }), {
        ...QUALITY_PRESETS[quality], fileType: 'image/webp', useWebWorker: true,
      });
      onComplete(new File([compressed], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }));
      onOpenChange(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('imageCrop.title')} maxWidth="2xl"
      footer={<Button className="flex-1 center" onClick={handleAdd} disabled={processing}>{processing ? t('common.processing') : t('common.add')}</Button>}>
      <div className="grid gap-4">
        <div className="flex justify-center bg-black/10 p-1 rounded overflow-hidden">
          <ReactCrop crop={crop} onChange={setCrop}>
            <img ref={imgRef} src={imageUrl} className="max-h-[64dvh]! max-w-full" alt="" />
          </ReactCrop>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-light whitespace-nowrap flex-1 text-right">
            <div>{t(`videoCompression.quality`)}:</div>
          </div>
          <div className="w-32">
            <Slider value={['lq', 'md', 'hq'].indexOf(quality)} onValueChange={v => setQuality((['lq', 'md', 'hq'] as const)[v])} min={0} max={2} step={1} showTicks disabled={processing} className="flex-1" /></div>
          <div className="text-sm text-light whitespace-nowrap flex-1">{t(`imageCrop.quality.${quality}`)}</div>
        </div>
      </div>
    </Dialog>
  );
}
