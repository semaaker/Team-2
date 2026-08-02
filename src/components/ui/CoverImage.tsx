import { useState } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from './Icon';

interface CoverImageProps {
  src?: string;
  alt: string;
  className?: string;
  /** Görsel yüklenemezse gösterilecek ikon. */
  fallbackIcon?: string;
}

/**
 * Etkinlik kartlarının kapak görseli.
 *
 * Tasarımdaki kapaklar uzak CDN URL'lerinden gelir; erişilemediğinde tasarım
 * paletiyle uyumlu bir degrade + ikon gösterilerek düzenin bozulması önlenir.
 */
export function CoverImage({ src, alt, className, fallbackIcon = 'image' }: CoverImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-surface-container-low to-secondary-container',
          className,
        )}
        role="img"
        aria-label={alt}
      >
        <Icon name={fallbackIcon} size={40} className="text-primary-container opacity-40" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  );
}
