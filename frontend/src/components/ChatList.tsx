import { useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Chat } from '../types';
import { auth } from '../services/pocketbase';
import { usePresence } from '../hooks/usePresence';
import { Button, Badge } from '../ui';
import { UserAvatar, ChatAvatar } from './Avatar';

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
  getOtherParticipant: (chat: Chat) => any;
  getOnlineStatus: (chat: Chat) => boolean | null;
}

const ChatListItem = memo(({ chat, isSelected, unreadCount, onSelectChat, getChatName, getOtherParticipant, getOnlineStatus }: ChatListItemProps) => {
  const { t } = useTranslation();
  const hasUnread = unreadCount > 0;

  const handleClick = useCallback(() => {
    onSelectChat(chat.id);
  }, [chat.id, onSelectChat]);

  return (
    <Button
      key={chat.id}
      variant="default"
      onClick={handleClick}
      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors duration-100 border-0 rounded-none border-b border-b-[var(--color-border-light)] hover:bg-[var(--color-bg-hover)] ${
        isSelected
          ? 'bg-[var(--color-primary-50)] border-l-[3px] border-l-[var(--color-primary-500)] pl-[calc(1rem-3px)]'
          : 'bg-[var(--color-bg-primary)]'
      }`}
    >
      <div className="relative shrink-0">
        {chat.type === 'private' ? (
          <UserAvatar user={getOtherParticipant(chat)} size={48} />
        ) : (
          <ChatAvatar chat={chat} size={48} />
        )}
        {getOnlineStatus(chat) !== null && (
          <Badge
            variant="online"
            className={`absolute -bottom-0.5 -right-0.5 ${getOnlineStatus(chat) ? '' : 'bg-gray-400!'}`}
            title={getOnlineStatus(chat) ? t('presence.online') : t('presence.offline')}
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm truncate ${hasUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>
          {getChatName(chat)}
        </div>
        <div className="text-xs text-gray-500 truncate mt-0.5">
          {chat.last_message_content && chat.expand?.last_message_sender ?
            `${chat.expand.last_message_sender.name || chat.expand.last_message_sender.email}: ${chat.last_message_content.slice(0, 50)}` :
            (chat.type === 'public' ? t('chatList.publicChat') : t('chatList.privateChat'))}
        </div>
      </div>
      {hasUnread && (
        <div className="shrink-0">
          <Badge variant="unread">
            {unreadCount > 99 ? '*' : unreadCount}
          </Badge>
        </div>
      )}
    </Button>
  );
});

export default function ChatList({ chats, selectedChatId, onSelectChat, unreadCounts = new Map() }: ChatListProps) {
  const { t } = useTranslation();
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
      return chat.name || t('calls.general');
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

    return t('chatList.directMessage');
  }, [currentUser?.id, t]);

  const getOtherParticipant = useCallback((chat: Chat) => {
    if (chat.type === 'public') return null;

    if (chat.expand?.participants) {
      const otherParticipants = chat.expand.participants.filter(
        (p) => p.id !== currentUser?.id
      );
      return otherParticipants[0] || null;
    }
    return null;
  }, [currentUser?.id]);

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

  return chats.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-8 px-6 text-center text-[var(--color-text-secondary)]">
      <p className="text-sm">{t('chatList.noChats')}</p>
    </div>
  ) : (
    <div>
      {chats.map((chat) => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isSelected={selectedChatId === chat.id}
          unreadCount={unreadCounts.get(chat.id) || 0}
          onSelectChat={onSelectChat}
          getChatName={getChatName}
          getOtherParticipant={getOtherParticipant}
          getOnlineStatus={getOnlineStatus}
        />
      ))}
    </div>
  );
}
