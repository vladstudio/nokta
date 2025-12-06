import { useTranslation } from 'react-i18next';
import { XIcon, ArrowLeftIcon } from '@phosphor-icons/react';
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
  onClearChat: () => void;
  onChatUpdated: () => void;
  isMobile: boolean;
}

export default function RightSidebar({ chatId, chat, currentUser, view, onClose, onDeleteChat, onLeaveChat, onClearChat, onChatUpdated, isMobile }: RightSidebarProps) {
  const { t } = useTranslation();

  const titles = {
    search: t('search.title'),
    info: t('common.info')
  };

  return (
    <div className="right-sidebar">
      <div className="w-full p-2 flex items-center justify-between gap-2 bg-(--color-bg-primary)">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeftIcon size={20} className="text-accent" />
            </Button>
          )}
          <h3 className="font-semibold pl-2">{titles[view]}</h3>
        </div>
        {!isMobile && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XIcon size={20} className="text-accent" />
          </Button>
        )}
      </div>

      {view === 'search' && <Search chatId={chatId} onClose={onClose} isMobile={isMobile} />}
      {view === 'info' && <Info chat={chat} currentUser={currentUser} onDeleteChat={onDeleteChat} onLeaveChat={onLeaveChat} onClearChat={onClearChat} onChatUpdated={onChatUpdated} />}
    </div>
  );
}
