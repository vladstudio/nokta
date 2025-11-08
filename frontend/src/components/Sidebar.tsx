import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { auth, spaces, chats } from '../services/pocketbase';
import { useUnreadMessages } from '../hooks/useUnreadMessages';
import { Menu, ScrollArea } from '../ui';
import ChatList from './ChatList';
import type { Space, Chat } from '../types';

const LAST_SPACE_KEY = 'talk:lastSpaceId';

export default function Sidebar() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/spaces/:spaceId/:chatId?');
  const spaceId = params?.spaceId;
  const chatId = params?.chatId;

  const [spaceList, setSpaceList] = useState<Space[]>([]);
  const [chatList, setChatList] = useState<Chat[]>([]);

  const loadSpaces = useCallback(() => {
    spaces.list().then(setSpaceList).catch(() => setSpaceList([]));
  }, []);

  const loadChats = useCallback(async () => {
    if (!spaceId) return;
    try {
      const data = await chats.list(spaceId);
      setChatList(data);
      if (!chatId && data.length > 0) {
        setLocation(`/spaces/${spaceId}/${data[0].id}`);
      }
    } catch {
      setChatList([]);
    }
  }, [spaceId, chatId, setLocation]);

  useEffect(() => { loadSpaces(); }, [loadSpaces]);
  useEffect(() => { loadChats(); }, [loadChats]);

  useEffect(() => {
    if (!spaceId) return;
    const unsubscribe = chats.subscribe(async (data) => {
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

  const menuItems = useMemo(() => [
    ...spaceList.map(space => ({
      label: space.name,
      onClick: () => {
        localStorage.setItem(LAST_SPACE_KEY, space.id);
        setLocation(`/spaces/${space.id}`);
      },
    })),
    { label: 'Log Out', onClick: () => { auth.logout(); setLocation('/login'); } },
  ], [spaceList, setLocation]);

  const handleSelectChat = useCallback((newChatId: string) => {
    setLocation(`/spaces/${spaceId}/${newChatId}`);
  }, [spaceId, setLocation]);

  return (
    <div className="w-60 bg-white border-r border-gray-200 flex flex-col min-h-0">
      <ScrollArea>
        <div className="p-4">
          <Menu
            trigger={
              <div className="w-full flex flex-col items-start gap-2 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-2 w-full">
                  <img src="/favicon.svg" alt="Talk" className="w-5 h-5" />
                  <span className="text-base font-semibold">{currentSpace?.name || 'Select space'}</span>
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
    </div>
  );
}

export { LAST_SPACE_KEY };
