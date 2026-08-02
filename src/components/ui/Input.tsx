import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  /** Alanın solunda gösterilecek Material Symbols ikonu. */
  icon?: string;
  /** Doğrulama hatası — alan kırmızıya döner ve mesaj altta gösterilir. */
  error?: string;
  /** Hata yokken altta gösterilecek yardımcı metin. */
  hint?: string;
  /** Etiketin sağındaki aksiyon (örn. "Şifremi Unuttum"). */
  labelAction?: React.ReactNode;
}

/**
 * Tasarımdaki input alanı:
 * beyaz zemin, 1px #E2E8F0 kenarlık, odakta Deep Navy kenarlık + Ice Blue hâle.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, icon, error, hint, labelAction, className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex w-full flex-col gap-2">
      {(label || labelAction) && (
        <div className="flex items-center justify-between">
          {label && (
            <label htmlFor={inputId} className="font-label-md text-label-md text-on-surface">
              {label}
            </label>
          )}
          {labelAction}
        </div>
      )}

      <div className="relative">
        {icon && (
          <Icon
            name={icon}
            size={20}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={cn(
            'w-full rounded-lg border bg-surface-container-lowest py-3 font-body-md text-body-md text-on-surface transition-all',
            'placeholder:text-outline-variant',
            'focus:outline-none focus:ring-2',
            icon ? 'pl-10 pr-4' : 'px-4',
            error
              ? 'border-error focus:border-error focus:ring-error-container'
              : 'border-outline-variant focus:border-primary-container focus:ring-primary-fixed-dim',
            'disabled:cursor-not-allowed disabled:bg-surface-container-low disabled:text-secondary',
            className,
          )}
          {...rest}
        />
      </div>

      {error ? (
        <p
          id={`${inputId}-error`}
          className="flex items-center gap-1 font-label-sm text-label-sm text-error"
        >
          <Icon name="error" size={14} />
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="font-label-sm text-label-sm text-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
