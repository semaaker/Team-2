import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';
import { Button } from './Button';

/* -------------------------------------------------------------------------- */
/* Boş durum                                                                   */
/* -------------------------------------------------------------------------- */

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void; icon?: string };
  secondaryAction?: { label: string; onClick: () => void };
  className?: string;
}

/**
 * Veri yokken gösterilen durum ("Henüz Eşleşme Yok" ekranının karşılığı).
 * Tasarım diliyle uyumlu: yumuşak ikon kabı, başlık, açıklama ve tek bir CTA.
 */
export function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-16 text-center',
        className,
      )}
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low">
        <Icon name={icon} size={32} className="text-primary-container" />
      </div>
      <h3 className="mb-2 font-headline-sm text-headline-sm text-primary">{title}</h3>
      <p className="mb-8 max-w-md font-body-md text-body-md text-on-surface-variant">
        {description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button onClick={action.onClick} leadingIcon={action.icon}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Hata durumu                                                                 */
/* -------------------------------------------------------------------------- */

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/** Veri çekme başarısız olduğunda gösterilir; tekrar deneme sunar. */
export function ErrorState({
  title = 'Veriler yüklenemedi',
  message = 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-error-container bg-error-container/30 px-6 py-16 text-center',
        className,
      )}
    >
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error-container">
        <Icon name="cloud_off" size={32} className="text-on-error-container" />
      </div>
      <h3 className="mb-2 font-headline-sm text-headline-sm text-primary">{title}</h3>
      <p className="mb-8 max-w-md font-body-md text-body-md text-on-surface-variant">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} leadingIcon="refresh">
          Tekrar Dene
        </Button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* İskelet (skeleton)                                                          */
/* -------------------------------------------------------------------------- */

/** Yükleniyorken içeriğin yerini tutan gri blok. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'skeleton-shimmer relative overflow-hidden rounded bg-surface-container-high',
        className,
      )}
    />
  );
}

/** Kart ızgaralarının yükleniyor hâli. */
export function SkeletonCardGrid({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-surface-variant bg-surface-container-lowest"
        >
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Tabloların yükleniyor hâli. */
export function SkeletonRows({ rows = 4, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="divide-y divide-surface-variant">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex items-center gap-6 px-6 py-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className={cn('h-4', colIndex === 0 ? 'w-40' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Bileşik yardımcı                                                            */
/* -------------------------------------------------------------------------- */

interface AsyncBoundaryProps {
  isLoading: boolean;
  error: { message: string } | null;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingFallback?: ReactNode;
  emptyFallback?: ReactNode;
  children: ReactNode;
}

/**
 * Yükleniyor / hata / boş / içerik dallanmasını tek yerde toplar.
 * Sayfalarda tekrar eden `if (isLoading) ... if (error) ...` zincirini kaldırır.
 */
export function AsyncBoundary({
  isLoading,
  error,
  isEmpty = false,
  onRetry,
  loadingFallback,
  emptyFallback,
  children,
}: AsyncBoundaryProps) {
  if (isLoading) return <>{loadingFallback ?? <SkeletonCardGrid />}</>;
  if (error) return <ErrorState message={error.message} onRetry={onRetry} />;
  if (isEmpty && emptyFallback) return <>{emptyFallback}</>;
  return <>{children}</>;
}
