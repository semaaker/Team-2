import { useNavigate } from 'react-router-dom';
import { Badge, Button, Icon, LoadingState, Modal, ErrorState } from '@/components/ui';
import { useQuery } from '@/hooks';
import { eventService } from '@/services';
import { useCallback } from 'react';

interface EventDetailModalProps {
  /** Açık modalın etkinlik kimliği; `null` ise modal kapalıdır. */
  eventId: string | null;
  onClose: () => void;
}

/**
 * "Etkinliklerim" listesindeki karta tıklandığında açılan hızlı detay modalı.
 * Veriyi `GET /api/events/:id` ucundan çeker; tam sayfaya geçiş sunar.
 */
export function EventDetailModal({ eventId, onClose }: EventDetailModalProps) {
  const navigate = useNavigate();

  const fetcher = useCallback(() => eventService.byId(eventId as string), [eventId]);
  const {
    data: event,
    isLoading,
    error,
    refetch,
  } = useQuery(fetcher, { enabled: Boolean(eventId) });

  return (
    <Modal
      open={Boolean(eventId)}
      onClose={onClose}
      title="Etkinlik Detayı"
      description={event?.name}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Kapat
          </Button>
          {event && (
            <Button
              trailingIcon="arrow_forward"
              onClick={() => {
                onClose();
                navigate(`/organizator/etkinlikler/${event.id}`);
              }}
            >
              Tüm Detayları Aç
            </Button>
          )}
        </>
      }
    >
      <div className="p-6 md:p-8">
        {isLoading && <LoadingState label="Etkinlik yükleniyor..." />}

        {error && <ErrorState message={error.message} onRetry={refetch} />}

        {event && !isLoading && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{event.category}</Badge>
              <Badge tone="primary" icon="auto_awesome">
                %{event.aiMatchScore} Uyum
              </Badge>
              <Badge tone="success" dotClassName="bg-success">
                {event.status === 'seeking' ? 'Aktif Sponsor Arayışı' : 'Kapalı'}
              </Badge>
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <DetailStat icon="calendar_today" label="Tarih" value={event.dateLabel} />
              <DetailStat icon="groups" label="Katılımcı" value={event.attendeesLabel} />
              <DetailStat
                icon="description"
                label="Toplam Teklif"
                value={String(event.proposalCount)}
              />
            </dl>

            <div>
              <h4 className="mb-2 font-label-md text-label-md uppercase tracking-wider text-secondary">
                Açıklama
              </h4>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {event.description}
              </p>
            </div>

            {event.packages.length > 0 && (
              <div>
                <h4 className="mb-2 font-label-md text-label-md uppercase tracking-wider text-secondary">
                  Sponsorluk Paketleri
                </h4>
                <div className="flex flex-wrap gap-2">
                  {event.packages.map((pkg) => (
                    <Badge key={pkg.id} tone="primary">
                      {pkg.name} — {pkg.priceLabel}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {event.aiNote && (
              <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                <p className="flex items-start gap-2 font-body-md text-body-md italic text-on-surface-variant">
                  <Icon name="auto_awesome" size={18} className="mt-0.5 text-primary-container" />
                  {event.aiNote}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailStat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-surface-variant bg-surface-container-low p-4">
      <Icon name={icon} size={20} className="mt-0.5 text-primary-container" />
      <div>
        <dt className="font-label-sm text-label-sm text-secondary">{label}</dt>
        <dd className="font-headline-sm text-headline-sm text-primary">{value}</dd>
      </div>
    </div>
  );
}
