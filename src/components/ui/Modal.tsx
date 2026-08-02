import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Alt aksiyon çubuğu. */
  footer?: ReactNode;
  /** Tailwind max-width sınıfı. Tasarımda form modalı `max-w-3xl`dir. */
  size?: 'sm' | 'md' | 'lg';
}

const SIZES = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-3xl' } as const;

/**
 * Erişilebilir modal:
 * - Escape ile kapanır, arka plana tıklayınca kapanır
 * - Açıkken gövde kaydırması kilitlenir
 * - Açılışta odak modala taşınır, kapanışta tetikleyiciye döner
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'lg',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    // Odağı modalın içindeki ilk odaklanabilir elemana taşı.
    const focusTimer = window.setTimeout(() => {
      const focusable = panelRef.current?.querySelector<HTMLElement>(
        'input, select, textarea, button, [href], [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = overflow;
      previouslyFocused.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm md:p-gutter"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={cn(
          'z-50 flex max-h-[90vh] w-full animate-scale-in flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-soft',
          SIZES[size],
        )}
      >
        <div className="flex items-start justify-between border-b border-outline-variant px-6 py-5">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">{title}</h2>
            {description && (
              <p className="mt-1 font-body-md text-body-md text-secondary">{description}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Kapat"
            onClick={onClose}
            className="rounded-lg p-2 text-secondary transition-colors hover:bg-surface-container-low hover:text-primary"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="scrollbar-thin flex-1 overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-4 border-t border-outline-variant px-6 py-5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
