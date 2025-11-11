import { useTranslation } from 'react-i18next';
import { XIcon } from '@phosphor-icons/react';
import { Button } from '../ui';
import Search from './RightSidebar/Search';
import Info from './RightSidebar/Info';
import type { Chat, User } from '../types';

export type RightSidebarView = 'search' | 'info';

interface RightSidebarProps {
  chatId: string;
  chat: Chat | null;
  currentUser: User | null;
  view: RightSidebarView;
  onClose: () => void;
  onDeleteChat: () => void;
  onLeaveChat: () => void;
}

export default function RightSidebar({ chatId, chat, currentUser, view, onClose, onDeleteChat, onLeaveChat }: RightSidebarProps) {
  const { t } = useTranslation();

  const titles = {
    search: t('search.title'),
    info: t('common.info')
  };

  return (
    <div className="right-sidebar">
      <div className="w-full p-2 flex items-center justify-between gap-2 bg-(--color-bg-primary)">
        <h3 className="font-semibold pl-2">{titles[view]}</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <XIcon size={20} className="text-accent" />
        </Button>
      </div>

      {view === 'search' && <Search chatId={chatId} />}
      {view === 'info' && <Info chat={chat} currentUser={currentUser} onDeleteChat={onDeleteChat} onLeaveChat={onLeaveChat} />}
    </div>
  );
}
