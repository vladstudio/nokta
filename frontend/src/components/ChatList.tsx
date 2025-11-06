import type { Chat } from '../types';
import { auth } from '../services/pocketbase';

interface ChatListProps {
  chats: Chat[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
}

export default function ChatList({ chats, selectedChatId, onSelectChat }: ChatListProps) {
  const currentUser = auth.user;

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
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  selectedChatId === chat.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getChatIcon(chat)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {getChatName(chat)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {chat.type === 'public' ? 'Public chat' : 'Private chat'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
