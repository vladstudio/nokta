import { useTranslation } from 'react-i18next';
import { PhoneIcon, ArrowLeftIcon, DotsThreeIcon, MagnifyingGlassIcon, InfoIcon } from '@phosphor-icons/react';
import { UserAvatar } from './Avatar';
import { Button, Menu } from '../ui';
import { isVideoCallsEnabled } from '../config/features';
import type { Chat, User } from '../types';
import type { RightSidebarView } from './RightSidebar';

interface TypingUser {
  userId: string;
  userName: string;
  timestamp: number;
}

interface ChatHeaderProps {
  chat: Chat | null;
  chatName: string;
  typingUsers: TypingUser[];
  isMobile: boolean;
  rightSidebarView: RightSidebarView | null | undefined;
  isCreatingCall: boolean;
  activeCallChat: any;
  currentUser: User | null;
  onBack: () => void;
  onToggleRightSidebar: (view: RightSidebarView | null) => void;
  onStartCall: () => void;
  onLeaveGroup: () => void;
  onDeleteChat: () => void;
}

export default function ChatHeader({
  chat,
  chatName,
  typingUsers,
  isMobile,
  rightSidebarView,
  isCreatingCall,
  activeCallChat,
  currentUser,
  onBack,
  onToggleRightSidebar,
  onStartCall,
  onLeaveGroup,
  onDeleteChat,
}: ChatHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between p-2 pl-4 border-b bg-(--color-bg-primary) border-(--color-border-default)">
      <div className="flex items-center gap-2">
        {isMobile && (
          <button onClick={onBack} className="p-1 -ml-2">
            <ArrowLeftIcon size={20} className="text-accent" />
          </button>
        )}
        <h2 className="font-semibold flex-1">{chatName}</h2>
        {typingUsers.length > 0 && (
          <span className="text-xs text-light">
            {typingUsers.length === 1
              ? `${typingUsers[0].userName} ${t('chatWindow.isTyping')}`
              : typingUsers.length === 2
              ? `${typingUsers[0].userName} and ${typingUsers[1].userName} ${t('chatWindow.areTyping')}`
              : `${typingUsers.length} people ${t('chatWindow.areTyping')}`}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {/* Participant avatars for group chats */}
        {chat && (chat.type === 'public' || (chat.participants?.length || 0) > 2) && chat.expand?.participants && (
          <div className="flex items-center -space-x-2">
            {chat.expand.participants.slice(0, 5).map((participant) => (
              <UserAvatar
                key={participant.id}
                user={participant}
                size={24}
                className="border-2 rounded-full border-(--color-bg-primary)/90"
              />
            ))}
            {chat.expand.participants.length > 5 && (
              <div
                className="rounded-full flex items-center justify-center text-xs font-semibold border-2 border-(--color-bg-primary) bg-(--color-bg-secondary)"
                style={{ width: 24, height: 24 }}
              >
                +{chat.expand.participants.length - 5}
              </div>
            )}
          </div>
        )}
        <Button
          onClick={() => onToggleRightSidebar(rightSidebarView === 'info' ? null : 'info')}
          variant="ghost"
          size="icon"
          className={rightSidebarView === 'info' ? 'bg-(--color-bg-active)' : ''}
          title={t('common.info')}
        >
          <InfoIcon size={20} className="text-accent" />
        </Button>
        <Button
          onClick={() => onToggleRightSidebar(rightSidebarView === 'search' ? null : 'search')}
          variant="ghost"
          size="icon"
          className={rightSidebarView === 'search' ? 'bg-(--color-bg-active)' : ''}
          title={t('search.toggleSearch')}
        >
          <MagnifyingGlassIcon size={20} className="text-accent" />
        </Button>
        {isVideoCallsEnabled && (
          <Button
            onClick={onStartCall}
            variant="ghost"
            size="default"
            className="flex items-center gap-2 text-accent"
            disabled={isCreatingCall || !!activeCallChat}
            title={activeCallChat ? t('calls.leaveCurrentCallFirst') : t('calls.startACall')}
          >
            <PhoneIcon size={20} className="text-accent" />
            <span className="text-sm">{isCreatingCall ? t('calls.starting') : activeCallChat ? t('calls.inCall') : t('calls.call')}</span>
          </Button>
        )}
        {chat && chat.type === 'private' && chat.participants.length > 2 && (
          <Menu
            className="p-2 rounded font-medium transition-colors duration-75 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-(--color-text-primary) hover:bg-(--color-bg-hover)"
            trigger={
              <DotsThreeIcon weight="bold" size={20} className="text-accent" />
            }
            items={
              chat.created_by === currentUser?.id
                ? [{ label: t('chats.deleteChat'), onClick: onDeleteChat }]
                : [{ label: t('chats.leaveGroup'), onClick: onLeaveGroup }]
            }
          />
        )}
      </div>
    </div>
  );
}
