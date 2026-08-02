import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Chip,
  ErrorState,
  Icon,
  LoadingState,
  ProgressBar,
} from '@/components/ui';
import { PageHeader } from '@/components/features';
import { useQuery } from '@/hooks';
import { sponsorService } from '@/services';

/**
 * Sponsor profil detayı.
 * Kurumsal bilgiler, odak alanları, ESG hedefleri ve canlı AI uyum analizi.
 */
export function SponsorProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const fetcher = useCallback(() => sponsorService.profile(id), [id]);
  const { data, isLoading, error, refetch } = useQuery(fetcher, { enabled: Boolean(id) });

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
        <LoadingState label="Sponsor profili yükleniyor..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto w-full max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
        <ErrorState
          title="Sponsor bulunamadı"
          message={error?.message ?? 'Bu profile erişilemiyor.'}
          onRetry={refetch}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-container-max flex-col gap-8 px-margin-mobile py-8 md:px-margin-desktop md:py-12">
      <PageHeader
        title={data.name}
        breadcrumbs={[{ label: 'Sponsorlar', to: '/kesfet' }, { label: data.name }]}
        meta={
          <>
            <Badge tone="neutral">{data.industry}</Badge>
            <Badge tone="primary" icon="location_on">
              {data.location}
            </Badge>
            <Badge tone="primary" icon="groups">
              {data.employeeRange}
            </Badge>
          </>
        }
        actions={
          <>
            <Button
              variant="secondary"
              leadingIcon="chat"
              onClick={() => navigate('/organizator/mesajlar')}
            >
              Mesaj Gönder
            </Button>
            <Button leadingIcon="handshake" onClick={() => navigate('/sponsor/sponsorluklar')}>
              Teklif Oluştur
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        {/* --------------------------------- Hakkında -------------------------------- */}
        <div className="flex flex-col gap-gutter lg:col-span-2">
          <Card>
            <h2 className="mb-4 font-headline-md text-headline-md text-primary">Hakkında</h2>
            <p className="mb-6 font-body-md text-body-md text-on-surface-variant">{data.about}</p>

            <dl className="grid grid-cols-1 gap-4 border-t border-surface-variant pt-6 sm:grid-cols-3">
              <InfoItem icon="language" label="Web Sitesi" value={data.website} />
              <InfoItem icon="payments" label="Yıllık Bütçe" value={data.annualBudgetLabel} />
              <InfoItem icon="corporate_fare" label="Sektör" value={data.industry} />
            </dl>
          </Card>

          <Card>
            <h2 className="mb-4 font-headline-sm text-headline-sm text-primary">Odak Alanları</h2>
            <div className="mb-8 flex flex-wrap gap-2">
              {data.focusAreas.map((area) => (
                <Chip key={area}>{area}</Chip>
              ))}
            </div>

            <h2 className="mb-4 font-headline-sm text-headline-sm text-primary">ESG Hedefleri</h2>
            <ul className="space-y-2">
              {data.esgGoals.map((goal) => (
                <li
                  key={goal}
                  className="flex items-start gap-2 font-body-md text-body-md text-on-surface-variant"
                >
                  <Icon name="eco" size={18} className="mt-0.5 text-success" />
                  {goal}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* ------------------------------- AI analizi ------------------------------- */}
        <Card className="flex h-fit flex-col gap-6">
          <div className="flex items-center gap-2">
            <Icon name="auto_awesome" size={20} className="text-primary-container" />
            <h2 className="font-headline-sm text-headline-sm text-primary">Yapay Zeka Analizi</h2>
          </div>

          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-6 text-center">
            <p className="mb-1 font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              Uyum Skoru
            </p>
            <p className="mb-4 font-display-lg-mobile text-display-lg-mobile text-primary">
              %{data.aiAnalysis.score}
            </p>
            <ProgressBar value={data.aiAnalysis.score} showValue={false} />
          </div>

          <p className="font-body-md text-body-md italic text-on-surface-variant">
            {data.aiAnalysis.summary}
          </p>

          <div>
            <h3 className="mb-3 font-label-md text-label-md uppercase tracking-wider text-secondary">
              Güçlü Yönler
            </h3>
            <ul className="space-y-2">
              {data.aiAnalysis.strengths.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 font-body-md text-body-md text-on-surface-variant"
                >
                  <Icon name="check_circle" size={18} className="mt-0.5 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {data.aiAnalysis.risks.length > 0 && (
            <div>
              <h3 className="mb-3 font-label-md text-label-md uppercase tracking-wider text-secondary">
                Dikkat Edilmesi Gerekenler
              </h3>
              <ul className="space-y-2">
                {data.aiAnalysis.risks.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 font-body-md text-body-md text-on-surface-variant"
                  >
                    <Icon name="warning" size={18} className="mt-0.5 text-amber-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon name={icon} size={20} className="mt-0.5 text-primary-container" />
      <div className="min-w-0">
        <dt className="font-label-sm text-label-sm text-secondary">{label}</dt>
        <dd className="truncate font-label-md text-label-md text-primary">{value}</dd>
      </div>
    </div>
  );
}
