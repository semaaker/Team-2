import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { ToastViewport, type Toast, type ToastVariant } from '@/components/ui/Toast';

/**
 * Global bildirim (toast) yönetimi.
 * Form gönderimleri, durum değişiklikleri ve hata geri bildirimleri için.
 */
interface ToastContextValue {
  toasts: Toast[];
  notify: (message: string, variant?: ToastVariant, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (message: string, variant: ToastVariant = 'info', title?: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      setToasts((prev) => [...prev, { id, message, variant, title }]);
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      notify,
      dismiss,
      success: (message, title) => notify(message, 'success', title),
      error: (message, title) => notify(message, 'error', title),
      info: (message, title) => notify(message, 'info', title),
    }),
    [toasts, notify, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast, ToastProvider içinde kullanılmalıdır.');
  return context;
}
