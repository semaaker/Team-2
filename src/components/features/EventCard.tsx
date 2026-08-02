import { useNavigate } from 'react-router-dom';
import { Badge, CoverImage, Icon } from '@/components/ui';
import { formatNumber, matchScoreTone } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { EventItem } from '@/types';

interface EventCardProps {
  event: EventItem;
  /** Kaydet ikonuna tıklandığında. Verilmezse ikon gösterilmez. */
  onToggleBookmark?: (event: EventItem) => void;
  /** Karta tıklanınca gidilecek yol. Varsayılan: etkinlik detayı. */
  href?: string;
  /**
   * Verilirse gezinme yerine bu geri çağırım çalışır (hızlı detay modalı).
   * Bookmark ikonu tıklaması buraya sızmaz.
   */
  onOpen?: (event: EventItem) => void;
}

/**
 * Keşfet ekranının etkinlik kartı.
 * Kapak görseli, tarih rozeti, AI uyum rozeti, kategori, paket etiketleri
 * ve AI notu — tasarımdaki sıralamayla birebir.
 */
export function EventCard({ event, onToggleBookmark, href, onOpen }: EventCardProps) {
  const navigate = useNavigate();
  const tone = matchScoreTone(event.aiMatchScore);
  const target = href ?? `/organizator/etkinlikler/${event.id}`;

  const open = () => (onOpen ? onOpen(event) : navigate(target));

  return (
    <article
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter') open();
      }}
      role="link"
      tabIndex={0}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container"
    >
      <div className="relative h-48 w-full bg-surface-container">
        <CoverImage
          src={event.coverImageUrl}
          alt={event.name}
          className="h-full w-full"
          fallbackIcon="event"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded border border-outline-variant bg-surface-container-lowest/90 px-2 py-1 font-label-sm text-label-sm text-primary backdrop-blur">
            {event.dateLabel}
          </span>
          <span
            className={cn(
              'flex items-center gap-1 rounded border px-2 py-1 font-label-sm text-label-sm',
              tone.chip,
            )}
          >
            🤖 %{event.aiMatchScore} Uyum
          </span>
        </div>
      </div>

      <div className="flex flex-grow flex-col p-6">
        <div className="mb-2 flex items-start justify-between gap-2">
          <Badge tone="neutral">{event.category}</Badge>
          {onToggleBookmark && (
            <button
              type="button"
              aria-label={event.bookmarked ? 'Kaydı kaldır' : 'Kaydet'}
              aria-pressed={event.bookmarked}
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark(event);
              }}
              className="rounded p-1 text-secondary transition-colors hover:text-primary"
            >
              <Icon
                name={event.bookmarked ? 'bookmark' : 'bookmark_border'}
                filled={event.bookmarked}
              />
            </button>
          )}
        </div>

        <h3 className="mb-2 line-clamp-2 font-headline-sm text-headline-sm text-primary">
          {event.name}
        </h3>
        <p className="mb-4 line-clamp-2 font-body-md text-body-md text-secondary">
          {event.description}
        </p>

        <div className="mt-auto">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-label-md text-label-md font-semibold text-primary">
              {event.attendeesLabel || `${formatNumber(event.attendees)}+`}
            </span>
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-secondary">
              <Icon name="location_on" size={16} />
              {event.location}
            </span>
          </div>

          {event.packages.length > 0 && (
            <>
              <p className="mb-1 mt-6 text-[12px] font-medium text-secondary/70">Paket Türleri:</p>
              <div className="mb-4 flex flex-wrap gap-2">
                {event.packages.slice(0, 2).map((pkg, index) => (
                  <span
                    key={pkg.id}
                    className={cn(
                      'rounded px-2 py-1 font-label-sm text-label-sm',
                      index === 0
                        ? 'bg-primary-container text-on-primary-container'
                        : 'bg-surface-container text-on-surface',
                    )}
                  >
                    {pkg.name} ({pkg.priceLabel})
                  </span>
                ))}
                {event.packages.length > 2 && (
                  <span className="rounded bg-surface-container px-2 py-1 font-label-sm text-label-sm text-on-surface">
                    +{event.packages.length - 2}
                  </span>
                )}
              </div>
            </>
          )}

          {event.aiNote && (
            <p className="border-t border-outline-variant pt-3 text-[12px] italic text-secondary/70">
              *Yapay Zeka Notu: {event.aiNote}*
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
