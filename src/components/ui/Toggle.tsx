import { useId } from 'react';
import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Görsel etiket. Verilmezse `aria-label` zorunludur. */
  label?: string;
  description?: string;
  disabled?: boolean;
  /** Sunucuya yazma sürerken anahtarı kilitler. */
  isPending?: boolean;
  'aria-label'?: string;
}

/**
 * Ayarlar ekranlarındaki aç/kapa anahtarı.
 * Etiket + açıklama ile birlikte satır düzeninde kullanılabilir.
 */
export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  isPending = false,
  'aria-label': ariaLabel,
}: ToggleProps) {
  const id = useId();
  const isDisabled = disabled || isPending;

  const control = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ? undefined : ariaLabel}
      disabled={isDisabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2',
        checked ? 'bg-primary-container' : 'bg-surface-container-highest',
        isDisabled && 'cursor-not-allowed opacity-60',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-surface-container-lowest shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
      {isPending && (
        <Spinner size={12} className="absolute -right-6 text-secondary" label="Kaydediliyor" />
      )}
    </button>
  );

  if (!label && !description) return control;

  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">
        {label && (
          <label
            htmlFor={id}
            className="block cursor-pointer font-label-md text-label-md font-semibold text-primary"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="mt-1 font-body-md text-body-md text-on-surface-variant">{description}</p>
        )}
      </div>
      {control}
    </div>
  );
}
