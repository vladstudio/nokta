import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrashIcon, SignOutIcon } from '@phosphor-icons/react';
import { UserAvatar } from '../Avatar';
import { Button, Dialog } from '../../ui';
import type { Chat, User } from '../../types';

interface InfoProps {
  chat: Chat | null;
  currentUser: User | null;
  onDeleteChat: () => void;
  onLeaveChat: () => void;
}

export default function Info({ chat, currentUser, onDeleteChat, onLeaveChat }: InfoProps) {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-sm text-light">{t('common.loading')}</div>
      </div>
    );
  }

  const participants = chat.expand?.participants || [];

  return (
    <div className="flex-1 flex flex-col p-4 gap-6">
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
            <Button variant="default" onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={() => { setDeleteDialogOpen(false); onDeleteChat(); }}>
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
            <Button variant="default" onClick={() => setLeaveDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={() => { setLeaveDialogOpen(false); onLeaveChat(); }}>
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
