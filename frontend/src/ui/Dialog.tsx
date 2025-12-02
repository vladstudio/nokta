import { Dialog as BaseDialog } from '@base-ui-components/react/dialog';
import { XIcon } from '@phosphor-icons/react';
import type { ReactNode } from 'react';
import { Card } from './Card';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function Dialog({ open, onOpenChange, trigger, title, description, children, footer, maxWidth = 'md' }: DialogProps) {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <BaseDialog.Trigger>{trigger}</BaseDialog.Trigger>}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 bg-black/50 z-50" />
        <BaseDialog.Popup className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full ${maxWidthClass}`}>
          <Card shadow="lg" padding="lg" className="grid gap-4">
            <BaseDialog.Title className="text-lg font-semibold text-(--color-text-primary)">{title}</BaseDialog.Title>
            {description && (
              <BaseDialog.Description className="text-sm text-light">
                {description}
              </BaseDialog.Description>
            )}
            {children}
            {footer && <div className="flex justify-end gap-3">{footer}</div>}
          </Card>
          <BaseDialog.Close className="absolute top-4 right-4 text-light hover:text-(--color-text-primary)" aria-label="Close">
            <XIcon className="w-5 h-5" />
          </BaseDialog.Close>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
