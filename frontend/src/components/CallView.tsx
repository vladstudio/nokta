import { useCallback, useEffect, useRef, useState } from 'react';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { DailyProvider, useCallFrame, useDailyEvent } from '@daily-co/daily-react';
import { activeCallChatAtom, showCallViewAtom } from '../store/callStore';
import { callsAPI } from '../services/calls';
import { pb } from '../services/pocketbase';
import type { Chat } from '../types';

const supportsPiP = 'documentPictureInPicture' in window;

interface CallViewProps {
  show: boolean;
  chat: Chat;
}

// Inner component that handles call events
function CallContent({ chat }: CallViewProps) {
  const setActiveCallChat = useSetAtom(activeCallChatAtom);
  const setShowCallView = useSetAtom(showCallViewAtom);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const handleLeaveCall = useCallback(async () => {
    const currentUserId = pb.authStore.model?.id;
    if (!currentUserId) return;

    try {
      await callsAPI.leaveCall(chat.id, currentUserId);
    } catch (error) {
      console.error('Failed to leave call:', error);
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setActiveCallChat(null);
        setShowCallView(false);
      }
    }
  }, [chat.id, setActiveCallChat, setShowCallView]);

  useDailyEvent('left-meeting', handleLeaveCall);

  return null;
}

export default function CallView({ show, chat }: CallViewProps) {
  const { t, i18n } = useTranslation();
  const setShowCallView = useSetAtom(showCallViewAtom);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pipWindowRef = useRef<Window | null>(null);

  const callFrame = useCallFrame({
    // @ts-expect-error - Daily types expect MutableRefObject but useRef returns RefObject
    parentElRef: containerRef,
    options: {
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none',
      },
    },
  });

  // Check for required data AFTER calling all hooks (Rules of Hooks)
  if (!chat.daily_room_url) {
    return (
      <div className={show ? 'flex items-center justify-center h-full bg-black text-white' : 'hidden'}>
        <div className="text-center">
          <p className="text-xl mb-2">{t('calls.callRoomNotAvailable')}</p>
          <p className="text-sm text-light">{t('errors.pleaseTryAgain')}</p>
        </div>
      </div>
    );
  }

  // Reset hasJoined when room URL changes
  useEffect(() => {
    setHasJoined(false);
  }, [chat.daily_room_url]);

  // Picture-in-Picture when call is hidden
  useEffect(() => {
    if (!supportsPiP || !hasJoined || !callFrame) return;
    if (show) {
      pipWindowRef.current?.close();
      return;
    }
    const openPiP = async () => {
      try {
        // @ts-expect-error - Document PiP API types not in TS yet
        const pip = await documentPictureInPicture.requestWindow({ width: 320, height: 180 });
        pipWindowRef.current = pip;
        pip.document.body.innerHTML = `<style>*{margin:0;font-family:system-ui}body{background:#000;display:flex;flex-direction:column;height:100vh;cursor:pointer}video{flex:1;width:100%;object-fit:cover}button{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);padding:8px 16px;background:#3b82f6;color:#fff;border:none;border-radius:6px;font-size:12px;opacity:0;transition:opacity .2s}body:hover button{opacity:1}</style><video autoplay playsinline muted></video><button>${t('calls.returnToCall')}</button>`;

        // Get video track: prefer remote participant, fallback to local
        const participants = callFrame.participants();
        const remote = Object.values(participants).find((p: any) => !p.local && p.tracks?.video?.state === 'playable');
        const target = remote || participants.local;
        const track = target?.tracks?.video?.persistentTrack || target?.tracks?.video?.track;

        const video = pip.document.querySelector('video')!;
        if (track) {
          video.srcObject = new MediaStream([track]);
          video.play().catch(() => {});
        } else {
          video.remove();
        }

        pip.document.body.addEventListener('click', () => { setShowCallView(true); pip.close(); });
        pip.addEventListener('pagehide', () => { pipWindowRef.current = null; });
      } catch {}
    };
    openPiP();
    return () => { pipWindowRef.current?.close(); };
  }, [show, hasJoined, callFrame, t, setShowCallView]);

  // Join the call when component mounts or room URL changes
  useEffect(() => {
    if (!callFrame || hasJoined) return;

    let isCancelled = false;

    const joinCall = async () => {
      setIsJoining(true);
      setJoinError(null);

      try {
        await callFrame.join({
          url: chat.daily_room_url,
          showLeaveButton: true,
          lang: i18n.language as 'en' | 'ru',
        });

        if (!isCancelled) {
          setHasJoined(true);
        }
      } catch (error) {
        console.error('Failed to join call:', error);
        if (!isCancelled) {
          setJoinError(error instanceof Error ? error.message : t('calls.failedToJoinCall'));
        }
      } finally {
        if (!isCancelled) {
          setIsJoining(false);
        }
      }
    };

    joinCall();

    // Cleanup: leave call and reset state
    return () => {
      isCancelled = true;
      if (hasJoined && callFrame) {
        callFrame.leave().catch(err => console.error('Error leaving call:', err));
      }
    };
  }, [callFrame, hasJoined, chat.daily_room_url, t, i18n.language]);

  return (
    <DailyProvider callObject={callFrame}>
      <div ref={containerRef} className={show ? 'relative w-full h-full bg-black' : 'hidden'}>
        {/* Show loading overlay */}
        {isJoining && (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-white z-10">
            <div className="text-center">
              <div className="mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
              </div>
              <p className="text-lg">{t('calls.joining')}</p>
            </div>
          </div>
        )}

        {/* Show error overlay */}
        {joinError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-white z-10">
            <div className="text-center">
              <p className="text-xl mb-2 text-(--color-error-500)">{t('calls.failedToJoinCall')}</p>
              <p className="text-sm text-light mb-4">{joinError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-(--color-bg-primary) text-black rounded hover:bg-(--color-bg-active)"
              >
                {t('common.tryAgain')}
              </button>
            </div>
          </div>
        )}
      </div>
      <CallContent show chat={chat} />
    </DailyProvider>
  );
}
