import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  ProgressBar,
  SkeletonCardGrid,
  Tabs,
} from '@/components/ui';
import { PageHeader } from '@/components/features';
import { useQuery } from '@/hooks';
import { sponsorService } from '@/services';
import { SPONSORSHIP_STATUS_LABELS } from '@/utils/constants';
import type { BadgeTone } from '@/components/ui';
import type { SponsorshipStatus } from '@/types';

const FILTERS = [
  { id: '', label: 'Tümü' },
  { id: 'active', label: 'Aktif' },
  { id: 'negotiating', label: 'Görüşmede' },
  { id: 'completed', label: 'Tamamlandı' },
] as const;

const STATUS_TONE: Record<SponsorshipStatus, BadgeTone> = {
  active: 'success',
  negotiating: 'warning',
  completed: 'primary',
  cancelled: 'error',
};

/** "Sponsorluklarım" — sponsorun aktif ve geçmiş anlaşmaları. */
export function MySponsorshipsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('');

  const fetcher = useCallback(() => sponsorService.sponsorships(status), [status]);
  const { data, isLoading, error, refetch } = useQuery(fetcher);

  const sponsorships = data ?? [];

  return (
    <div className="mx-auto w-full max-w-container-max px-margin-mobile py-8 md:px-margin-desktop md:py-12">
      <PageHeader
        title="Sponsorluklarım"
        description="Devam eden ve tamamlanmış sponsorluk anlaşmalarınızı takip edin."
        className="mb-8"
      />

      <Tabs
        variant="pill"
        className="mb-8"
        items={FILTERS.map((filter) => ({ id: filter.id, label: filter.label }))}
        activeId={status}
        onChange={setStatus}
      />

      {isLoading && <SkeletonCardGrid count={4} />}

      {error && !isLoading && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && sponsorships.length === 0 && (
        <EmptyState
          icon="assignment"
          title={status ? 'Bu durumda sponsorluk yok' : 'Henüz sponsorluğunuz yok'}
          description={
            status
              ? 'Farklı bir durum filtresi seçerek diğer anlaşmalarınızı görüntüleyin.'
              : 'Yapay zeka eşleşmelerini inceleyerek ilk sponsorluk anlaşmanızı başlatın.'
          }
          action={
            status
              ? { label: 'Filtreyi Temizle', icon: 'refresh', onClick: () => setStatus('') }
              : {
                  label: 'Eşleşmeleri Gör',
                  icon: 'handshake',
                  onClick: () => navigate('/sponsor/eslesmeler'),
                }
          }
        />
      )}

      {!isLoading && !error && sponsorships.length > 0 && (
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2">
          {sponsorships.map((sponsorship) => (
            <Card key={sponsorship.id} className="flex flex-col gap-4" interactive>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="mb-1 font-headline-sm text-headline-sm text-primary">
                    {sponsorship.eventName}
                  </h2>
                  <p className="font-body-md text-body-md text-secondary">
                    {sponsorship.dateLabel} · {sponsorship.contactName}
                  </p>
                </div>
                <Badge tone={STATUS_TONE[sponsorship.status]} pill>
                  {SPONSORSHIP_STATUS_LABELS[sponsorship.status]}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-surface-variant py-4">
                <div>
                  <p className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                    Paket
                  </p>
                  <p className="font-label-md text-label-md text-primary">
                    {sponsorship.packageName}
                  </p>
                </div>
                <div>
                  <p className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                    Tutar
                  </p>
                  <p className="font-label-md text-label-md text-primary">
                    {sponsorship.amountLabel}
                  </p>
                </div>
              </div>

              <ProgressBar label="Teslimat İlerlemesi" value={sponsorship.progress} />

              <Button
                variant="secondary"
                fullWidth
                trailingIcon="arrow_forward"
                className="mt-2"
                onClick={() => navigate(`/sponsor/deal-room/${sponsorship.id}`)}
              >
                Deal Room&apos;u Aç
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
