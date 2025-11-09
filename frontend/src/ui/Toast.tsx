import { Toast as BaseToast } from '@base-ui-components/react/toast';
import { XIcon } from '@phosphor-icons/react';
import { Card } from './Card';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

const typeStyles: Record<ToastType, string> = {
  info: 'bg-(--color-primary-50)',
  success: 'bg-(--color-success-50)',
  warning: 'bg-yellow-50',
  error: 'bg-(--color-error-50)',
};

function ToastList() {
  const { toasts } = BaseToast.useToastManager();
  return toasts.map((toast) => {
    const type = (toast.data?.type as ToastType) || 'info';
    return (
      <BaseToast.Root key={toast.id} toast={toast}>
        <Card shadow="lg" padding="md" className={typeStyles[type]}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {toast.title && <div className="font-medium text-(--color-text-primary)">{toast.title}</div>}
              {toast.description && (
                <div className="mt-1 text-sm text-light">{toast.description}</div>
              )}
            </div>
            <BaseToast.Close className="text-light hover:text-(--color-text-primary)" aria-label="Close">
              <XIcon className="w-4 h-4" />
            </BaseToast.Close>
          </div>
        </Card>
      </BaseToast.Root>
    );
  });
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseToast.Provider timeout={3000}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className="fixed top-4 left-1/2 -translate-x-1/2 flex flex-col gap-2 z-50 max-w-md">
          <ToastList />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

export const useToastManager = BaseToast.useToastManager;
