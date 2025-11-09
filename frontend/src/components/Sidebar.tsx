import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { auth, spaces, chats } from '../services/pocketbase';
import { callsAPI } from '../services/calls';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useFavicon } from '../hooks/useFavicon';
import { showCallNotification } from '../utils/notifications';
import { Menu, ScrollArea, useToastManager, Button } from '../ui';
import ChatList from './ChatList';
import UserSettingsDialog from './UserSettingsDialog';
import { activeCallChatAtom, showCallViewAtom } from '../store/callStore';
import type { Space, Chat, PocketBaseEvent } from '../types';

const LAST_SPACE_KEY = 'talk:lastSpaceId';

export default function Sidebar() {
  const { t } = useTranslation();
  const toastManager = useToastManager();
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/spaces/:spaceId/chats/:chatId?');
  const spaceId = params?.spaceId;
  const chatId = params?.chatId;

  const [spaceList, setSpaceList] = useState<Space[]>([]);
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeCalls, setActiveCalls] = useState<Chat[]>([]);
  const [joiningCalls, setJoiningCalls] = useState<Set<string>>(new Set());
  const [activeCallChat, setActiveCallChat] = useAtom(activeCallChatAtom);
  const [, setShowCallView] = useAtom(showCallViewAtom);

  const loadSpaces = useCallback(() => {
    spaces.list().then(setSpaceList).catch(() => setSpaceList([]));
  }, []);

  const loadChats = useCallback(async () => {
    if (!spaceId) return;
    try {
      const data = await chats.list(spaceId);
      setChatList(data);
      if (!chatId && data.length > 0) {
        setLocation(`/spaces/${spaceId}/chats/${data[0].id}`);
      }
    } catch {
      setChatList([]);
    }
  }, [spaceId, chatId, setLocation]);

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
  useEffect(() => { loadActiveCalls(); }, [loadActiveCalls]);

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

  const menuItems = useMemo(() => [
    { label: t('sidebar.mySpaces'), onClick: () => { setLocation('/my-spaces'); } },
    { label: t('sidebar.mySettings'), onClick: () => { setSettingsOpen(true); } },
    { label: t('sidebar.logOut'), onClick: () => { auth.logout(); setLocation('/login'); } },
  ], [setLocation, t]);

  const getCallChatName = useCallback((chat: Chat) => {
    if (chat.type === 'public') {
      return chat.name || 'General';
    }

    // For private chats, show other participants' names
    if (chat.expand?.participants) {
      const otherParticipants = chat.expand.participants.filter(
        (p) => p.id !== auth.user?.id
      );
      if (otherParticipants.length > 0) {
        return otherParticipants.map((p) => p.name || p.email).join(', ');
      }
    }

    return t('chatList.directMessage');
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
                const notification = showCallNotification('Active Call', chatName, {
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
    if (!spaceId) return;
    const unsubscribe = callsAPI.subscribeToActiveCalls(spaceId, handleActiveCallEvent);
    return () => { unsubscribe.then(fn => fn?.()); };
  }, [spaceId, handleActiveCallEvent]);

  const handleJoinCall = useCallback(async (callChatId: string) => {
    // Prevent duplicate calls
    if (joiningCalls.has(callChatId)) return;

    setJoiningCalls(prev => new Set(prev).add(callChatId));
    try {
      const chat = await callsAPI.startCall(callChatId);
      setActiveCallChat(chat);
      setShowCallView(true);
    } catch (error) {
      console.error('Failed to join call:', error);
      toastManager.add({
        title: 'Failed to join call',
        description: 'Could not join the call. Please try again.',
        data: { type: 'error' }
      });
    } finally {
      setJoiningCalls(prev => {
        const next = new Set(prev);
        next.delete(callChatId);
        return next;
      });
    }
  }, [joiningCalls, setActiveCallChat, setShowCallView, toastManager]);

  const handleSelectChat = useCallback((newChatId: string) => {
    setLocation(`/spaces/${spaceId}/chats/${newChatId}`);
  }, [spaceId, setLocation]);

  return (
    <>
      <div className="sidebar">
        <ScrollArea>
          <div className="p-4 border-b border-gray-100">
            <Menu
              trigger={
                <div className="w-full flex flex-col items-start gap-1.5 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2 w-full">
                    <img src="/favicon.svg" alt="Talk" className="w-5 h-5" />
                    <span className="text-sm font-semibold text-gray-900 truncate">{currentSpace?.name || t('sidebar.selectSpace')}</span>
                  </div>
                  <span className="text-xs text-gray-500 truncate w-full">{auth.user?.name || auth.user?.email}</span>
                </div>
              }
              items={menuItems}
            />
          </div>
          <ChatList
            chats={chatList}
            selectedChatId={chatId || null}
            onSelectChat={handleSelectChat}
            unreadCounts={unreadCounts}
          />
        </ScrollArea>
        {activeCalls.map(call => (
          <div
            key={call.id}
            className="p-4 bg-green-50 border-t border-green-200"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-green-900 truncate">
                  {getCallChatName(call)}
                </div>
                <div className="text-xs text-green-700 mt-0.5">
                  Active call in progress
                </div>
              </div>
              <Button
                onClick={() => handleJoinCall(call.id)}
                disabled={joiningCalls.has(call.id) || activeCallChat?.id === call.id}
                variant="default"
                size="sm"
                className="btn-primary !bg-green-600 hover:!bg-green-700 disabled:!bg-gray-400 text-xs px-3 py-1.5"
              >
                {activeCallChat?.id === call.id ? 'In Call' : joiningCalls.has(call.id) ? 'Joining...' : 'Join Call'}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

export { LAST_SPACE_KEY };
