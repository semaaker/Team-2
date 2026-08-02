import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { APP_NAME } from '@/utils/constants';
import logoUrl from '@/assets/logo.svg';

interface LogoProps {
  /** Logo karesinin piksel boyutu. */
  size?: number;
  /** Marka adını gizle (yalnızca işaret). */
  hideWordmark?: boolean;
  /** Metnin tipografi ölçeği. */
  scale?: 'sm' | 'md';
  /** Verilirse logo bu adrese bağlanır. */
  to?: string;
  className?: string;
}

/**
 * Marka kilidi. Görsel yerel bir SVG'dir — dış CDN'e bağımlı değildir,
 * böylece bağlantı olmayan ortamlarda da marka bozulmaz.
 */
export function Logo({ size = 32, hideWordmark = false, scale = 'md', to, className }: LogoProps) {
  const content = (
    <span className={cn('flex items-center gap-2', className)}>
      <img
        src={logoUrl}
        alt={hideWordmark ? APP_NAME : ''}
        width={size}
        height={size}
        className="shrink-0 object-contain"
        style={{ width: size, height: size }}
      />
      {!hideWordmark && (
        <span
          className={cn(
            'font-bold text-primary',
            scale === 'sm' ? 'text-label-md' : 'text-headline-md',
          )}
        >
          {APP_NAME}
        </span>
      )}
    </span>
  );

  if (to) {
    return (
      <Link
        to={to}
        className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
      >
        {content}
      </Link>
    );
  }

  return content;
}
