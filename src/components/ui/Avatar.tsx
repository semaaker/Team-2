import { useState } from 'react';
import { cn } from '@/utils/cn';
import { initialsOf } from '@/utils/format';

interface AvatarProps {
  name: string;
  src?: string;
  /** Piksel cinsinden kenar uzunluğu. */
  size?: number;
  className?: string;
  /** Sağ altta çevrimiçi göstergesi. */
  online?: boolean;
}

/**
 * Profil görseli. Uzak görsel yüklenemezse (bağlantı kopuk, URL süresi dolmuş)
 * baş harflere düşer — böylece arayüzde asla kırık görsel ikonu çıkmaz.
 */
export function Avatar({ name, src, size = 40, className, online }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={cn('relative inline-flex shrink-0', className)}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          onError={() => setFailed(true)}
          className="h-full w-full rounded-full border border-outline-variant object-cover"
          loading="lazy"
        />
      ) : (
        <span
          aria-label={name}
          className="flex h-full w-full items-center justify-center rounded-full bg-secondary-container font-label-sm text-label-sm text-primary-container"
          style={{ fontSize: Math.max(10, size * 0.36) }}
        >
          {initialsOf(name)}
        </span>
      )}

      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-surface-container-lowest',
            online ? 'bg-success' : 'bg-outline-variant',
          )}
        />
      )}
    </span>
  );
}
