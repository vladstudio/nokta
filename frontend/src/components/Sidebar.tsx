import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { auth, spaces, chats } from '../services/pocketbase';
import { callsAPI } from '../services/calls';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useFavicon } from '../hooks/useFavicon';
import { Menu, ScrollArea } from '../ui';
import ChatList from './ChatList';
import UserSettingsDialog from './UserSettingsDialog';
import MinimizedCallWidget from './MinimizedCallWidget';
import CallInviteWidget from './CallInviteWidget';
import { activeCallAtom, showCallViewAtom, isCallMinimizedAtom } from '../store/callStore';
import type { Space, Chat, PocketBaseEvent, CallInvite } from '../types';

const LAST_SPACE_KEY = 'talk:lastSpaceId';

export default function Sidebar() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/spaces/:spaceId/chats/:chatId?');
  const spaceId = params?.spaceId;
  const chatId = params?.chatId;

  const [spaceList, setSpaceList] = useState<Space[]>([]);
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [callInvites, setCallInvites] = useState<CallInvite[]>([]);
  const [activeCall, setActiveCall] = useAtom(activeCallAtom);
  const [, setShowCallView] = useAtom(showCallViewAtom);
  const [, setIsCallMinimized] = useAtom(isCallMinimizedAtom);

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

  const loadInvites = useCallback(async () => {
    if (!spaceId) return;
    try {
      const invites = await callsAPI.getMyInvites(spaceId);
      setCallInvites(invites);
    } catch {
      setCallInvites([]);
    }
  }, [spaceId]);

  useEffect(() => { loadSpaces(); }, [loadSpaces]);
  useEffect(() => { loadChats(); }, [loadChats]);
  useEffect(() => { loadInvites(); }, [loadInvites]);

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

  // Subscribe to call invites
  useEffect(() => {
    if (!spaceId) return;
    const unsubscribe = callsAPI.subscribeToInvites((data) => {
      if (data.action === 'create' && data.record.invitee === auth.user?.id) {
        loadInvites();
      } else if (data.action === 'delete') {
        setCallInvites(prev => prev.filter(inv => inv.id !== data.record.id));
      }
    });
    return () => { unsubscribe.then(fn => fn?.()); };
  }, [spaceId, loadInvites]);

  const handleAcceptInvite = useCallback(async (inviteId: string) => {
    try {
      const call = await callsAPI.acceptInvite(inviteId);
      setActiveCall(call);
      setShowCallView(true);
      setIsCallMinimized(false); // Show full screen
      setCallInvites(prev => prev.filter(inv => inv.id !== inviteId));
    } catch (error) {
      console.error('Failed to accept invite:', error);
    }
  }, [setActiveCall, setShowCallView, setIsCallMinimized]);

  const handleDeclineInvite = useCallback(async (inviteId: string) => {
    try {
      await callsAPI.declineInvite(inviteId);
      setCallInvites(prev => prev.filter(inv => inv.id !== inviteId));
    } catch (error) {
      console.error('Failed to decline invite:', error);
    }
  }, []);

  const handleSelectChat = useCallback((newChatId: string) => {
    setLocation(`/spaces/${spaceId}/chats/${newChatId}`);
  }, [spaceId, setLocation]);

  return (
    <>
      <div className="w-60 bg-white border-r border-gray-200 flex flex-col min-h-0">
        <ScrollArea>
          <div className="p-4">
            <Menu
              trigger={
                <div className="w-full flex flex-col items-start gap-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center gap-2 w-full">
                    <img src="/favicon.svg" alt="Talk" className="w-5 h-5" />
                    <span className="text-base font-semibold">{currentSpace?.name || t('sidebar.selectSpace')}</span>
                  </div>
                  <span className="text-xs text-gray-500">{auth.user?.name || auth.user?.email}</span>
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
        {callInvites.map(invite => (
          <CallInviteWidget
            key={invite.id}
            invite={invite}
            onAccept={handleAcceptInvite}
            onDecline={handleDeclineInvite}
          />
        ))}
        <MinimizedCallWidget />
      </div>
      <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

export { LAST_SPACE_KEY };
