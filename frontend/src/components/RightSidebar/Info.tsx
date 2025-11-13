import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TrashIcon, SignOutIcon } from '@phosphor-icons/react';
import { UserAvatar } from '../Avatar';
import { Button, Dialog, Input, useToastManager } from '../../ui';
import { chats } from '../../services/pocketbase';
import { getChatDisplayName } from '../../utils/chatUtils';
import type { Chat, User } from '../../types';

interface InfoProps {
  chat: Chat | null;
  currentUser: User | null;
  onDeleteChat: () => void;
  onLeaveChat: () => void;
}

export default function Info({ chat, currentUser, onDeleteChat, onLeaveChat }: InfoProps) {
  const { t } = useTranslation();
  const toastManager = useToastManager();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [chatName, setChatName] = useState(() =>
    getChatDisplayName(chat, currentUser?.id, {
      directMessage: t('chatList.directMessage'),
      groupChat: t('chatList.groupChat'),
    })
  );

  useEffect(() => {
    if (chat && !isEditing) {
      setChatName(getChatDisplayName(chat, currentUser?.id, {
        directMessage: t('chatList.directMessage'),
        groupChat: t('chatList.groupChat'),
      }));
    }
  }, [chat?.name, chat?.id, currentUser?.id, t]);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-sm text-light">{t('common.loading')}</div>
      </div>
    );
  }

  const participants = chat.expand?.participants || [];

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmedName = chatName.trim();
    if (!trimmedName || trimmedName.length === 0) {
      toastManager.add({
        title: t('errors.invalidInput'),
        description: t('chats.chatNameRequired'),
        data: { type: 'error' },
      });
      return;
    }

    setIsSaving(true);
    try {
      await chats.update(chat.id, trimmedName);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to rename chat:', err);
      toastManager.add({
        title: t('chats.failedToRename'),
        description: t('errors.unexpectedError'),
        data: { type: 'error' },
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setChatName(getChatDisplayName(chat, currentUser?.id, {
      directMessage: t('chatList.directMessage'),
      groupChat: t('chatList.groupChat'),
    }));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 gap-6">
      {/* Chat Name */}
      <form onSubmit={handleSave} className="flex flex-col gap-2">
        <h4 className="text-xs font-semibold uppercase text-light">{t('chats.chatName')}</h4>
        <Input
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          onFocus={() => setIsEditing(true)}
          onKeyDown={handleKeyDown}
          placeholder={t('chats.chatName')}
          disabled={isSaving}
        />
        {isEditing && (
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1 center" onClick={handleCancel} disabled={isSaving}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" className="flex-1 center" disabled={isSaving}>
              {isSaving ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        )}
      </form>

      {/* Participants */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold uppercase text-light">{t('chats.participants')}</h4>
        <div className="flex flex-col gap-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center gap-2">
              <UserAvatar user={participant} size={32} />
              <span className="text-sm">{participant.name || participant.email}</span>
              {participant.id === currentUser?.id && (
                <span className="text-xs text-light ml-auto">{t('common.you')}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 border-t pt-4 border-(--color-border-default)">
        {chat.participants.length > 1 && (
          <Button
            variant="default"
            onClick={() => setLeaveDialogOpen(true)}
            className="w-full flex items-center gap-2 justify-start"
          >
            <SignOutIcon size={20} />
            {t('chats.leaveChat')}
          </Button>
        )}
        <Button
          variant="default"
          onClick={() => setDeleteDialogOpen(true)}
          className="w-full flex items-center gap-2 justify-start text-red-600"
        >
          <TrashIcon size={20} />
          {t('chats.deleteChat')}
        </Button>
      </div>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('chats.deleteChat')}
        description={t('chats.confirmDeleteForAll')}
        footer={
          <>
            <Button variant="outline" className="flex-1 center" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" className="flex-1 center" onClick={() => { setDeleteDialogOpen(false); onDeleteChat(); }}>
              {t('common.delete')}
            </Button>
          </>
        }
      >
        <div />
      </Dialog>

      {/* Leave Dialog */}
      <Dialog
        open={leaveDialogOpen}
        onOpenChange={setLeaveDialogOpen}
        title={t('chats.leaveChat')}
        description={t('chats.confirmLeave')}
        footer={
          <>
            <Button variant="outline" className="flex-1 center" onClick={() => setLeaveDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" className="flex-1 center" onClick={() => { setLeaveDialogOpen(false); onLeaveChat(); }}>
              {t('common.leave')}
            </Button>
          </>
        }
      >
        <div />
      </Dialog>
    </div>
  );
}
