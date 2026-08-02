import { cn } from '@/utils/cn';

interface ProgressBarProps {
  /** 0-100 arası tamamlanma yüzdesi. */
  value: number;
  label?: string;
  /** Sağda yüzde değerini göster. */
  showValue?: boolean;
  className?: string;
}

/**
 * İnce ilerleme çubuğu (DESIGN.md → Progress Indicators):
 * 4px yükseklik, yuvarlatılmış uçlar.
 */
export function ProgressBar({ value, label, showValue = true, className }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between">
          {label && <span className="font-label-sm text-label-sm text-secondary">{label}</span>}
          {showValue && (
            <span className="font-label-sm text-label-sm text-primary">%{Math.round(clamped)}</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-1 w-full overflow-hidden rounded-full bg-surface-container-high"
      >
        <div
          className="h-full rounded-full bg-primary-container transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
