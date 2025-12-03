import { memo } from 'react';
import { Button, Badge, OnlineIndicator } from '../ui';

interface SidebarItemProps {
  icon?: React.ReactNode;
  avatar?: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: number;
  isOnline?: boolean | null;
  isSelected: boolean;
  onClick: () => void;
  action?: React.ReactNode;
}

export const SidebarItem = memo(function SidebarItem({
  icon,
  avatar,
  title,
  subtitle,
  badge,
  isOnline,
  isSelected,
  onClick,
  action,
}: SidebarItemProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        onClick={onClick}
        isSelected={isSelected}
        variant="ghost"
        className="flex-1 p-2! text-left flex items-center gap-2 min-w-0"
      >
        {icon && <div className="shrink-0">{icon}</div>}
        {avatar && (
          <div className="relative shrink-0">
            {avatar}
            {isOnline !== null && isOnline !== undefined && (
              <OnlineIndicator isOnline={isOnline} className="absolute! bottom-0 right-0" />
            )}
          </div>
        )}
        <div className="flex-1 grid min-w-0">
          <div className={`text-sm truncate ${badge ? 'font-semibold' : 'font-medium'} text-(--color-text-primary)`}>
            {title}
          </div>
          {subtitle && <div className="text-xs text-light truncate mt-0.5">{subtitle}</div>}
        </div>
        {badge !== undefined && badge > 0 && (
          <div className="shrink-0">
            <Badge variant="unread">{badge > 99 ? '99+' : badge}</Badge>
          </div>
        )}
      </Button>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
});
