import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

const TONES: Record<BadgeTone, string> = {
  neutral: 'bg-surface-container-low text-on-surface border-outline-variant',
  primary: 'bg-ice-blue text-primary-container border-transparent',
  success: 'bg-success-bg text-success border-emerald-200',
  warning: 'bg-amber-100 text-amber-800 border-amber-200',
  error: 'bg-error-container text-on-error-container border-transparent',
  info: 'bg-[#e0f2fe] text-[#0284c7] border-transparent',
};

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  icon?: string;
  /** Tam yuvarlak (pill) görünüm. */
  pill?: boolean;
  /** Solda yanıp sönen durum noktası. */
  dotClassName?: string;
  className?: string;
}

/** Durum, kategori ve AI skoru rozetleri (DESIGN.md → Chips & Tags). */
export function Badge({
  children,
  tone = 'neutral',
  icon,
  pill = false,
  dotClassName,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-1 font-label-sm text-label-sm',
        pill ? 'rounded-full' : 'rounded',
        TONES[tone],
        className,
      )}
    >
      {dotClassName && <span className={cn('h-2 w-2 rounded-full', dotClassName)} />}
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}

/** Ice Blue zeminli kategori etiketi. */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-surface-container-low px-3 py-1 font-label-sm text-label-sm text-primary',
        className,
      )}
    >
      {children}
    </span>
  );
}
