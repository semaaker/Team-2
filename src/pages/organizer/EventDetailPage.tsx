import { useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, Button, Card, ErrorState, Icon, LoadingState, SkeletonRows } from '@/components/ui';
import { PageHeader, ProposalTable } from '@/components/features';
import { useMutation, useQuery } from '@/hooks';
import { aiService, eventService } from '@/services';
import { useToast } from '@/store';

/**
 * Etkinlik detay sayfası.
 * Özet kartları + bu etkinliğe gelen sponsorluk teklifleri tablosu.
 */
export function EventDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const toast = useToast();

  const eventFetcher = useCallback(() => eventService.byId(id), [id]);
  const event = useQuery(eventFetcher, { enabled: Boolean(id) });

  const proposalsFetcher = useCallback(() => eventService.proposals(id), [id]);
  const proposals = useQuery(proposalsFetcher, { enabled: Boolean(id) });

  /**
   * Etkinliğin sponsor havuzu genelindeki uyum skorunu yeniden hesaplatır.
   * Sunucu skoru etkinliğe kaydeder, biz de tazelenmiş kaydı çekeriz.
   */
  const analyze = useMutation(() => aiService.analyzeEvent(id), {
    onSuccess: (result) => {
      event.refetch();
      toast.success(
        result.topSponsor
          ? `Ortalama uyum %${result.score}. En yüksek uyum: ${result.topSponsor.name} (%${result.topSponsor.score}).`
          : `Uyum skoru %${result.score} olarak güncellendi.`,
        'Yapay zeka analizi yenilendi',
      );
    },
    onError: (err) => toast.error(err.message, 'Analiz yenilenemedi'),
  });

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: event.data?.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success('Etkinlik bağlantısı panoya kopyalandı.');
    } catch {
      toast.error('Bağlantı paylaşılamadı.');
    }
  }

  if (event.isLoading) {
    return (
      <div className="mx-auto w-full max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
        <LoadingState label="Etkinlik yükleniyor..." />
      </div>
    );
  }

  if (event.error || !event.data) {
    return (
      <div className="mx-auto w-full max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
        <ErrorState
          title="Etkinlik bulunamadı"
          message={event.error?.message ?? 'Bu etkinliğe erişilemiyor olabilir.'}
          onRetry={event.refetch}
        />
      </div>
    );
  }

  const data = event.data;

  return (
    <div className="mx-auto flex w-full max-w-container-max flex-col gap-8 px-margin-mobile py-8 md:px-margin-desktop md:py-12">
      <PageHeader
        title={data.name}
        breadcrumbs={[
          { label: 'Etkinliklerim', to: '/organizator/etkinlikler' },
          { label: data.name },
        ]}
        meta={
          <Badge tone="success" pill dotClassName="bg-success">
            {data.status === 'seeking' ? 'Aktif Sponsor Arayışı' : 'Sponsor Arayışı Kapalı'}
          </Badge>
        }
        actions={
          <>
            <Button
              variant="secondary"
              leadingIcon="edit"
              onClick={() => toast.info('Düzenleme ekranı yakında.')}
            >
              Düzenle
            </Button>
            <Button
              variant="secondary"
              leadingIcon="auto_awesome"
              isLoading={analyze.isPending}
              loadingText="Analiz ediliyor"
              onClick={() => void analyze.mutate().catch(() => undefined)}
            >
              AI Analizini Yenile
            </Button>
            <Button leadingIcon="share" onClick={handleShare}>
              Paylaş
            </Button>
          </>
        }
      />

      {/* ------------------------------ Özet kartları ------------------------------ */}
      <section className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        <SummaryCard
          icon="calendar_today"
          label="Tarih & Konum"
          value={data.dateLabel}
          hint={data.location}
        />
        <SummaryCard
          icon="groups"
          label="Beklenen Katılımcı"
          value={data.attendeesLabel}
          hint="Katılımcı"
        />
        <SummaryCard
          icon="description"
          label="Toplam Teklif"
          value={String(proposals.data?.length ?? data.proposalCount)}
          hint="Teklif"
        />
      </section>

      {/* -------------------------------- Açıklama -------------------------------- */}
      <Card>
        <h2 className="mb-3 font-headline-sm text-headline-sm text-primary">Etkinlik Hakkında</h2>
        <p className="mb-6 font-body-md text-body-md text-on-surface-variant">{data.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{data.category}</Badge>
          {data.packages.map((pkg) => (
            <Badge key={pkg.id} tone="primary">
              {pkg.name} — {pkg.priceLabel}
            </Badge>
          ))}
        </div>

        {data.aiNote && (
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-outline-variant bg-surface-container-low p-4">
            <Icon name="auto_awesome" size={18} className="mt-0.5 text-primary-container" />
            <p className="font-body-md text-body-md italic text-on-surface-variant">
              {data.aiNote}
            </p>
          </div>
        )}
      </Card>

      {/* -------------------------------- Teklifler -------------------------------- */}
      <section>
        <h2 className="mb-6 font-headline-md text-headline-md text-primary">
          Bu Etkinliğe Gelen Sponsorluk Teklifleri
        </h2>

        <Card padded={false} className="overflow-hidden">
          {proposals.isLoading && <SkeletonRows rows={4} columns={6} />}

          {proposals.error && !proposals.isLoading && (
            <div className="p-6">
              <ErrorState message={proposals.error.message} onRetry={proposals.refetch} />
            </div>
          )}

          {proposals.data && !proposals.isLoading && (
            <ProposalTable
              proposals={proposals.data}
              variant="event-detail"
              emptyMessage="Bu etkinliğe henüz sponsorluk teklifi gelmedi."
            />
          )}
        </Card>
      </section>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card className="flex items-start gap-4" interactive>
      <span className="rounded-lg bg-surface-container-low p-3 text-primary">
        <Icon name={icon} filled />
      </span>
      <div className="min-w-0">
        <p className="mb-1 font-label-sm text-label-sm text-secondary">{label}</p>
        <p className="font-headline-sm text-headline-sm text-primary">{value}</p>
        <p className="mt-1 font-body-md text-body-md text-secondary">{hint}</p>
      </div>
    </Card>
  );
}
