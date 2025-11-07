import { useMemo, useCallback, memo } from 'react';
import type { Chat } from '../types';
import { auth } from '../services/pocketbase';
import { usePresence } from '../hooks/usePresence';
import { Button } from '../ui';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  unreadCounts?: Map<string, number>;
}

interface ChatListItemProps {
  chat: Chat;
  isSelected: boolean;
  unreadCount: number;
  onSelectChat: (chatId: string) => void;
  getChatName: (chat: Chat) => string;
  getChatIcon: (chat: Chat) => string;
  getOnlineStatus: (chat: Chat) => boolean | null;
}

const ChatListItem = memo(({ chat, isSelected, unreadCount, onSelectChat, getChatName, getChatIcon, getOnlineStatus }: ChatListItemProps) => {
  const hasUnread = unreadCount > 0;

  const handleClick = useCallback(() => {
    onSelectChat(chat.id);
  }, [chat.id, onSelectChat]);

  return (
    <Button
      key={chat.id}
      variant="default"
      onClick={handleClick}
      className={`w-full px-4 py-3 text-left rounded-none border-0 hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
          <span className="text-2xl">{getChatIcon(chat)}</span>
          {getOnlineStatus(chat) !== null && (
            <span
              className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getOnlineStatus(chat) ? 'bg-green-500' : 'bg-gray-400'}`}
              title={getOnlineStatus(chat) ? 'Online' : 'Offline'}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm text-gray-900 truncate ${hasUnread ? 'font-semibold' : 'font-medium'}`}>
            {getChatName(chat)}
          </div>
          <div className="text-xs text-gray-500">
            {chat.type === 'public' ? 'Public chat' : 'Private chat'}
          </div>
        </div>
        {hasUnread && (
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </div>
        )}
      </div>
    </Button>
  );
});

export default function ChatList({ chats, selectedChatId, onSelectChat, unreadCounts = new Map() }: ChatListProps) {
  const currentUser = auth.user;

  // Collect all participant IDs for presence tracking
  const participantIds = useMemo(() => {
    const ids = new Set<string>();
    chats.forEach((chat) => {
      if (chat.expand?.participants) {
        chat.expand.participants.forEach((p) => {
          if (p.id !== currentUser?.id) {
            ids.add(p.id);
          }
        });
      }
    });
    return Array.from(ids);
  }, [chats, currentUser?.id]);

  const { isUserOnline } = usePresence(participantIds);

  const getChatName = useCallback((chat: Chat) => {
    if (chat.type === 'public') {
      return chat.name || 'General';
    }

    // For private chats, show other participants' names
    if (chat.expand?.participants) {
      const otherParticipants = chat.expand.participants.filter(
        (p) => p.id !== currentUser?.id
      );
      if (otherParticipants.length > 0) {
        return otherParticipants.map((p) => p.name || p.email).join(', ');
      }
    }

    return 'Direct Message';
  }, [currentUser?.id]);

  const getChatIcon = useCallback((chat: Chat) => {
    return chat.type === 'public' ? '👥' : '💬';
  }, []);

  const getOnlineStatus = useCallback((chat: Chat) => {
    if (chat.type === 'public') return null;

    // For DM, check if other participant is online
    if (chat.expand?.participants) {
      const otherParticipants = chat.expand.participants.filter(
        (p) => p.id !== currentUser?.id
      );
      if (otherParticipants.length === 1) {
        return isUserOnline(otherParticipants[0].id);
      }
    }
    return null;
  }, [currentUser?.id, isUserOnline]);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col chat-list">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">No chats available</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {chats.map((chat) => (
              <ChatListItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChatId === chat.id}
                unreadCount={unreadCounts.get(chat.id) || 0}
                onSelectChat={onSelectChat}
                getChatName={getChatName}
                getChatIcon={getChatIcon}
                getOnlineStatus={getOnlineStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
