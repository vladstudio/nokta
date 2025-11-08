import { Toast as BaseToast } from '@base-ui-components/react/toast';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

const typeStyles: Record<ToastType, string> = {
  info: 'border-blue-500 bg-blue-50',
  success: 'border-green-500 bg-green-50',
  warning: 'border-yellow-500 bg-yellow-50',
  error: 'border-red-500 bg-red-50',
};

function ToastList() {
  const { toasts } = BaseToast.useToastManager();
  return toasts.map((toast) => {
    const type = (toast.data?.type as ToastType) || 'info';
    return (
      <BaseToast.Root key={toast.id} toast={toast}>
        <div className={`border-l-4 rounded-lg shadow-lg p-4 bg-white ${typeStyles[type]}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {toast.title && <div className="font-medium text-gray-900">{toast.title}</div>}
              {toast.description && (
                <div className="mt-1 text-sm text-gray-600">{toast.description}</div>
              )}
            </div>
            <BaseToast.Close className="text-gray-400 hover:text-gray-600" aria-label="Close">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </BaseToast.Close>
          </div>
        </div>
      </BaseToast.Root>
    );
  });
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseToast.Provider timeout={3000}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 max-w-md">
          <ToastList />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

export const useToastManager = BaseToast.useToastManager;
