import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Button, Input, FormLabel, ScrollArea, Checkbox, useToastManager } from '../ui';
import { spaceMembers, chats, auth } from '../services/pocketbase';
import { UserAvatar } from './Avatar';
import type { SpaceMember, Chat } from '../types';

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  chat?: Chat;
  onChatCreated?: (chatId: string) => void;
  onChatUpdated?: () => void;
}

export default function ChatDialog({ open, onOpenChange, spaceId, chat, onChatCreated, onChatUpdated }: ChatDialogProps) {
  const { t } = useTranslation();
  const toastManager = useToastManager();
  const isEditing = !!chat;
  const [chatName, setChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && spaceId) {
      spaceMembers.list(spaceId).then(setMembers).catch(() => setMembers([]));
      if (chat) {
        setChatName(chat.name || '');
        setSelectedUsers(chat.participants.filter(id => id !== auth.user?.id));
      } else {
        setChatName('');
        setSelectedUsers([]);
      }
    } else {
      setChatName('');
      setSelectedUsers([]);
      setMembers([]);
    }
  }, [open, spaceId, chat]);

  const availableMembers = useMemo(() =>
    members.filter(m => m.expand?.user && m.user !== auth.user?.id),
    [members, auth.user?.id]
  );

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!auth.user?.id) return;
    const isChatWithSelf = selectedUsers.length === 0;
    if (isChatWithSelf && !chatName.trim()) return;
    setSaving(true);
    try {
      if (isEditing && chat) {
        const participants = isChatWithSelf ? [auth.user.id] : [...selectedUsers, auth.user.id];
        await chats.update(chat.id, chatName.trim() || undefined, participants);
        onChatUpdated?.();
      } else {
        const participants = isChatWithSelf ? [auth.user.id] : [...selectedUsers, auth.user.id];
        const newChat = await chats.create(spaceId, participants, chatName.trim() || undefined);
        onChatCreated?.(newChat.id);
      }
      onOpenChange(false);
    } catch (error) {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} chat:`, error);
      toastManager.add({
        title: isEditing ? t('chats.failedToUpdate') : t('chats.failedToCreate'),
        description: t('errors.pleaseTryAgain'),
        data: { type: 'error' },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? t('chats.editChat') : t('chats.createChat')}
      footer={
        <>
          <Button variant="outline" className="flex-1 center" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button variant="primary" className="flex-1 center" type="submit" form="chat-form" disabled={saving || (selectedUsers.length === 0 && !chatName.trim())}>
            {saving ? t('common.saving') : (isEditing ? t('common.save') : t('common.create'))}
          </Button>
        </>
      }
    >
      <form id="chat-form" onSubmit={handleSubmit} className="grid gap-4">
        <div>
          <FormLabel htmlFor="chatName">{t('chats.groupName')}</FormLabel>
          <Input
            id="chatName"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            placeholder={t('chats.groupNamePlaceholder')}
          />
        </div>
        <ScrollArea className="max-h-[50dvh]">
          <div className="grid">
            {availableMembers.map(member => {
              const user = member.expand?.user;
              if (!user) return null;
              return (
                <label key={member.id} className="flex items-center gap-3 p-2 hover:bg-(--color-bg-hover) rounded cursor-pointer">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => {
                      setSelectedUsers(prev =>
                        checked ? [...prev, user.id] : prev.filter(id => id !== user.id)
                      );
                    }}
                  />
                  <UserAvatar user={user} size={20} className="text-accent" />
                  <span className="text-sm">{user.name || user.email}</span>
                </label>
              );
            })}
          </div>
        </ScrollArea>
      </form>
    </Dialog>
  );
}
