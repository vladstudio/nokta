import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TrashIcon, SignOutIcon, PencilIcon, BroomIcon, SpeakerSimpleSlash } from '@phosphor-icons/react';
import { UserAvatar } from '../Avatar';
import { Button, Dialog, ScrollArea } from '../../ui';
import { getChatDisplayName } from '../../utils/chatUtils';
import { isChatMuted, toggleChatMuted } from '../../utils/notifications';
import ChatDialog from '../ChatDialog';
import type { Chat, User } from '../../types';

interface InfoProps {
  chat: Chat | null;
  currentUser: User | null;
  onDeleteChat: () => void;
  onLeaveChat: () => void;
  onClearChat: () => void;
  onChatUpdated: () => void;
}

export default function Info({ chat, currentUser, onDeleteChat, onLeaveChat, onClearChat, onChatUpdated }: InfoProps) {
  const { t } = useTranslation();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [muted, setMuted] = useState(() => chat ? isChatMuted(chat.id) : false);

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-sm text-light">{t('common.loading')}</div>
      </div>
    );
  }

  const participants = chat.expand?.participants || [];
  const chatDisplayName = getChatDisplayName(chat, currentUser?.id, {
    directMessage: t('chatList.directMessage'),
    groupChat: t('chatList.groupChat'),
  });

  return (<ScrollArea>
    <div className="flex-1 flex flex-col p-4 gap-6">
      {/* Chat Name */}
      <div className="flex items-center gap-2">
        <span className="flex-1 text-sm font-medium">{chatDisplayName}</span>
        <Button variant="ghost" size="icon" onClick={() => setEditDialogOpen(true)}>
          <PencilIcon size={20} className="text-accent" />
        </Button>
      </div>

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
        <Button variant="default" onClick={() => setMuted(toggleChatMuted(chat.id))} className="w-full flex items-center gap-2 justify-start">
          <SpeakerSimpleSlash size={20} className={muted ? 'text-red-600' : 'text-accent'} />
          {muted ? t('chats.unmuteChat') : t('chats.muteChat')}
        </Button>
        {chat.participants.length > 1 && (
          <Button variant="default" onClick={() => setLeaveDialogOpen(true)} className="w-full flex items-center gap-2 justify-start">
            <SignOutIcon size={20} className="text-accent" />
            {t('chats.leaveChat')}
          </Button>
        )}
        <Button
          variant="default"
          onClick={() => setClearDialogOpen(true)}
          className="w-full flex items-center gap-2 justify-start"
        >
          <BroomIcon size={20} className="text-accent" />
          {t('chats.clearChat')}
        </Button>
        <Button
          variant="default"
          onClick={() => setDeleteDialogOpen(true)}
          className="w-full flex items-center gap-2 justify-start text-red-600"
        >
          <TrashIcon size={20} className="text-red-600" />
          {t('chats.deleteChat')}
        </Button>
      </div>

      {/* Clear Dialog */}
      <Dialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        title={t('chats.confirmClear')}
        footer={
          <>
            <Button variant="outline" className="flex-1 center" onClick={() => setClearDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" className="flex-1 center" onClick={() => { setClearDialogOpen(false); onClearChat(); }}>
              {t('common.confirm')}
            </Button>
          </>
        }
      >
        <div />
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('chats.deleteChat')}
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

      {/* Edit Chat Dialog */}
      <ChatDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        chat={chat}
        onChatUpdated={onChatUpdated}
      />
    </div></ScrollArea>
  );
}
