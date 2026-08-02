import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';
import { Spinner } from './Spinner';

/**
 * Tasarım sistemindeki buton varyantları (DESIGN.md → Components → Buttons):
 * - primary   : Deep Navy zemin, beyaz metin
 * - secondary : Şeffaf zemin, 1px Deep Navy kenarlık
 * - ghost     : Şeffaf zemin, Slate metin
 * - danger    : Yıkıcı işlemler için error rengi
 * - inverse   : Koyu kart üzerinde açık buton
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-container text-on-primary hover:bg-primary shadow-sm focus-visible:ring-primary-container',
  secondary:
    'bg-transparent border border-primary-container text-primary-container hover:bg-surface-container-low focus-visible:ring-primary-container',
  ghost:
    'bg-transparent text-secondary hover:bg-surface-container-low hover:text-primary focus-visible:ring-outline',
  danger: 'bg-error text-on-error hover:bg-on-error-container focus-visible:ring-error',
  inverse:
    'bg-surface-container-lowest text-primary hover:bg-surface-variant focus-visible:ring-primary-fixed-dim',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 gap-1.5',
  md: 'px-6 py-3 gap-2',
  lg: 'px-8 py-4 gap-2',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Yükleniyor durumunda buton kilitlenir ve spinner gösterilir. */
  isLoading?: boolean;
  /** Yükleniyorken gösterilecek metin; verilmezse çocuklar korunur. */
  loadingText?: string;
  /** Metnin solundaki Material Symbols ikonu. */
  leadingIcon?: string;
  /** Metnin sağındaki Material Symbols ikonu. */
  trailingIcon?: string;
  fullWidth?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    className,
    disabled,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg font-label-md text-label-md transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'active:scale-[0.98]',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <>
          <Spinner size={18} />
          <span>{loadingText ?? children}</span>
        </>
      ) : (
        <>
          {leadingIcon && <Icon name={leadingIcon} size={18} />}
          {children}
          {trailingIcon && <Icon name={trailingIcon} size={18} />}
        </>
      )}
    </button>
  );
});

/** Yalnızca ikon içeren, tablo/başlık aksiyonlarında kullanılan buton. */
export function IconButton({
  icon,
  label,
  className,
  size = 20,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: string; label: string; size?: number }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(
        'rounded p-1 text-primary-container transition-colors hover:bg-surface-variant',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...rest}
    >
      <Icon name={icon} size={size} />
    </button>
  );
}
