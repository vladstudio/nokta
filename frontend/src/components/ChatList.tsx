import { useMemo } from 'react';
import type { Chat } from '../types';
import { auth } from '../services/pocketbase';
import { usePresence } from '../hooks/usePresence';
import { Button } from '../ui';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export default function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
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

  const getChatName = (chat: Chat) => {
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
  };

  const getChatIcon = (chat: Chat) => {
    return chat.type === 'public' ? '👥' : '💬';
  };

  const getOnlineStatus = (chat: Chat) => {
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
  };

  return (
    <div className="w-80 md:w-80 sm:w-full bg-white border-r border-gray-200 flex flex-col chat-list">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Chats</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">No chats available</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {chats.map((chat) => (
              <Button key={chat.id} variant="default" onClick={() => onSelectChat(chat.id)} className={`w-full px-4 py-3 text-left rounded-none border-0 hover:bg-gray-50 ${selectedChatId === chat.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <span className="text-2xl">{getChatIcon(chat)}</span>
                    {getOnlineStatus(chat) !== null && <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getOnlineStatus(chat) ? 'bg-green-500' : 'bg-gray-400'}`} title={getOnlineStatus(chat) ? 'Online' : 'Offline'} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{getChatName(chat)}</div>
                    <div className="text-xs text-gray-500">{chat.type === 'public' ? 'Public chat' : 'Private chat'}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
