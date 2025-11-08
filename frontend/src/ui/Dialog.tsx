import { Dialog as BaseDialog } from '@base-ui-components/react/dialog';
import type { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Dialog({ open, onOpenChange, trigger, title, description, children, footer }: DialogProps) {
  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <BaseDialog.Trigger>{trigger}</BaseDialog.Trigger>}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 bg-black/50 z-50" />
        <BaseDialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg z-50 w-full max-w-md">
          <div className="p-6">
            <BaseDialog.Title className="text-lg font-semibold text-gray-900">{title}</BaseDialog.Title>
            {description && (
              <BaseDialog.Description className="mt-2 text-sm text-gray-500">
                {description}
              </BaseDialog.Description>
            )}
            <div className="mt-4">{children}</div>
            {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
          </div>
          <BaseDialog.Close className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </BaseDialog.Close>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
