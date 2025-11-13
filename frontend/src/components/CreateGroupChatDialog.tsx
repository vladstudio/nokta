import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Button, Input, FormLabel, ScrollArea, Checkbox, useToastManager } from '../ui';
import { spaceMembers, chats, auth } from '../services/pocketbase';
import { UserAvatar } from './Avatar';
import type { SpaceMember } from '../types';

interface CreateGroupChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  onChatCreated?: (chatId: string) => void;
}

export default function CreateGroupChatDialog({ open, onOpenChange, spaceId, onChatCreated }: CreateGroupChatDialogProps) {
  const { t } = useTranslation();
  const toastManager = useToastManager();
  const [chatName, setChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (open && spaceId) {
      spaceMembers.list(spaceId).then(setMembers).catch(() => setMembers([]));
    } else {
      setChatName('');
      setSelectedUsers([]);
      setMembers([]);
    }
  }, [open, spaceId]);

  const availableMembers = useMemo(() =>
    members.filter(m => m.expand?.user && m.user !== auth.user?.id),
    [members, auth.user?.id]
  );

  const handleCreate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!auth.user?.id) return;
    const isChatWithSelf = selectedUsers.length === 0;
    if (isChatWithSelf && !chatName.trim()) return;
    setCreating(true);
    try {
      const participants = isChatWithSelf ? [auth.user.id] : [...selectedUsers, auth.user.id];
      const chat = await chats.create(spaceId, participants, chatName.trim() || undefined);
      onOpenChange(false);
      onChatCreated?.(chat.id);
    } catch (error) {
      console.error('Failed to create chat:', error);
      toastManager.add({
        title: t('chats.failedToCreate'),
        description: t('errors.pleaseTryAgain'),
        data: { type: 'error' },
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('chats.createChat')}
      footer={
        <>
          <Button variant="outline" className="flex-1 center" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button variant="primary" className="flex-1 center" type="submit" form="create-chat-form" disabled={creating || (selectedUsers.length === 0 && !chatName.trim())}>
            {creating ? t('common.creating') : t('common.create')}
          </Button>
        </>
      }
    >
      <form id="create-chat-form" onSubmit={handleCreate} className="grid gap-4">
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
                  <UserAvatar user={user} size={20} />
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
