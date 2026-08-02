import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';

export type ToastVariant = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  title?: string;
}

const VARIANTS: Record<ToastVariant, { icon: string; accent: string; iconColor: string }> = {
  success: { icon: 'check_circle', accent: 'border-l-success', iconColor: 'text-success' },
  error: { icon: 'error', accent: 'border-l-error', iconColor: 'text-error' },
  info: { icon: 'info', accent: 'border-l-primary-container', iconColor: 'text-primary-container' },
};

/**
 * Bildirim yığını. Sağ altta konumlanır ve `ToastProvider` tarafından beslenir.
 * `aria-live` ile ekran okuyuculara duyurulur.
 */
export function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => {
        const variant = VARIANTS[toast.variant];
        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'pointer-events-auto flex animate-toast-in items-start gap-3 rounded-lg border border-l-4 border-outline-variant bg-surface-container-lowest p-4 shadow-soft',
              variant.accent,
            )}
          >
            <Icon name={variant.icon} size={20} className={cn('mt-0.5', variant.iconColor)} />
            <div className="min-w-0 flex-1">
              {toast.title && (
                <p className="font-label-md text-label-md font-semibold text-primary">
                  {toast.title}
                </p>
              )}
              <p className="font-body-md text-body-md text-on-surface-variant">{toast.message}</p>
            </div>
            <button
              type="button"
              aria-label="Bildirimi kapat"
              onClick={() => onDismiss(toast.id)}
              className="rounded p-1 text-secondary transition-colors hover:bg-surface-container-low hover:text-primary"
            >
              <Icon name="close" size={16} />
            </button>
          </div>
        );
      })}
    </div>,
    document.body,
  );
}
