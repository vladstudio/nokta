import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import imageCompression from 'browser-image-compression';
import { Dialog, Button } from '../ui';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: File;
  onComplete: (file: File) => void;
}

type Quality = 'lq' | 'md' | 'hq';

const QUALITY_PRESETS = {
  lq: { maxSizeMB: 0.3, maxWidthOrHeight: 800 },
  md: { maxSizeMB: 0.7, maxWidthOrHeight: 1920 },
  hq: { maxSizeMB: 1.5, maxWidthOrHeight: 3840 },
};

export default function ImageCropDialog({ open, onOpenChange, file, onComplete }: ImageCropDialogProps) {
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>({ x: 0, y: 0, width: 100, height: 100, unit: '%' });
  const [quality, setQuality] = useState<Quality>('md');
  const [processing, setProcessing] = useState(false);

  const handleAdd = async () => {
    if (!crop || !imgRef.current) return;
    setProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      const pixelCrop: PixelCrop = {
        x: crop.x * scaleX, y: crop.y * scaleY,
        width: crop.width * scaleX, height: crop.height * scaleY, unit: 'px'
      };
      canvas.width = pixelCrop.width;
      canvas.height = pixelCrop.height;
      ctx.drawImage(imgRef.current, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height);
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
      footer={<>
        <Button variant="outline" className="flex-1 center" onClick={() => onOpenChange(false)} disabled={processing}>{t('common.cancel')}</Button>
        <Button className="flex-1 center" onClick={handleAdd} disabled={processing}>{processing ? t('common.processing') : t('common.add')}</Button>
      </>}>
      <div className="space-y-4">
        <div className="flex justify-center bg-black/10 p-1 rounded overflow-hidden">
          <ReactCrop crop={crop} onChange={setCrop}>
            <img ref={imgRef} src={URL.createObjectURL(file)} className="max-h-[50dvh]! max-w-full" alt="" />
          </ReactCrop>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-light">{t('videoCompression.quality')}:</div>
          <div className="flex gap-2">
            {(['lq', 'md', 'hq'] as const).map(q => (
              <Button key={q} variant="outline" className="flex-1 center" isSelected={quality === q} onClick={() => setQuality(q)} disabled={processing}>
                {t(`imageCrop.quality.${q}`)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
