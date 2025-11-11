/**
 * Browser support check for WebCodecs API
 */
export function isVideoMessagingSupported(): boolean {
  return (
    'VideoEncoder' in window &&
    'VideoDecoder' in window &&
    'AudioEncoder' in window &&
    'AudioDecoder' in window
  );
}

/**
 * Get user-friendly error message for unsupported browsers
 */
export function getUnsupportedBrowserMessage(): string {
  const browser = navigator.userAgent;

  if (browser.includes('Chrome') && !browser.includes('Edg')) {
    return 'Please update Chrome to version 94 or higher';
  }
  if (browser.includes('Safari')) {
    return 'Please update Safari to version 16.4 or higher';
  }
  if (browser.includes('Firefox')) {
    return 'Please update Firefox to version 130 or higher';
  }

  return 'Your browser does not support video messaging. Please use a modern browser.';
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Format video duration (seconds) to MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Generate a thumbnail from a video file
 * @param file - Video file to generate thumbnail from
 * @returns Promise<Blob> - JPEG thumbnail blob
 */
export async function generateVideoThumbnail(file: File): Promise<Blob> {
  const video = document.createElement('video');
  video.src = URL.createObjectURL(file);
  video.muted = true;

  await new Promise((resolve) => {
    video.onloadeddata = resolve;
  });

  // Seek to 1 second or 10% of duration (whichever is smaller)
  const seekTime = Math.min(1, video.duration * 0.1);
  video.currentTime = seekTime;

  await new Promise((resolve) => {
    video.onseeked = resolve;
  });

  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = (video.videoHeight / video.videoWidth) * 320;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  URL.revokeObjectURL(video.src);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate thumbnail'));
    }, 'image/jpeg', 0.8);
  });
}
