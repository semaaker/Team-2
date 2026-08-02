import { useCallback, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  ErrorState,
  Icon,
  LoadingState,
  ProgressBar,
} from '@/components/ui';
import { PageHeader } from '@/components/features';
import { useQuery } from '@/hooks';
import { sponsorService } from '@/services';
import { useToast } from '@/store';
import { formatRelativeTime } from '@/utils/format';
import { cn } from '@/utils/cn';

/**
 * Deal Room — anlaşma özeti, teslimat kalemleri ve tartışma başlığı.
 * Sponsor ile organizatörün anlaşmayı yürüttüğü ortak çalışma alanı.
 */
export function DealRoomPage() {
  const { id = '' } = useParams<{ id: string }>();
  const toast = useToast();

  const fetcher = useCallback(() => sponsorService.deal(id), [id]);
  const { data, isLoading, error, refetch, setData } = useQuery(fetcher, { enabled: Boolean(id) });

  const [note, setNote] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleAddNote(event: FormEvent) {
    event.preventDefault();
    const body = note.trim();
    if (!body) return;

    setIsPosting(true);
    try {
      const updated = await sponsorService.addDealNote(id, body);
      setData(updated);
      setNote('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Not eklenemedi.');
    } finally {
      setIsPosting(false);
    }
  }

  async function handleToggleDeliverable(deliverableId: string) {
    setTogglingId(deliverableId);
    try {
      const updated = await sponsorService.toggleDeliverable(id, deliverableId);
      setData(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Teslimat güncellenemedi.');
    } finally {
      setTogglingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
        <LoadingState label="Deal Room yükleniyor..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
        <ErrorState
          title="Deal Room açılamadı"
          message={error?.message ?? 'Bu anlaşmaya erişiminiz olmayabilir.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  const completed = data.deliverables.filter((item) => item.done).length;
  const progress = data.deliverables.length ? (completed / data.deliverables.length) * 100 : 0;

  return (
    <div className="mx-auto flex w-full max-w-container-max flex-col gap-8 px-margin-mobile py-8 md:px-margin-desktop md:py-12">
      <PageHeader
        title={data.eventName}
        breadcrumbs={[
          { label: 'Sponsorluklarım', to: '/sponsor/sponsorluklar' },
          { label: 'Deal Room' },
        ]}
        description={`${data.sponsorName} · ${data.packageName}`}
      />

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        {/* --------------------------- Tartışma başlığı --------------------------- */}
        <Card padded={false} className="flex flex-col lg:col-span-2">
          <div className="border-b border-surface-variant px-6 py-5">
            <h2 className="font-headline-sm text-headline-sm text-primary">Tartışma Başlığı</h2>
          </div>

          <div className="scrollbar-thin max-h-[520px] flex-1 space-y-6 overflow-y-auto p-6">
            {data.notes.length === 0 ? (
              <p className="py-12 text-center font-body-md text-body-md text-secondary">
                Henüz not eklenmemiş. İlk mesajı siz yazın.
              </p>
            ) : (
              data.notes.map((entry) => (
                <div
                  key={entry.id}
                  className={cn('flex gap-3', entry.isMine && 'flex-row-reverse')}
                >
                  <Avatar name={entry.authorName} src={entry.authorAvatarUrl} size={40} />
                  <div className={cn('max-w-[80%]', entry.isMine && 'text-right')}>
                    <div className="mb-1 flex items-baseline gap-2">
                      <span className="font-label-md text-label-md font-semibold text-primary">
                        {entry.authorName}
                      </span>
                      <span className="font-label-sm text-label-sm text-secondary">
                        {formatRelativeTime(entry.createdAt)}
                      </span>
                    </div>
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-3 text-left',
                        entry.isMine
                          ? 'rounded-tr-sm bg-primary-container text-on-primary'
                          : 'rounded-tl-sm border border-outline-variant bg-surface-container-low text-on-surface',
                      )}
                    >
                      <p className="font-body-md text-body-md">{entry.body}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={handleAddNote}
            className="flex items-end gap-3 border-t border-surface-variant p-4 md:px-6"
          >
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Anlaşmayla ilgili bir not ekleyin..."
              aria-label="Not"
              className="flex-1 resize-none rounded-lg border border-outline-variant bg-surface px-4 py-3 font-body-md text-body-md focus:border-primary-container focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim"
            />
            <Button type="submit" isLoading={isPosting} disabled={!note.trim()} leadingIcon="send">
              Gönder
            </Button>
          </form>
        </Card>

        {/* ----------------------------- Anlaşma özeti ----------------------------- */}
        <div className="flex flex-col gap-gutter">
          <Card className="flex flex-col gap-6">
            <div>
              <h2 className="mb-2 font-headline-sm text-headline-sm text-primary">Anlaşma Özeti</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {data.eventName} · {data.packageName}
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-label-md text-label-md uppercase tracking-wider text-secondary">
                Finansal Şartlar
              </h3>
              <dl className="space-y-3">
                <SummaryRow label="Toplam Tutar" value={data.amountLabel} emphasized />
                <SummaryRow label="Ödeme Koşulları" value={data.paymentTerms} />
                <SummaryRow label="Sözleşme Durumu" value={data.contractStatus} />
              </dl>
            </div>

            <Button
              fullWidth
              leadingIcon="draft"
              onClick={() => toast.info('Sözleşme hazırlanıyor...')}
            >
              Sözleşmeyi Görüntüle
            </Button>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="font-label-md text-label-md uppercase tracking-wider text-secondary">
                Ana Teslimatlar
              </h3>
              <span className="font-label-sm text-label-sm text-secondary">
                {completed}/{data.deliverables.length}
              </span>
            </div>

            <ProgressBar value={progress} showValue={false} />

            <ul className="space-y-1">
              {data.deliverables.map((deliverable) => (
                <li key={deliverable.id}>
                  <Checkbox
                    label={deliverable.label}
                    checked={deliverable.done}
                    disabled={togglingId === deliverable.id}
                    onChange={() => handleToggleDeliverable(deliverable.id)}
                    className={cn(
                      'rounded-lg px-2 py-2 hover:bg-surface-container-low',
                      deliverable.done && 'opacity-60',
                    )}
                  />
                </li>
              ))}
            </ul>

            {completed === data.deliverables.length && data.deliverables.length > 0 && (
              <p className="flex items-center gap-2 rounded-lg bg-success-bg p-3 font-label-md text-label-md text-success">
                <Icon name="check_circle" size={18} />
                Tüm teslimatlar tamamlandı.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="font-body-md text-body-md text-secondary">{label}</dt>
      <dd
        className={cn(
          'text-right',
          emphasized
            ? 'font-headline-sm text-headline-sm text-primary'
            : 'font-label-md text-label-md text-on-surface',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
