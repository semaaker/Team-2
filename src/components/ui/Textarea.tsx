import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/** Çok satırlı metin alanı — Input ile aynı kenarlık ve odak davranışı. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, rows = 4, ...rest },
  ref,
) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;

  return (
    <div className="flex w-full flex-col gap-2">
      {label && (
        <label htmlFor={textareaId} className="font-label-md text-label-md text-on-surface">
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={Boolean(error) || undefined}
        className={cn(
          'w-full resize-y rounded-lg border bg-surface-container-lowest p-3 font-body-md text-body-md text-on-surface transition-all',
          'placeholder:text-outline-variant focus:outline-none focus:ring-2',
          error
            ? 'border-error focus:border-error focus:ring-error-container'
            : 'border-outline-variant focus:border-primary-container focus:ring-primary-fixed-dim',
          className,
        )}
        {...rest}
      />

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
