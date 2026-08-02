import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card, CoverImage, ErrorState, Icon, LoadingState } from '@/components/ui';
import { useQuery } from '@/hooks';
import { eventService } from '@/services';
import { useAuth, useToast } from '@/store';

/**
 * Herkese açık etkinlik detay sayfası.
 * Keşfet ve sponsor eşleşmelerinden buraya gelinir; sponsorluk başvurusu
 * için giriş gerekir.
 */
export function PublicEventDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  const fetcher = useCallback(() => eventService.byId(id), [id]);
  const { data, isLoading, error, refetch } = useQuery(fetcher, { enabled: Boolean(id) });

  function handleApply() {
    if (!isAuthenticated) {
      toast.info('Sponsorluk başvurusu için önce giriş yapın.');
      navigate('/giris');
      return;
    }
    toast.success('Başvurunuz organizatöre iletildi.', 'Teklif gönderildi');
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
        <LoadingState label="Etkinlik yükleniyor..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
        <ErrorState
          title="Etkinlik bulunamadı"
          message={error?.message ?? 'Bu etkinlik yayından kaldırılmış olabilir.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-container-max px-margin-mobile py-8 md:px-margin-desktop md:py-12">
      {/* Kapak */}
      <div className="relative mb-8 h-64 overflow-hidden rounded-2xl border border-surface-variant md:h-80">
        <CoverImage
          src={data.coverImageUrl}
          alt={data.name}
          className="h-full w-full"
          fallbackIcon="event"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge tone="neutral" className="bg-surface-container-lowest/90 backdrop-blur">
              {data.dateLabel}
            </Badge>
            <Badge tone="success" className="bg-surface-container-lowest/90 backdrop-blur">
              🤖 %{data.aiMatchScore} Uyum
            </Badge>
          </div>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-primary md:font-display-lg md:text-display-lg">
            {data.name}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <div className="flex flex-col gap-gutter lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-headline-md text-headline-md text-primary">
              Etkinlik Hakkında
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant">{data.description}</p>
          </Card>

          <Card>
            <h2 className="mb-4 font-headline-sm text-headline-sm text-primary">
              Sponsorluk Paketleri
            </h2>
            {data.packages.length === 0 ? (
              <p className="font-body-md text-body-md text-secondary">
                Bu etkinlik için henüz paket tanımlanmamış.
              </p>
            ) : (
              <ul className="divide-y divide-surface-variant">
                {data.packages.map((pkg) => (
                  <li key={pkg.id} className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-label-md text-label-md font-semibold text-primary">
                        {pkg.name}
                      </p>
                      <p className="font-label-sm text-label-sm text-secondary">
                        {pkg.tier} seviye
                      </p>
                    </div>
                    <span className="font-headline-sm text-headline-sm text-primary-container">
                      {pkg.priceLabel}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <Card className="flex h-fit flex-col gap-6">
          <dl className="space-y-4">
            <FactRow icon="calendar_today" label="Tarih" value={data.dateLabel} />
            <FactRow icon="location_on" label="Konum" value={data.location} />
            <FactRow icon="groups" label="Katılımcı" value={data.attendeesLabel} />
            <FactRow icon="category" label="Kategori" value={data.category} />
            <FactRow icon="person" label="Organizatör" value={data.organizerName} />
          </dl>

          <Button fullWidth leadingIcon="handshake" onClick={handleApply}>
            Sponsorluk Başvurusu Yap
          </Button>

          {data.aiNote && (
            <p className="flex items-start gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-4 font-label-sm text-label-sm italic text-on-surface-variant">
              <Icon name="auto_awesome" size={16} className="mt-0.5 text-primary-container" />
              {data.aiNote}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

function FactRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon name={icon} size={20} className="mt-0.5 text-primary-container" />
      <div className="min-w-0">
        <dt className="font-label-sm text-label-sm text-secondary">{label}</dt>
        <dd className="font-label-md text-label-md text-primary">{value}</dd>
      </div>
    </div>
  );
}
