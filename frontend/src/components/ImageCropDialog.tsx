import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Cropper from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import { Dialog } from '../ui';
import { Button } from '../ui';
import type { Area } from 'react-easy-crop';

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
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [quality, setQuality] = useState<Quality>('md');
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleAdd = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const croppedBlob = await getCroppedImg(file, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], file.name, { type: croppedBlob.type });
      const compressed = await imageCompression(croppedFile, {
        ...QUALITY_PRESETS[quality],
        fileType: 'image/webp',
        useWebWorker: true,
      });
      onComplete(new File([compressed], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }));
      onOpenChange(false);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('imageCrop.title')}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={processing}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleAdd} disabled={processing}>
            {processing ? t('common.processing') : t('common.add')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="relative w-full h-96 bg-black rounded">
          <Cropper
            image={URL.createObjectURL(file)}
            crop={crop}
            zoom={zoom}
            aspect={undefined}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="flex gap-2">
          {(['lq', 'md', 'hq'] as const).map((q) => (
            <Button
              key={q}
              variant={quality === q ? 'primary' : 'ghost'}
              onClick={() => setQuality(q)}
              disabled={processing}
            >
              {t(`imageCrop.quality.${q}`)}
            </Button>
          ))}
        </div>
      </div>
    </Dialog>
  );
}

async function getCroppedImg(file: File, crop: Area): Promise<Blob> {
  const img = await createImage(URL.createObjectURL(file));
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = crop.width;
  canvas.height = crop.height;
  ctx.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Canvas toBlob failed')), 'image/jpeg', 0.95)
  );
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
