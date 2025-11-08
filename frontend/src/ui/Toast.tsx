import { Toast as BaseToast } from '@base-ui-components/react/toast';
import type { ReactNode } from 'react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  type?: ToastType;
  action?: ReactNode;
}

const typeStyles: Record<ToastType, string> = {
  info: 'border-blue-500 bg-blue-50',
  success: 'border-green-500 bg-green-50',
  warning: 'border-yellow-500 bg-yellow-50',
  error: 'border-red-500 bg-red-50',
};

export function Toast({ open, onOpenChange, title, description, type = 'info', action }: ToastProps) {
  return (
    <BaseToast.Provider>
      <BaseToast.Root open={open} onOpenChange={onOpenChange}>
        <BaseToast.Title>{title}</BaseToast.Title>
        {description && <BaseToast.Description>{description}</BaseToast.Description>}
        {action && <BaseToast.Action>{action}</BaseToast.Action>}
        <BaseToast.Close />
      </BaseToast.Root>
      <BaseToast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 max-w-md">
        {(toasts) =>
          toasts.map((toast) => (
            <div
              key={toast.id}
              className={`border-l-4 rounded-lg shadow-lg p-4 ${typeStyles[type]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{toast.title}</div>
                  {toast.description && (
                    <div className="mt-1 text-sm text-gray-600">{toast.description}</div>
                  )}
                </div>
                {toast.action}
                <button
                  onClick={() => toast.close()}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        }
      </BaseToast.Viewport>
    </BaseToast.Provider>
  );
}
