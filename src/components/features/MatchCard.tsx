import { Button, Chip, CoverImage, Icon } from '@/components/ui';
import { cn } from '@/utils/cn';
import { matchScoreTone } from '@/utils/format';
import type { MatchItem } from '@/types';

interface MatchCardProps {
  match: MatchItem;
  onReview: (match: MatchItem) => void;
}

/**
 * Sponsor tarafındaki "Yapay Zeka Eşleşmeleri" kartı.
 * Kapak üzerinde canlı skor rozeti, altında katılımcı/sektör ızgarası
 * ve kategori etiketleri bulunur.
 */
export function MatchCard({ match, onReview }: MatchCardProps) {
  const tone = matchScoreTone(match.matchScore);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest transition-all duration-300 hover:shadow-md ai-glow">
      <div className="relative h-48 overflow-hidden">
        <CoverImage
          src={match.coverImageUrl}
          alt={match.eventName}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
          fallbackIcon="celebration"
        />
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full border border-primary/10 bg-white/90 px-3 py-1.5 backdrop-blur-md">
          <span
            className={cn(
              'h-2 w-2 rounded-full',
              tone.dot,
              match.matchScore >= 90 && 'animate-pulse',
            )}
          />
          <span className="font-label-sm text-label-sm text-primary">
            {match.matchScore}% AI Match
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-4">
          <h3 className="mb-1 font-headline-sm text-headline-sm text-tertiary">
            {match.eventName}
          </h3>
          <div className="flex items-center gap-4 text-secondary">
            <span className="flex items-center gap-1">
              <Icon name="calendar_today" size={18} />
              <span className="text-label-sm">{match.dateLabel}</span>
            </span>
            <span className="flex items-center gap-1">
              <Icon name="location_on" size={18} />
              <span className="text-label-sm">{match.location}</span>
            </span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4 border-y border-outline-variant py-4">
          <div>
            <span className="mb-1 block text-label-sm uppercase tracking-wider text-secondary">
              Katılımcı
            </span>
            <span className="font-headline-sm text-headline-sm text-primary">
              {match.attendeesLabel}
            </span>
          </div>
          <div>
            <span className="mb-1 block text-label-sm uppercase tracking-wider text-secondary">
              Sektör
            </span>
            <span className="font-headline-sm text-headline-sm text-primary">{match.industry}</span>
          </div>
        </div>

        <div className="mb-6">
          <span className="mb-2 block text-label-sm uppercase tracking-wider text-secondary">
            Ana Kategoriler
          </span>
          <div className="flex flex-wrap gap-2">
            {match.categories.slice(0, 2).map((category) => (
              <Chip key={category}>{category}</Chip>
            ))}
            {match.categories.length > 2 && <Chip>+{match.categories.length - 2} Diğer</Chip>}
          </div>
        </div>

        {/* Skorun gerekçesi — yapay zeka motorundan gelen not. */}
        {match.aiNote && (
          <div className="mb-6 flex gap-2 rounded-lg bg-surface-container-low p-3">
            <Icon name="auto_awesome" size={18} className="mt-0.5 shrink-0 text-primary" />
            <p className="text-label-sm leading-relaxed text-secondary">{match.aiNote}</p>
          </div>
        )}

        {match.breakdown && match.breakdown.length > 0 && (
          <ul className="mb-6 space-y-1.5">
            {match.breakdown.map((item) => (
              <li key={item.label} className="flex items-center gap-3">
                <span className="w-40 shrink-0 text-label-sm text-secondary">{item.label}</span>
                <span
                  className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-variant"
                  role="img"
                  aria-label={`${item.label}: ${item.max} puan üzerinden ${item.earned}`}
                >
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${Math.round((item.earned / item.max) * 100)}%` }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right text-label-sm tabular-nums text-secondary">
                  {item.earned}/{item.max}
                </span>
              </li>
            ))}
          </ul>
        )}

        <Button
          variant="secondary"
          fullWidth
          className="mt-auto border-primary text-primary hover:bg-primary hover:text-on-primary"
          onClick={() => onReview(match)}
        >
          Detayları İncele
        </Button>
      </div>
    </div>
  );
}
