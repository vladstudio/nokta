import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { auth, chats } from '../services/pocketbase';
import { callsAPI } from '../services/calls';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useFavicon } from '../hooks/useFavicon';
import { usePresence } from '../hooks/usePresence';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { showCallNotification, isChatMuted } from '../utils/notifications';
import { isVideoCallsEnabled } from '../config/features';
import { getChatDisplayName } from '../utils/chatUtils';
import { ScrollArea, useToastManager, Button } from '../ui';
import { SidebarItem } from './SidebarItem';
import { UserAvatar, ChatAvatar } from './Avatar';
import { activeCallChatAtom, showCallViewAtom } from '../store/callStore';
import type { Chat, PocketBaseEvent } from '../types';
import { PhoneIcon, PlusIcon } from '@phosphor-icons/react';

export default function Sidebar() {
  const { t } = useTranslation();
  const toastManager = useToastManager();
  const [location, setLocation] = useLocation();
  const [, chatParams] = useRoute('/chat/:chatId');
  const chatId = chatParams?.chatId;
  const { isOnline, needsReload } = useConnectionStatus();

  const [chatList, setChatList] = useState<Chat[]>([]);
  const [activeCalls, setActiveCalls] = useState<Chat[]>([]);
  const [joiningCalls, setJoiningCalls] = useState<Set<string>>(new Set());
  const [activeCallChat, setActiveCallChat] = useAtom(activeCallChatAtom);
  const [showCallView, setShowCallView] = useAtom(showCallViewAtom);

  // Derived selection state from URL
  const isSettingsSelected = location === '/settings';
  const isNewChatSelected = location === '/new';

  const loadChats = useCallback(async () => {
    try {
      setChatList(await chats.list());
    } catch {
      setChatList([]);
    }
  }, []);

  const loadActiveCalls = useCallback(async () => {
    try {
      setActiveCalls(await callsAPI.getActiveCalls());
    } catch {
      setActiveCalls([]);
    }
  }, []);

  useEffect(() => { loadChats(); }, [loadChats]);
  useEffect(() => { if (isVideoCallsEnabled) loadActiveCalls(); }, [loadActiveCalls]);


  useEffect(() => {
    const unsubscribe = chats.subscribe(async (data: PocketBaseEvent<Chat>) => {
      if (data.action === 'create') {
        loadChats();
      } else if (data.action === 'update') {
        const fullChat = await chats.getOne(data.record.id);
        setChatList(prev => prev.map(c => c.id === data.record.id ? fullChat : c).sort((a, b) => (b.last_message_at || '').localeCompare(a.last_message_at || '')));
      } else if (data.action === 'delete') {
        setChatList(prev => prev.filter(c => c.id !== data.record.id));
      }
    });
    return () => { unsubscribe.then(fn => fn?.()); };
  }, [loadChats]);

  const { unreadCounts } = useUnreadMessages(chatList, chatId, setLocation);
  const hasUnread = useMemo(() => Array.from(unreadCounts.values()).some(count => count > 0), [unreadCounts]);
  useFavicon(hasUnread);

  // Presence tracking
  const participantIds = useMemo(() => {
    const ids = new Set<string>();
    chatList.forEach(chat => chat.expand?.participants?.forEach(p => { if (p.id !== auth.user?.id) ids.add(p.id); }));
    return Array.from(ids);
  }, [chatList]);
  const { isUserOnline } = usePresence(participantIds);

  const getCallChatName = useCallback((chat: Chat) => {
    return getChatDisplayName(chat, auth.user?.id, { directMessage: t('chatList.directMessage'), groupChat: t('chatList.groupChat') });
  }, [t]);

  // Active call subscription
  const handleActiveCallEvent = useCallback((data: any) => {
    if (data.action === 'update') {
      setActiveCalls(prev => {
        const exists = prev.find(call => call.id === data.record.id);
        if (data.record.is_active_call) {
          if (!exists) {
            const currentUserId = auth.user?.id;
            if (currentUserId && !data.record.call_participants?.includes(currentUserId)) {
              showCallNotification(t('calls.activeCall'), getCallChatName(data.record), { tag: `active-call-${data.record.id}` });
            }
            return [...prev, data.record];
          }
          return prev.map(call => call.id === data.record.id ? data.record : call);
        }
        return exists ? prev.filter(call => call.id !== data.record.id) : prev;
      });
    } else if (data.action === 'delete') {
      setActiveCalls(prev => prev.filter(call => call.id !== data.record.id));
    }
  }, [getCallChatName, t]);

  useEffect(() => {
    if (!isVideoCallsEnabled) return;
    const unsubscribe = callsAPI.subscribeToActiveCalls(handleActiveCallEvent);
    return () => { unsubscribe.then(fn => fn?.()); };
  }, [handleActiveCallEvent]);

  const handleJoinCall = useCallback(async (callChatId: string) => {
    if (joiningCalls.has(callChatId)) return;
    setJoiningCalls(prev => new Set(prev).add(callChatId));
    try {
      const chat = await callsAPI.startCall(callChatId);
      setActiveCallChat(chat);
      setShowCallView(true);
      setLocation('/chat');
    } catch {
      toastManager.add({ title: t('calls.failedToJoinCall'), description: t('errors.pleaseTryAgain'), data: { type: 'error' } });
    } finally {
      setJoiningCalls(prev => { const next = new Set(prev); next.delete(callChatId); return next; });
    }
  }, [joiningCalls, setActiveCallChat, setShowCallView, setLocation, toastManager, t]);

  const handleShowActiveCall = useCallback(() => {
    setShowCallView(true);
    setLocation('/chat');
  }, [setLocation, setShowCallView]);

  // Helper functions
  const getOtherParticipant = useCallback((chat: Chat) => chat.expand?.participants?.find(p => p.id !== auth.user?.id) || null, []);
  const getOnlineStatus = useCallback((chat: Chat) => {
    if (chat.participants.length !== 2) return null;
    const other = getOtherParticipant(chat);
    return other ? isUserOnline(other.id) : null;
  }, [getOtherParticipant, isUserOnline]);

  return (
    <div className="sidebar">
      <div className="w-full p-2 flex items-center gap-2">
        <Button variant="ghost" onClick={() => setLocation('/settings')} isSelected={isSettingsSelected} className="flex-1 flex items-center gap-2 min-w-0 px-2! text-left!">
          <img src="/favicon.svg" alt={t('app.logoAlt')} className="w-5 h-5 shrink-0" />
          <span className="text-sm text-light truncate">{auth.user?.name || auth.user?.email}</span>
        </Button>
        <Button variant="ghost" onClick={() => setLocation('/new')} isSelected={isNewChatSelected} className="p-2!">
          <PlusIcon size={20} className="text-accent" />
        </Button>
      </div>
      <ScrollArea>
        <div className="p-2 grid gap-1">
          {/* Offline banner */}
          {!isOnline && (
            <div className="text-xs text-center text-(--color-error-500) py-2">
              {t('connectionBanner.offline')}
            </div>
          )}
          {needsReload && (
            <button onClick={() => window.location.reload()} className="text-xs text-center text-accent py-2 w-full hover:underline">
              {t('connectionBanner.update')}
            </button>
          )}
          {/* Active calls */}
          {isVideoCallsEnabled && activeCalls.map(call => {
            const isInCall = activeCallChat?.id === call.id;
            const isSelected = isInCall && showCallView;
            return (
              <SidebarItem
                key={`call-${call.id}`}
                icon={<PhoneIcon size={24} className="text-accent" />}
                title={getCallChatName(call)}
                subtitle={isInCall ? t('calls.inCall') : t('calls.activeCall')}
                isSelected={isSelected}
                onClick={isInCall ? handleShowActiveCall : () => { }}
                action={!isInCall && (
                  <div className="flex items-center gap-2">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex size-2 rounded-full bg-green-500"></span>
                    </span>
                    <Button variant="primary" onClick={() => handleJoinCall(call.id)} disabled={joiningCalls.has(call.id)} className="text-xs">
                      {joiningCalls.has(call.id) ? t('calls.joining') : t('calls.joinCall')}
                    </Button>
                  </div>
                )}
              />
            );
          })}
          {/* Chats */}
          {chatList.map(chat => {
            const other = getOtherParticipant(chat);
            const lastMsg = chat.last_message_content && chat.expand?.last_message_sender
              ? `${chat.expand.last_message_sender.name || chat.expand.last_message_sender.email}: ${chat.last_message_content.slice(0, 50)}`
              : (chat.participants.length === 2 ? t('chatList.directMessage') : t('chatList.groupChat'));
            return (
              <SidebarItem
                key={chat.id}
                avatar={chat.participants.length === 2 && other ? <UserAvatar user={other} size={40} /> : <ChatAvatar chat={chat} size={40} />}
                title={getChatDisplayName(chat, auth.user?.id, { directMessage: t('chatList.directMessage'), groupChat: t('chatList.groupChat') })}
                subtitle={lastMsg}
                badge={unreadCounts.get(chat.id) || 0}
                muted={isChatMuted(chat.id)}
                isOnline={getOnlineStatus(chat)}
                isSelected={chatId === chat.id && !showCallView}
                onClick={() => { setShowCallView(false); setLocation(`/chat/${chat.id}`); }}
              />
            );
          })}
          {chatList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 px-6 text-center text-(--color-text-secondary)">
              <p className="text-sm">{t('chatList.noChats')}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
