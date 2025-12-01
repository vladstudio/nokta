import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Button, ScrollArea } from '../ui';
import { chats as chatsAPI, auth } from '../services/pocketbase';
import { UserAvatar, ChatAvatar } from './Avatar';
import { getChatDisplayName } from '../utils/chatUtils';
import type { Chat, Message } from '../types';

interface ForwardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: Message | null;
  onForward: (chatId: string, message: Message) => Promise<void>;
}

export default function ForwardDialog({ open, onOpenChange, message, onForward }: ForwardDialogProps) {
  const { t } = useTranslation();
  const [chatList, setChatList] = useState<Chat[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) chatsAPI.list().then(setChatList).catch(() => setChatList([]));
  }, [open]);

  const handleSelect = async (chatId: string) => {
    if (!message || sending) return;
    setSending(true);
    try {
      await onForward(chatId, message);
      onOpenChange(false);
    } finally {
      setSending(false);
    }
  };

  const currentUserId = auth.user?.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={t('messageActions.forwardTo')}>
      <ScrollArea className="max-h-[50dvh]">
        <div className="grid">
          {chatList.map(chat => {
            const other = chat.participants.length === 2 ? chat.expand?.participants?.find(p => p.id !== currentUserId) : null;
            return (
              <Button
                key={chat.id}
                variant="ghost"
                className="justify-start! gap-3 p-2"
                disabled={sending}
                onClick={() => handleSelect(chat.id)}
              >
                {other ? <UserAvatar user={other} size={32} /> : <ChatAvatar chat={chat} size={32} />}
                <span className="text-sm truncate">{getChatDisplayName(chat, currentUserId, { directMessage: t('chatList.directMessage'), groupChat: t('chatList.groupChat'), defaultName: t('chatWindow.defaultChatName') })}</span>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </Dialog>
  );
}
