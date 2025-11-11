import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { auth, spaces, chats } from '../services/pocketbase';
import { callsAPI } from '../services/calls';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useFavicon } from '../hooks/useFavicon';
import { showCallNotification } from '../utils/notifications';
import { isVideoCallsEnabled } from '../config/features';
import { ScrollArea, useToastManager, Button, Menu } from '../ui';
import ChatList from './ChatList';
import CreateGroupChatDialog from './CreateGroupChatDialog';
import { activeCallChatAtom, showCallViewAtom } from '../store/callStore';
import type { Space, Chat, PocketBaseEvent } from '../types';
import { PhoneIcon, PlusIcon } from "@phosphor-icons/react";

const LAST_SPACE_KEY = 'talk:lastSpaceId';

export default function Sidebar() {
  const { t } = useTranslation();
  const toastManager = useToastManager();
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/spaces/:spaceId/chat/:chatId?');
  const spaceId = params?.spaceId;
  const chatId = params?.chatId;

  const [spaceList, setSpaceList] = useState<Space[]>([]);
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [activeCalls, setActiveCalls] = useState<Chat[]>([]);
  const [joiningCalls, setJoiningCalls] = useState<Set<string>>(new Set());
  const [activeCallChat, setActiveCallChat] = useAtom(activeCallChatAtom);
  const [, setShowCallView] = useAtom(showCallViewAtom);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const loadSpaces = useCallback(() => {
    spaces.list().then(setSpaceList).catch(() => setSpaceList([]));
  }, []);

  const loadChats = useCallback(async () => {
    if (!spaceId) return;
    try {
      const data = await chats.list(spaceId);
      setChatList(data);
    } catch {
      setChatList([]);
    }
  }, [spaceId]);

  const loadActiveCalls = useCallback(async () => {
    if (!spaceId) return;
    try {
      const calls = await callsAPI.getActiveCallsInSpace(spaceId);
      setActiveCalls(calls);
    } catch (error) {
      console.error('[Sidebar] loadActiveCalls error:', error);
      setActiveCalls([]);
    }
  }, [spaceId]);

  useEffect(() => { loadSpaces(); }, [loadSpaces]);
  useEffect(() => { loadChats(); }, [loadChats]);
  useEffect(() => { if (isVideoCallsEnabled) loadActiveCalls(); }, [loadActiveCalls]);

  useEffect(() => {
    if (!spaceId) return;
    const unsubscribe = chats.subscribe(async (data: PocketBaseEvent<Chat>) => {
      if (data.action === 'update' && data.record.space === spaceId) {
        const fullChat = await chats.getOne(data.record.id);
        setChatList(prev => prev
          .map(c => c.id === data.record.id ? fullChat : c)
          .sort((a, b) => (b.last_message_at || '').localeCompare(a.last_message_at || ''))
        );
      }
    });
    return () => { unsubscribe.then(fn => fn?.()); };
  }, [spaceId]);

  const currentSpace = useMemo(() =>
    spaceList.find(s => s.id === spaceId),
    [spaceList, spaceId]
  );

  const { unreadCounts } = useUnreadMessages(spaceId, chatList, chatId);

  const hasUnread = useMemo(() => {
    return Array.from(unreadCounts.values()).some(count => count > 0);
  }, [unreadCounts]);

  useFavicon(hasUnread);

  const getCallChatName = useCallback((chat: Chat) => {
    // Use explicit name if provided
    if (chat.name) {
      return chat.name;
    }

    // Fallback: show other participants' names
    if (chat.expand?.participants) {
      const otherParticipants = chat.expand.participants.filter(
        (p) => p.id !== auth.user?.id
      );
      if (otherParticipants.length > 0) {
        return otherParticipants.map((p) => p.name || p.email).join(', ');
      }
    }

    // Default fallback
    return chat.participants.length === 2 ? t('chatList.directMessage') : t('chatList.groupChat');
  }, [t]);

  // Handle active call subscription events
  const handleActiveCallEvent = useCallback((data: any) => {
    if (data.action === 'update') {
      setActiveCalls(prev => {
        const existingCall = prev.find(call => call.id === data.record.id);

        // Check if call is active
        if (data.record.is_active_call) {
          if (!existingCall) {
            // New active call started
            // Show OS notification only if current user is NOT in call_participants
            const currentUserId = auth.user?.id;
            const isUserInCall = currentUserId && data.record.call_participants?.includes(currentUserId);

            if (!isUserInCall) {
              try {
                const chatName = getCallChatName(data.record);
                const notification = showCallNotification(t('calls.activeCall'), chatName, {
                  spaceId: spaceId,
                  tag: `active-call-${data.record.id}`,
                });

                if (notification) {
                  notification.onclick = () => {
                    window.focus();
                    notification.close();
                  };
                }
              } catch (err) {
                console.error('Failed to show call notification:', err);
              }
            }

            return [...prev, data.record];
          } else {
            // Call updated (e.g., participants changed)
            return prev.map(call => call.id === data.record.id ? data.record : call);
          }
        } else {
          // Call ended (is_active_call is false)
          return existingCall ? prev.filter(call => call.id !== data.record.id) : prev;
        }
      });
    } else if (data.action === 'delete') {
      // Chat deleted
      setActiveCalls(prev => prev.filter(call => call.id !== data.record.id));
    }
  }, [spaceId, getCallChatName]);

  // Subscribe to active calls
  useEffect(() => {
    if (!isVideoCallsEnabled || !spaceId) return;
    const unsubscribe = callsAPI.subscribeToActiveCalls(spaceId, handleActiveCallEvent);
    return () => { unsubscribe.then(fn => fn?.()); };
  }, [spaceId, handleActiveCallEvent]);

  const handleJoinCall = useCallback(async (callChatId: string) => {
    if (joiningCalls.has(callChatId)) return;
    setJoiningCalls(prev => new Set(prev).add(callChatId));
    try {
      const chat = await callsAPI.startCall(callChatId);
      setActiveCallChat(chat);
      setShowCallView(true);
      setLocation(`/spaces/${spaceId}/chat`);
    } catch (error) {
      console.error('Failed to join call:', error);
      toastManager.add({
        title: t('calls.failedToJoinCall'),
        description: t('calls.couldNotJoinCall'),
        data: { type: 'error' }
      });
    } finally {
      setJoiningCalls(prev => {
        const next = new Set(prev);
        next.delete(callChatId);
        return next;
      });
    }
  }, [joiningCalls, setActiveCallChat, setShowCallView, setLocation, spaceId, toastManager]);

  const handleSelectChat = useCallback((newChatId: string) => {
    setShowCallView(false);
    setLocation(`/spaces/${spaceId}/chat/${newChatId}`);
  }, [spaceId, setLocation, setShowCallView]);

  const handleShowActiveCall = useCallback(() => {
    setShowCallView(true);
    setLocation(`/spaces/${spaceId}/chat`);
  }, [spaceId, setLocation, setShowCallView]);

  const handleChatCreated = useCallback((chatId: string) => {
    loadChats();
    setLocation(`/spaces/${spaceId}/chat/${chatId}`);
  }, [loadChats, setLocation, spaceId]);

  return (
    <>
      <div className="sidebar">
        <div className="w-full p-2 flex items-center g-2">
          <Button variant="ghost"
            onClick={() => setLocation('/my')}
            className="flex-1 flex items-center gap-2"
          >
            <img src="/favicon.svg" alt={t('app.logoAlt')} className="w-5 h-5" />
            <span className="text-xs text-light truncate text-right">{auth.user?.name || auth.user?.email}</span>
          </Button>
          <Menu
            className="p-2 rounded font-medium transition-colors duration-75 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-(--color-text-primary) hover:bg-(--color-bg-hover)"
            trigger={<PlusIcon size={20} className="text-accent" />}
            items={[
              { label: t('chats.createChat'), onClick: () => setShowCreateDialog(true) }
            ]}
          />
        </div>
        {isVideoCallsEnabled && activeCalls.length > 0 && (
          <div className="p-2 grid gap-1">
            {activeCalls.map(call => {
              const isInCall = activeCallChat?.id === call.id;
              const isSelected = isInCall && !chatId;

              // Use Button only when clickable (isInCall), otherwise use div to avoid nested buttons
              const Container = isInCall ? Button : 'div';
              const containerProps = isInCall ? {
                variant: 'ghost' as const,
                onClick: handleShowActiveCall,
                isSelected: isSelected
              } : {};

              return (
                <Container
                  key={call.id}
                  {...containerProps}
                  className={`w-full p-2! text-left flex items-center gap-2 ${!isInCall && isSelected
                    ? 'bg-(--color-bg-active)!'
                    : !isInCall ? 'bg-(--color-bg-primary)' : ''
                    }`}
                >
                  <div className="shrink-0">
                    <PhoneIcon size={24} className="text-accent" />
                  </div>
                  <div className="flex-1 grid min-w-0">
                    <div className={`text-sm truncate ${isInCall ? 'font-semibold text-(--color-text-primary)' : 'font-medium text-(--color-text-primary)'}`}>
                      {getCallChatName(call)}
                    </div>
                    <div className="text-xs text-light truncate mt-0.5">
                      {isInCall ? t('calls.inCall') : t('calls.activeCall')}
                    </div>
                  </div>
                  {!isInCall && (
                    <div className="shrink-0">
                      <Button
                        onClick={() => handleJoinCall(call.id)}
                        disabled={joiningCalls.has(call.id)}
                        variant="primary"
                        className="text-xs"
                      >
                        {joiningCalls.has(call.id) ? t('calls.joining') : t('calls.joinCall')}
                      </Button>
                    </div>
                  )}
                </Container>
              );
            })}
          </div>
        )}
        <ScrollArea>
          <ChatList
            chats={chatList}
            selectedChatId={chatId || null}
            onSelectChat={handleSelectChat}
            unreadCounts={unreadCounts}
          />
        </ScrollArea>
      </div>
      {spaceId && (
        <CreateGroupChatDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          spaceId={spaceId}
          onChatCreated={handleChatCreated}
        />
      )}
    </>
  );
}

export { LAST_SPACE_KEY };
