export interface VideoMetadata {
  duration: number; // seconds
  width: number;
  height: number;
  originalSize: number; // bytes
  compressedSize: number; // bytes
  codec: string;
}

export type VideoQuality = 'lq' | 'md' | 'hq';

export interface VideoQualityPreset {
  label: string;
  bitrate: number; // From mediabunny QUALITY constants
  maxWidth: number;
  estimatedSize: string; // Human-readable estimate
}

export interface VideoCompressionProgress {
  stage: 'loading' | 'compressing' | 'complete' | 'error';
  progress: number; // 0-1
  message: string;
}
