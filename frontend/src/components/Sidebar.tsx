import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { auth, spaces, chats, pb } from '../services/pocketbase';
import { callsAPI } from '../services/calls';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { useFavicon } from '../hooks/useFavicon';
import { showCallNotification } from '../utils/notifications';
import { Menu, ScrollArea, useToastManager } from '../ui';
import ChatList from './ChatList';
import UserSettingsDialog from './UserSettingsDialog';
import MinimizedCallWidget from './MinimizedCallWidget';
import CallInviteWidget from './CallInviteWidget';
import { activeCallAtom, showCallViewAtom, isCallMinimizedAtom } from '../store/callStore';
import type { Space, Chat, PocketBaseEvent, CallInvite } from '../types';

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
  const [callInvites, setCallInvites] = useState<CallInvite[]>([]);
  const [acceptingInvites, setAcceptingInvites] = useState<Set<string>>(new Set());
  const [decliningInvites, setDecliningInvites] = useState<Set<string>>(new Set());
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
      console.log('[Sidebar] loadInvites result:', invites);
      setCallInvites(invites);
    } catch (error) {
      console.error('[Sidebar] loadInvites error:', error);
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
    const unsubscribe = callsAPI.subscribeToInvites(async (data) => {
      console.log('[Sidebar] Invite subscription event:', data);
      if (data.action === 'create' && data.record.invitee === auth.user?.id) {
        console.log('[Sidebar] Processing invite for current user:', data.record.id);
        loadInvites();

        // Show OS notification for incoming call
        try {
          // Fetch only the specific invite with expanded data
          const newInvite = await pb.collection('call_invites').getOne<CallInvite>(
            data.record.id,
            { expand: 'call,inviter' }
          );

          if (newInvite.expand?.inviter && newInvite.expand?.call) {
            const inviterName = newInvite.expand.inviter.name || newInvite.expand.inviter.email;
            const space = spaceList.find(s => s.id === newInvite.expand.call.space);
            const spaceName = space?.name || 'Unknown Space';

            const notification = showCallNotification(inviterName, spaceName, {
              inviteId: newInvite.id,
              spaceId: newInvite.expand.call.space,
            });

            // Handle notification click
            if (notification) {
              notification.onclick = () => {
                window.focus();
                notification.close();
              };
            }
          }
        } catch (err) {
          console.error('Failed to show call notification:', err);
        }
      } else if (data.action === 'delete') {
        setCallInvites(prev => prev.filter(inv => inv.id !== data.record.id));
      }
    });
    return () => { unsubscribe.then(fn => fn?.()); };
  }, [spaceId, loadInvites, spaceList]);

  const handleAcceptInvite = useCallback(async (inviteId: string) => {
    // Prevent duplicate calls
    if (acceptingInvites.has(inviteId)) return;

    setAcceptingInvites(prev => new Set(prev).add(inviteId));
    try {
      const call = await callsAPI.acceptInvite(inviteId);
      setActiveCall(call);
      setShowCallView(true);
      setIsCallMinimized(false); // Show full screen
      setCallInvites(prev => prev.filter(inv => inv.id !== inviteId));
    } catch (error) {
      console.error('Failed to accept invite:', error);
      toastManager.add({
        title: 'Failed to join call',
        description: 'Could not accept the invitation. Please try again.',
        data: { type: 'error' }
      });
    } finally {
      setAcceptingInvites(prev => {
        const next = new Set(prev);
        next.delete(inviteId);
        return next;
      });
    }
  }, [acceptingInvites, setActiveCall, setShowCallView, setIsCallMinimized, toastManager]);

  const handleDeclineInvite = useCallback(async (inviteId: string) => {
    // Prevent duplicate calls
    if (decliningInvites.has(inviteId)) return;

    setDecliningInvites(prev => new Set(prev).add(inviteId));
    try {
      await callsAPI.declineInvite(inviteId);
      setCallInvites(prev => prev.filter(inv => inv.id !== inviteId));
    } catch (error) {
      console.error('Failed to decline invite:', error);
      toastManager.add({
        title: 'Failed to decline',
        description: 'Could not decline the invitation. Please try again.',
        data: { type: 'error' }
      });
    } finally {
      setDecliningInvites(prev => {
        const next = new Set(prev);
        next.delete(inviteId);
        return next;
      });
    }
  }, [decliningInvites, toastManager]);

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
        {console.log('[Sidebar] Rendering invites:', callInvites)}
        {callInvites.map(invite => (
          <CallInviteWidget
            key={invite.id}
            invite={invite}
            onAccept={handleAcceptInvite}
            onDecline={handleDeclineInvite}
            isAccepting={acceptingInvites.has(invite.id)}
            isDeclining={decliningInvites.has(invite.id)}
            isInCall={!!activeCall}
          />
        ))}
        <MinimizedCallWidget />
      </div>
      <UserSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}

export { LAST_SPACE_KEY };
