import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  /** Kart görünümü — "Yeni Etkinlik Ekle" formundaki paket seçicileri gibi. */
  boxed?: boolean;
}

/** Onay kutusu. `boxed` modunda tasarımdaki kart tarzı seçici olur. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, boxed = false, className, ...rest },
  ref,
) {
  return (
    <label
      className={cn(
        'group flex cursor-pointer items-center transition-colors',
        boxed
          ? 'relative rounded-lg border border-outline-variant bg-surface-container-lowest p-3 hover:bg-surface-container-low'
          : 'gap-3',
        rest.disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          'h-5 w-5 shrink-0 cursor-pointer rounded-sm border-outline bg-surface-container-lowest text-primary-container',
          'focus:ring-2 focus:ring-primary-container focus:ring-offset-surface-container-lowest',
          'disabled:cursor-not-allowed',
        )}
        {...rest}
      />
      <span
        className={cn(
          'font-label-md text-label-md text-primary group-hover:text-primary-container',
          boxed ? 'ml-2' : '',
        )}
      >
        {label}
      </span>
    </label>
  );
});
