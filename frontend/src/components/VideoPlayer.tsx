import { useRef, useState, useEffect } from 'react';

interface VideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  caption?: string;
  className?: string;
  onError?: () => void;
}

export default function VideoPlayer({
  videoUrl,
  posterUrl,
  caption,
  className,
  onError
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [, setIsFullscreen] = useState(false);

  const handleDoubleClick = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className={className}>
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        controls
        onDoubleClick={handleDoubleClick}
        onError={onError}
        className="max-w-sm rounded cursor-pointer"
        preload="metadata"
      >
        Your browser does not support video playback.
      </video>
      {caption && <p className="text-sm mt-1">{caption}</p>}
    </div>
  );
}
