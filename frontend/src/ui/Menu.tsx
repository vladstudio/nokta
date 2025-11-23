import { Menu as BaseMenu } from '@base-ui-components/react/menu';
import type { ReactNode } from 'react';
import { Card } from './Card';

interface MenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  icon?: ReactNode;
}

interface MenuProps {
  trigger: ReactNode;
  items: MenuItem[];
  className?: string;
}

export function Menu({ trigger, items, className = '' }: MenuProps) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger className={className}>{trigger}</BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner sideOffset={4}>
          <BaseMenu.Popup className="z-50 min-w-40">
            <Card shadow="lg" border className="py-1">
              {items.map((item, i) => (
                <BaseMenu.Item
                  key={i}
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className="px-4 py-2 cursor-pointer hover:bg-(--color-bg-hover) data-highlighted:bg-(--color-bg-hover) disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {item.icon}
                  {item.label}
                </BaseMenu.Item>
              ))}
            </Card>
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
