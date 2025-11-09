import { useCallback, useEffect, useRef, useState } from 'react';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { DailyProvider, useCallFrame, useDailyEvent } from '@daily-co/daily-react';
import { activeCallChatAtom, showCallViewAtom } from '../store/callStore';
import { callsAPI } from '../services/calls';
import { pb } from '../services/pocketbase';
import type { Chat } from '../types';

interface CallViewProps {
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

export default function CallView({ chat }: CallViewProps) {
  const { t } = useTranslation();
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const hasJoinedRef = useRef(false);

  // Check for required data BEFORE calling any hooks
  if (!chat.daily_room_url) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-white">
        <div className="text-center">
          <p className="text-xl mb-2">{t('calls.callRoomNotAvailable')}</p>
          <p className="text-sm text-gray-400">{t('calls.tryStartingCallAgain')}</p>
        </div>
      </div>
    );
  }

  const containerRef = useRef<HTMLDivElement>(null);

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

  // Join the call when component mounts
  useEffect(() => {
    if (!callFrame || hasJoinedRef.current) return;

    let isCancelled = false;

    const joinCall = async () => {
      setIsJoining(true);
      setJoinError(null);

      try {
        await callFrame.join({
          url: chat.daily_room_url,
          showLeaveButton: true,
        });

        if (!isCancelled) {
          hasJoinedRef.current = true;
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

    // Cleanup: leave call when component unmounts
    return () => {
      isCancelled = true;
      if (hasJoinedRef.current && callFrame) {
        callFrame.leave().catch(err => console.error('Error leaving call:', err));
      }
    };
  }, [callFrame, chat.daily_room_url, t]);

  return (
    <DailyProvider callObject={callFrame}>
      <div ref={containerRef} className="relative w-full h-full bg-black">
        {/* Show loading overlay */}
        {isJoining && (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-white z-10">
            <div className="text-center">
              <div className="mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto" />
              </div>
              <p className="text-lg">{t('calls.joiningCall')}</p>
            </div>
          </div>
        )}

        {/* Show error overlay */}
        {joinError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-white z-10">
            <div className="text-center">
              <p className="text-xl mb-2 text-red-400">{t('calls.failedToJoinCall')}</p>
              <p className="text-sm text-gray-400 mb-4">{joinError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200"
              >
                {t('calls.reloadAndTryAgain')}
              </button>
            </div>
          </div>
        )}
      </div>
      <CallContent chat={chat} />
    </DailyProvider>
  );
}
