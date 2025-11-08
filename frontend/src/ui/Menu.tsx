import { Menu as BaseMenu } from '@base-ui-components/react/menu';
import type { ReactNode } from 'react';

interface MenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
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
          <BaseMenu.Popup className="bg-white border border-gray-300 rounded-lg shadow-lg py-1 z-50 min-w-[160px]">
            {items.map((item, i) => (
              <BaseMenu.Item
                key={i}
                onClick={item.onClick}
                disabled={item.disabled}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 data-highlighted:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {item.label}
              </BaseMenu.Item>
            ))}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
