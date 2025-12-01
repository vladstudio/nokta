import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Button, Input, FormLabel, ScrollArea, Checkbox, useToastManager, Card } from '../ui';
import { users, chats, auth } from '../services/pocketbase';
import { UserAvatar } from './Avatar';
import { useIsMobile } from '../hooks/useIsMobile';
import { ArrowLeftIcon, PlusIcon } from '@phosphor-icons/react';
import type { User } from '../types';

export default function CreateChatView() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const toastManager = useToastManager();
  const isMobile = useIsMobile();
  const [chatName, setChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    users.list().then(setAllUsers).catch(() => setAllUsers([]));
  }, []);

  const currentUserId = auth.user?.id;
  const availableUsers = useMemo(() => allUsers.filter(u => u.id !== currentUserId), [allUsers, currentUserId]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!auth.user?.id) return;
    const isChatWithSelf = selectedUsers.length === 0;
    if (isChatWithSelf && !chatName.trim()) return;
    setSaving(true);
    try {
      const participants = isChatWithSelf ? [auth.user.id] : [...selectedUsers, auth.user.id];
      const newChat = await chats.create(participants, chatName.trim() || undefined);
      window.dispatchEvent(new CustomEvent('chat-created', { detail: newChat }));
      setLocation(`/chat/${newChat.id}`);
    } catch (error) {
      console.error('Failed to create chat:', error);
      toastManager.add({ title: t('chats.failedToCreate'), description: t('errors.pleaseTryAgain'), data: { type: 'error' } });
    } finally {
      setSaving(false);
    }
  };

  const canCreate = selectedUsers.length > 0 || chatName.trim();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="flex items-center justify-between p-2 pl-4 border-b bg-(--color-bg-primary) border-(--color-border-default)">
        <div className="flex items-center gap-2">
          {isMobile && (
            <button onClick={() => setLocation('/chat')} className="p-1 -ml-2">
              <ArrowLeftIcon size={20} className="text-accent" />
            </button>
          )}
          <h2 className="font-semibold">{t('chats.createChat')}</h2>
        </div>
        <Button variant="primary" onClick={handleSubmit} disabled={saving || !canCreate}>
          <PlusIcon size={20} />
          {saving ? t('common.saving') : t('common.create')}
        </Button>
      </header>
      <ScrollArea>
        <div className="mx-auto w-full max-w-md p-6">
          <Card border shadow="sm" padding="lg" className="grid gap-8">
            <div className="">
              <FormLabel htmlFor="chatName">{t('chats.groupName')}</FormLabel>
              <Input id="chatName" maxLength={50} value={chatName} onChange={(e) => setChatName(e.target.value)} placeholder={t('chats.groupNamePlaceholder')} />
            </div>
            <div className="grid">
              {availableUsers.map(user => (
                <label key={user.id} className="flex items-center gap-3 p-2 hover:bg-(--color-bg-hover) rounded cursor-pointer">
                  <Checkbox
                    checked={selectedUsers.includes(user.id)}
                    onCheckedChange={(checked) => setSelectedUsers(prev => checked ? [...prev, user.id] : prev.filter(id => id !== user.id))}
                  />
                  <UserAvatar user={user} size={20} className="text-accent" />
                  <span className="text-sm">{user.name || user.email}</span>
                </label>
              ))}
            </div>
          </Card>
        </div>
      </ScrollArea >
    </div >
  );
}
