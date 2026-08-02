import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 24px iç boşluk (tasarım standardı). `false` ise padding'i siz verirsiniz. */
  padded?: boolean;
  /** Yumuşak ortam gölgesi (Elevation Level 2). */
  elevated?: boolean;
  /** Hover'da gölgenin artması. */
  interactive?: boolean;
  children: ReactNode;
}

/**
 * Tasarım sistemindeki temel kart yüzeyi:
 * beyaz zemin, 1px #E2E8F0 kenarlık, 16px köşe, gölgesiz taban.
 */
export function Card({
  padded = true,
  elevated = true,
  interactive = false,
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-surface-variant bg-surface-container-lowest',
        padded && 'p-6',
        elevated && 'shadow-soft',
        interactive && 'transition-all hover:shadow-md',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/** Kart başlığı — sol tarafta başlık, sağda opsiyonel aksiyon. */
export function CardHeader({
  title,
  action,
  className,
}: {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between border-b border-surface-variant bg-inverse-on-surface px-6 py-5',
        className,
      )}
    >
      <h3 className="font-headline-sm text-headline-sm text-primary">{title}</h3>
      {action}
    </div>
  );
}
