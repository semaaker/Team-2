import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  icon?: string;
  error?: string;
  hint?: string;
  options: readonly SelectOption[];
  /** İlk (disabled) seçenek metni. */
  placeholder?: string;
}

/** Tasarımdaki açılır liste: sol ikon, sağda `expand_more` göstergesi. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, icon, error, hint, options, placeholder = 'Seçiniz', className, id, ...rest },
  ref,
) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label htmlFor={selectId} className="font-label-md text-label-md text-on-surface">
          {label}
        </label>
      )}

      <div
        className={cn(
          'group relative rounded-lg border bg-surface-container-lowest transition-all',
          error
            ? 'border-error focus-within:ring-2 focus-within:ring-error-container'
            : 'border-outline-variant focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-fixed-dim',
        )}
      >
        {icon && (
          <Icon
            name={icon}
            size={20}
            className="pointer-events-none absolute inset-y-0 left-3 my-auto h-fit text-secondary group-focus-within:text-primary-container"
          />
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={Boolean(error) || undefined}
          className={cn(
            'block w-full appearance-none rounded-lg border-none bg-transparent py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-0',
            icon ? 'pl-10 pr-10' : 'pl-4 pr-10',
            className,
          )}
          {...rest}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="expand_more"
          size={20}
          className="pointer-events-none absolute inset-y-0 right-3 my-auto h-fit text-secondary"
        />
      </div>

      {error ? (
        <p className="flex items-center gap-1 font-label-sm text-label-sm text-error">
          <Icon name="error" size={14} />
          {error}
        </p>
      ) : hint ? (
        <p className="font-label-sm text-label-sm text-secondary">{hint}</p>
      ) : null}
    </div>
  );
});

/** Tablo hücrelerinde kullanılan kompakt durum seçici. */
export function InlineSelect({
  options,
  className,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { options: readonly SelectOption[] }) {
  return (
    <select
      className={cn(
        'w-full cursor-pointer rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1 font-label-sm text-label-sm text-primary-container transition-all',
        'focus:outline-none focus:ring-2 focus:ring-primary-container',
        'disabled:cursor-wait disabled:opacity-60',
        className,
      )}
      {...rest}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
