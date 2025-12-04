import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ReactCrop, { type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import imageCompression from 'browser-image-compression';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { Dialog, Button, Slider } from '../ui';

interface ImageCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  files: File[];
  onComplete: (files: File[]) => void;
}

const QUALITY_PRESETS = {
  lq: { maxSizeMB: 0.3, maxWidthOrHeight: 800 },
  md: { maxSizeMB: 0.7, maxWidthOrHeight: 1920 },
  hq: { maxSizeMB: 1.5, maxWidthOrHeight: 3840 },
} as const;

export default function ImageCropDialog({ open, onOpenChange, files, onComplete }: ImageCropDialogProps) {
  const { t } = useTranslation();
  const imgRef = useRef<HTMLImageElement>(null);
  const [index, setIndex] = useState(0);
  const [crops, setCrops] = useState<Crop[]>(() => files.map(() => ({ x: 0, y: 0, width: 100, height: 100, unit: '%' as const })));
  const [qualities, setQualities] = useState<(keyof typeof QUALITY_PRESETS)[]>(() => files.map(() => 'md'));
  const [processing, setProcessing] = useState(false);
  const file = files[index];
  const crop = crops[index];
  const quality = qualities[index];
  const imageUrl = useMemo(() => URL.createObjectURL(file), [file]);

  const setCrop = (c: Crop) => setCrops(prev => prev.map((p, i) => i === index ? c : p));
  const setQuality = (q: keyof typeof QUALITY_PRESETS) => setQualities(prev => prev.map((p, i) => i === index ? q : p));

  const processFile = async (f: File, c: Crop, q: keyof typeof QUALITY_PRESETS): Promise<File> => {
    const img = await new Promise<HTMLImageElement>((res) => {
      const el = new Image();
      el.onload = () => res(el);
      el.src = URL.createObjectURL(f);
    });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const scale = img.naturalWidth / (imgRef.current?.width || img.naturalWidth);
    const pct = c.unit === '%';
    const x = pct ? (c.x / 100) * img.naturalWidth : c.x * scale;
    const y = pct ? (c.y / 100) * img.naturalHeight : c.y * scale;
    const w = pct ? (c.width / 100) * img.naturalWidth : c.width * scale;
    const h = pct ? (c.height / 100) * img.naturalHeight : c.height * scale;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, x, y, w, h, 0, 0, w, h);
    URL.revokeObjectURL(img.src);
    const blob = await new Promise<Blob>((res, rej) => canvas.toBlob(b => b ? res(b) : rej(), 'image/jpeg', 0.95));
    const compressed = await imageCompression(new File([blob], f.name, { type: 'image/jpeg' }), {
      ...QUALITY_PRESETS[q], fileType: 'image/webp', useWebWorker: true,
    });
    return new File([compressed], f.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
  };

  const handleAdd = async () => {
    setProcessing(true);
    try {
      const results = await Promise.all(files.map((f, i) => processFile(f, crops[i], qualities[i])));
      onComplete(results);
      onOpenChange(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={files.length > 1 ? `${t('imageCrop.title')} (${index + 1}/${files.length})` : t('imageCrop.title')} maxWidth="2xl"
      footer={<Button className="flex-1 center" onClick={handleAdd} disabled={processing}>{processing ? t('common.processing') : t('common.send')}</Button>}>
      <div className="grid gap-4">
        <div className="flex justify-center bg-black/10 p-1 rounded overflow-hidden relative">
          <ReactCrop crop={crop} onChange={setCrop}>
            <img ref={imgRef} src={imageUrl} className="max-h-[64dvh]! max-w-full" alt="" />
          </ReactCrop>
          {files.length > 1 && (
            <>
              <Button variant="outline" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-(--color-bg-elevated)/80" onClick={() => setIndex(i => i - 1)} disabled={index === 0 || processing}>
                <CaretLeftIcon size={20} />
              </Button>
              <Button variant="outline" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-(--color-bg-elevated)/80" onClick={() => setIndex(i => i + 1)} disabled={index === files.length - 1 || processing}>
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
            <Slider value={['lq', 'md', 'hq'].indexOf(quality)} onValueChange={v => setQuality((['lq', 'md', 'hq'] as const)[v])} min={0} max={2} step={1} showTicks disabled={processing} className="flex-1" /></div>
          <div className="text-sm text-light whitespace-nowrap flex-1">{t(`imageCrop.quality.${quality}`)}</div>
        </div>
      </div>
    </Dialog>
  );
}
