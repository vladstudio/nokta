import { useState, useCallback, useRef } from 'react';
import {
  Input,
  Output,
  Conversion,
  ALL_FORMATS,
  BlobSource,
  BufferTarget,
  Mp4OutputFormat,
  QUALITY_LOW,
  QUALITY_MEDIUM,
  QUALITY_HIGH,
} from 'mediabunny';
import type { VideoMetadata, VideoQuality } from '../types/video';

const QUALITY_MAP = {
  lq: QUALITY_LOW,
  md: QUALITY_MEDIUM,
  hq: QUALITY_HIGH,
};

interface UseVideoCompressionResult {
  compress: (
    file: File,
    quality: VideoQuality,
    onProgress?: (progress: number) => void
  ) => Promise<{ compressedFile: File; metadata: VideoMetadata }>;
  cancel: () => void;
  isCompressing: boolean;
  error: Error | null;
}

export function useVideoCompression(): UseVideoCompressionResult {
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const conversionRef = useRef<Conversion | null>(null);

  const compress = useCallback(async (
    file: File,
    quality: VideoQuality,
    onProgress?: (progress: number) => void
  ) => {
    setIsCompressing(true);
    setError(null);

    try {
      // 1. Create input from file
      const input = new Input({
        formats: ALL_FORMATS,
        source: new BlobSource(file),
      });

      // 2. Get video metadata
      const duration = await input.computeDuration();
      const videoTrack = await input.getPrimaryVideoTrack();

      if (!videoTrack) {
        throw new Error('No video track found');
      }

      const originalWidth = videoTrack.displayWidth;
      const originalHeight = videoTrack.displayHeight;

      // 3. Create output
      const output = new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget(),
      });

      // 4. Configure conversion
      const conversion = await Conversion.init({
        input,
        output,
        video: {
          codec: 'avc', // H.264
          bitrate: QUALITY_MAP[quality],
          width: Math.min(originalWidth, quality === 'lq' ? 854 : quality === 'md' ? 1280 : 1920),
          fit: 'contain',
        },
        audio: {
          codec: 'aac',
          bitrate: QUALITY_MEDIUM,
          numberOfChannels: 2,
          sampleRate: 48000,
        },
      });

      conversionRef.current = conversion;

      if (!conversion.isValid) {
        throw new Error('Video format not supported');
      }

      // 5. Track progress
      conversion.onProgress = (progress: number) => {
        onProgress?.(progress);
      };

      // 6. Execute compression
      await conversion.execute();

      // 7. Create compressed file
      const compressedBuffer = output.target.buffer;
      const compressedBlob = new Blob([compressedBuffer], { type: 'video/mp4' });
      const compressedFile = new File(
        [compressedBlob],
        file.name.replace(/\.[^.]+$/, '.mp4'),
        { type: 'video/mp4' }
      );

      // 8. Return result
      const metadata: VideoMetadata = {
        duration,
        width: originalWidth,
        height: originalHeight,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        codec: 'avc',
      };

      setIsCompressing(false);
      return { compressedFile, metadata };

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Compression failed');
      setError(error);
      setIsCompressing(false);
      throw error;
    }
  }, []);

  const cancel = useCallback(() => {
    if (conversionRef.current) {
      conversionRef.current.cancel();
      conversionRef.current = null;
      setIsCompressing(false);
    }
  }, []);

  return { compress, cancel, isCompressing, error };
}
