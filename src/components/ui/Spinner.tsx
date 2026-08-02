import { cn } from '@/utils/cn';

interface SpinnerProps {
  size?: number;
  className?: string;
  label?: string;
}

/** Buton içi ve sayfa seviyesi yükleniyor göstergesi. */
export function Spinner({ size = 20, className, label = 'Yükleniyor' }: SpinnerProps) {
  return (
    <svg
      className={cn('animate-spin', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label={label}
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/** Sayfa/panel ortasında kullanılan tam alan yükleniyor durumu. */
export function LoadingState({ label = 'Yükleniyor...' }: { label?: string }) {
  return (
    <div className="flex min-h-[240px] w-full flex-col items-center justify-center gap-3 py-16">
      <Spinner size={28} className="text-primary-container" />
      <p className="font-label-md text-label-md text-secondary">{label}</p>
    </div>
  );
}
