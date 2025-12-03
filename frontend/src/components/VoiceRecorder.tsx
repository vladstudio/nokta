import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button, useToastManager } from '../ui';
import { MicrophoneIcon, PauseIcon, PlayIcon, ArrowClockwiseIcon, XIcon, PaperPlaneRightIcon } from '@phosphor-icons/react';
import { Output, BufferTarget, WebMOutputFormat, MediaStreamAudioTrackSource, QUALITY_LOW } from 'mediabunny';

interface VoiceRecorderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (blob: Blob, duration: number) => void;
}

type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

export default function VoiceRecorder({ open, onOpenChange, onSend }: VoiceRecorderProps) {
  const { t } = useTranslation();
  const toastManager = useToastManager();
  const [state, setState] = useState<RecordingState>('idle');
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const outputRef = useRef<Output | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
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
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioTrack = stream.getAudioTracks()[0];
      const output = new Output({
        format: new WebMOutputFormat(),
        target: new BufferTarget(),
      });

      const source = new MediaStreamAudioTrackSource(audioTrack, {
        codec: 'opus',
        bitrate: QUALITY_LOW,
      });

      output.addAudioTrack(source);
      await output.start();

      outputRef.current = output;
      setState('recording');
      startTimeRef.current = Date.now();
      pausedDurationRef.current = 0;

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000));
      }, 100);
    } catch (error) {
      console.error('Mic access denied:', error);
      toastManager.add({ title: t('messages.micAccessDenied'), data: { type: 'error' } });
      onOpenChange(false);
    }
  };

  const pauseRecording = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = false);
      setState('paused');
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = true);
      setState('recording');
      const pauseDuration = Date.now() - (startTimeRef.current + duration * 1000);
      pausedDurationRef.current += pauseDuration;

      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current - pausedDurationRef.current) / 1000));
      }, 100);
    }
  };

  const stopRecording = async () => {
    if (!outputRef.current) return;

    if (timerRef.current) clearInterval(timerRef.current);

    try {
      await outputRef.current.finalize();
      // Safe assertion: we created Output with BufferTarget in startRecording
      const buffer = (outputRef.current.target as BufferTarget).buffer;

      if (!buffer) {
        throw new Error('No audio data recorded');
      }

      const blob = new Blob([buffer], { type: 'audio/webm' });

      setAudioBlob(blob);
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      setState('stopped');
    } catch (error) {
      console.error('Failed to stop recording:', error);
      toastManager.add({ title: t('messages.recordingFailed'), data: { type: 'error' } });
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const rerecord = () => {
    cleanup();
    setDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setState('idle');
    startRecording();
  };

  const handleCancel = () => {
    cleanup();
    setState('idle');
    setDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setIsPlaying(false);
    onOpenChange(false);
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
      handleCancel();
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((error) => {
        console.error('Failed to play audio:', error);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setPlaybackTime(Math.floor(audioRef.current.currentTime));
    }
  };

  const handlePlaybackEnd = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('messages.voiceMessage')}
      maxWidth="sm"
      footer={
        <Button variant="primary" className="flex-1 center" onClick={handleSend} disabled={!audioBlob}>
          <PaperPlaneRightIcon size={20} className="text-accent" />
          {t('common.send')}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center gap-4 py-4">
          <div className="text-4xl font-mono">
            {state === 'stopped' && isPlaying
              ? `${formatDuration(playbackTime)} / ${formatDuration(duration)}`
              : formatDuration(duration)}
          </div>
        </div>

        {state === 'stopped' && audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handlePlaybackEnd}
            className="hidden"
          />
        )}

        <div className="flex justify-center gap-2">
          {(state === 'recording' || state === 'paused') && (
            <>
              <Button
                variant="outline"
                className="flex-1 center"
                onClick={state === 'recording' ? pauseRecording : resumeRecording}
              >
                {state === 'recording' ? <PauseIcon size={20} className="text-accent" /> : <MicrophoneIcon size={20} className="text-accent" />}
                {state === 'recording' ? t('common.pause') : t('common.resume')}
              </Button>
              <Button variant="primary" className="flex-1 center" onClick={stopRecording}>
                {t('common.stop')}
              </Button>
            </>
          )}
          {state === 'stopped' && (
            <>
              <Button variant="outline" className="flex-1 center" onClick={togglePlayback}>
                {isPlaying ? <PauseIcon size={20} className="text-accent" /> : <PlayIcon size={20} className="text-accent" />}
                Play
              </Button>
              <Button variant="outline" className="flex-1 center" onClick={rerecord}>
                <ArrowClockwiseIcon size={20} className="text-accent" />
                Re-record
              </Button>
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
