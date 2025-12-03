import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button, useToastManager } from '../ui';
import { XIcon, PaperPlaneRightIcon, ArrowClockwiseIcon } from '@phosphor-icons/react';
import { Output, BufferTarget, Mp4OutputFormat, MediaStreamAudioTrackSource, MediaStreamVideoTrackSource, QUALITY_VERY_LOW, QUALITY_LOW, QUALITY_MEDIUM, QUALITY_HIGH, QUALITY_VERY_HIGH } from 'mediabunny';
import type { VideoQuality } from '../types/video';

interface QuickVideoRecorderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (blob: Blob, duration: number, quality: VideoQuality) => void;
}

type RecordingState = 'idle' | 'recording' | 'stopped' | 'processing';

const QUALITY_MAP = {
  vlq: QUALITY_VERY_LOW,
  lq: QUALITY_LOW,
  md: QUALITY_MEDIUM,
  hq: QUALITY_HIGH,
  vhq: QUALITY_VERY_HIGH,
};

export default function QuickVideoRecorder({ open, onOpenChange, onSend }: QuickVideoRecorderProps) {
  const { t } = useTranslation();
  const toastManager = useToastManager();
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality>('md');

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const outputRef = useRef<Output | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open && state === 'idle') {
      startRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
      videoPreviewRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true
      });
      streamRef.current = stream;

      // Show live preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      const output = new Output({
        format: new Mp4OutputFormat(),
        target: new BufferTarget(),
      });

      const videoSource = new MediaStreamVideoTrackSource(videoTrack, {
        codec: 'avc',
        bitrate: QUALITY_MAP[selectedQuality],
      });

      const audioSource = new MediaStreamAudioTrackSource(audioTrack, {
        codec: 'aac',
        bitrate: QUALITY_MEDIUM,
      });

      output.addVideoTrack(videoSource);
      output.addAudioTrack(audioSource);
      await output.start();

      outputRef.current = output;
      setState('recording');
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
    } catch (error) {
      console.error('Camera/mic access denied:', error);
      toastManager.add({
        title: t('messages.cameraAccessDenied'),
        data: { type: 'error' }
      });
      onOpenChange(false);
    }
  };

  const stopRecording = async () => {
    if (!outputRef.current) return;

    setState('processing');
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await outputRef.current.finalize();
      const buffer = (outputRef.current.target as BufferTarget).buffer;

      if (!buffer) {
        throw new Error('No video data recorded');
      }

      const blob = new Blob([buffer], { type: 'video/mp4' });

      setVideoBlob(blob);
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setState('stopped');

      // Switch from live preview to recorded video
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = null;
        videoPreviewRef.current.src = url;
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      toastManager.add({
        title: t('messages.recordingFailed'),
        data: { type: 'error' }
      });
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const rerecord = () => {
    cleanup();
    setDuration(0);
    setVideoBlob(null);
    setVideoUrl(null);
    setState('idle');
    startRecording();
  };

  const handleCancel = () => {
    cleanup();
    setState('idle');
    setDuration(0);
    setVideoBlob(null);
    setVideoUrl(null);
    onOpenChange(false);
  };

  const handleSend = () => {
    if (videoBlob) {
      onSend(videoBlob, duration, selectedQuality);
      handleCancel();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const qualityOptions: { value: VideoQuality; label: string }[] = [
    { value: 'vlq', label: t('videoQuality.veryLow') },
    { value: 'lq', label: t('videoQuality.low') },
    { value: 'md', label: t('videoQuality.medium') },
    { value: 'hq', label: t('videoQuality.high') },
    { value: 'vhq', label: t('videoQuality.veryHigh') },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('messages.quickVideoMessage')}
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" className="flex-1 center" onClick={handleCancel}>
            <XIcon size={20} />
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            className="flex-1 center"
            onClick={handleSend}
            disabled={!videoBlob || state === 'processing'}
          >
            <PaperPlaneRightIcon size={20} />
            {t('common.send')}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Video Preview */}
        <div className="relative aspect-video bg-(--color-bg-hover) rounded-lg overflow-hidden">
          <video
            ref={videoPreviewRef}
            autoPlay
            playsInline
            muted={state === 'recording'}
            controls={state === 'stopped'}
            className="w-full h-full object-contain"
          />
          {state === 'recording' && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-medium">REC</span>
            </div>
          )}
        </div>

        {/* Duration Display */}
        <div className="flex items-center justify-center">
          <div className="text-2xl font-mono">
            {formatDuration(duration)}
          </div>
        </div>

        {/* Quality Selector (only shown when stopped) */}
        {state === 'stopped' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              {t('videoQuality.title')}
            </label>
            <div className="flex flex-wrap gap-2">
              {qualityOptions.map(option => (
                <Button
                  key={option.value}
                  variant="outline"
                  isSelected={selectedQuality === option.value}
                  onClick={() => setSelectedQuality(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex justify-center gap-2">
          {state === 'recording' && (
            <Button variant="primary" className="flex-1 center" onClick={stopRecording}>
              {t('common.stop')}
            </Button>
          )}
          {state === 'stopped' && (
            <Button variant="outline" className="flex-1 center" onClick={rerecord}>
              <ArrowClockwiseIcon size={20} />
              {t('common.rerecord')}
            </Button>
          )}
          {state === 'processing' && (
            <div className="flex-1 text-center text-sm text-light">
              {t('common.processing')}...
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
