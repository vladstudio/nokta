import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Button, Input, FormLabel, ScrollArea, Checkbox } from '../ui';
import { spaceMembers, chats, auth } from '../services/pocketbase';
import { UserAvatar } from './Avatar';
import type { SpaceMember } from '../types';

interface CreateGroupChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaceId: string;
  onChatCreated?: () => void;
}

export default function CreateGroupChatDialog({ open, onOpenChange, spaceId, onChatCreated }: CreateGroupChatDialogProps) {
  const { t } = useTranslation();
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
    [members]
  );

  const handleCreate = async () => {
    if (selectedUsers.length === 0) return;
    setCreating(true);
    try {
      await chats.create(spaceId, 'private', [...selectedUsers, auth.user!.id], chatName || undefined);
      onOpenChange(false);
      onChatCreated?.();
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('chats.createGroup')}
      description={t('chats.selectMembers')}
      footer={
        <>
          <Button variant="default" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button variant="primary" onClick={handleCreate} disabled={creating || selectedUsers.length === 0}>
            {creating ? t('common.creating') : t('common.create')}
          </Button>
        </>
      }
    >
      <div className="grid gap-4">
        <div>
          <FormLabel htmlFor="chatName">{t('chats.groupName')}</FormLabel>
          <Input
            id="chatName"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            placeholder={t('chats.groupNamePlaceholder')}
          />
        </div>
        <ScrollArea className="max-h-[300px]">
          <div className="grid gap-2">
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
                  <UserAvatar user={user} size={32} />
                  <span className="text-sm">{user.name || user.email}</span>
                </label>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </Dialog>
  );
}
