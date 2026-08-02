import { cn } from '@/utils/cn';

interface IconProps {
  /** Material Symbols ligature adı, örn. "dashboard", "auto_awesome". */
  name: string;
  /** Piksel cinsinden boyut. Tasarımda 14 / 16 / 18 / 20 / 24 / 28 kullanılır. */
  size?: number;
  /** Dolu (FILL 1) varyantı — aktif menü öğeleri için. */
  filled?: boolean;
  className?: string;
  'aria-hidden'?: boolean;
}

/**
 * Tasarımdaki Material Symbols Outlined ikon fontunun sarmalayıcısı.
 * Boyut inline `fontSize` ile verilir; Tailwind'in text-* ölçeği ikon
 * metriklerini bozduğu için tasarımda da bu yöntem kullanılmıştır.
 */
export function Icon({
  name,
  size = 24,
  filled = false,
  className,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <span
      aria-hidden={ariaHidden}
      className={cn('material-symbols-outlined shrink-0 leading-none', className)}
      style={{
        fontSize: `${size}px`,
        ...(filled ? { fontVariationSettings: "'FILL' 1" } : null),
      }}
    >
      {name}
    </span>
  );
}
