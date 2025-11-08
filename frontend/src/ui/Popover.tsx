import { Popover as BasePopover } from '@base-ui-components/react/popover';
import type { ReactNode } from 'react';
import { Card } from './Card';

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  title?: string;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function Popover({ trigger, children, title, open, defaultOpen, onOpenChange, className = '' }: PopoverProps) {
  return (
    <BasePopover.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
      <BasePopover.Trigger>{trigger}</BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner sideOffset={8}>
          <BasePopover.Popup className={`z-[100] max-w-xs ${className}`}>
            <Card shadow="lg" border padding="md">
              {title && <BasePopover.Title className="font-semibold text-gray-900 mb-2">{title}</BasePopover.Title>}
              {children}
            </Card>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
