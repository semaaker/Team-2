import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, ErrorState, Icon, Skeleton, SkeletonCardGrid } from '@/components/ui';
import { MatchCard, PageHeader, StatCard, StatCardSkeleton } from '@/components/features';
import { useQuery } from '@/hooks';
import { contentService, sponsorService } from '@/services';
import { cn } from '@/utils/cn';

/**
 * Sponsor paneli ana ekranı.
 * Hızlı metrikler, ROI önerisi kartı, yaklaşan kilometre taşları ve
 * "Discover Opportunities" eşleşme önerileri.
 */
export function SponsorDashboardPage() {
  const navigate = useNavigate();

  const statsFetcher = useCallback(() => contentService.sponsorStats(), []);
  const stats = useQuery(statsFetcher);

  const milestonesFetcher = useCallback(() => sponsorService.milestones(), []);
  const milestones = useQuery(milestonesFetcher);

  const matchesFetcher = useCallback(() => sponsorService.matches(), []);
  const matches = useQuery(matchesFetcher);

  return (
    <div className="mx-auto w-full max-w-container-max px-margin-mobile py-8 md:px-margin-desktop md:py-12">
      <PageHeader
        title="Sponsor Paneli"
        description="Aktif kampanyalarınızı yönetin ve yüksek etkili iş ortaklığı fırsatlarını keşfedin."
        className="mb-12"
      />

      <div className="mb-12 grid grid-cols-1 gap-gutter lg:grid-cols-12">
        {/* ------------------------- Metrikler + ROI kartı ------------------------- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8">
          {stats.isLoading &&
            Array.from({ length: 2 }).map((_, index) => <StatCardSkeleton key={index} />)}

          {stats.error && !stats.isLoading && (
            <div className="sm:col-span-2">
              <ErrorState message={stats.error.message} onRetry={stats.refetch} />
            </div>
          )}

          {stats.data?.slice(0, 2).map((metric) => (
            <StatCard key={metric.key} metric={metric} />
          ))}

          {/* ROI optimizasyon kartı — koyu zeminli vurgu bloğu */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-outline-variant bg-primary p-6 text-on-primary sm:col-span-2">
            <div className="relative z-10">
              <h2 className="mb-2 font-headline-md text-headline-md">
                ROI&apos;nizi Optimize Edin
              </h2>
              <p className="max-w-md font-body-md text-body-md text-secondary-fixed opacity-90">
                Yapay zeka analizimiz, mevcut sponsorluklarınızdan 2 tanesinin geliştirilmiş marka
                yerleşiminden fayda sağlayabileceğini gösteriyor.
              </p>
              <Button
                variant="inverse"
                size="sm"
                className="mt-6"
                onClick={() => navigate('/sponsor/sponsorluklar')}
              >
                İçgörüleri Gör
              </Button>
            </div>
            <Icon
              name="bar_chart"
              size={150}
              className="pointer-events-none absolute bottom-0 right-0 opacity-10"
            />
          </div>
        </div>

        {/* -------------------------- Yaklaşan kilometre taşları -------------------------- */}
        <Card className="flex flex-col lg:col-span-4">
          <div className="mb-6 flex items-center justify-between border-b border-outline-variant pb-4">
            <h2 className="font-headline-sm text-headline-sm text-primary">
              Yaklaşan Kilometre Taşları
            </h2>
            <Icon name="flag" className="text-secondary" />
          </div>

          <div className="scrollbar-thin flex flex-1 flex-col gap-6 overflow-y-auto pr-2">
            {milestones.isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2 pl-6">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}

            {milestones.error && !milestones.isLoading && (
              <p className="py-6 text-center font-body-md text-body-md text-secondary">
                Kilometre taşları yüklenemedi.
              </p>
            )}

            {milestones.data?.length === 0 && !milestones.isLoading && (
              <p className="py-6 text-center font-body-md text-body-md text-secondary">
                Yaklaşan bir kilometre taşı yok.
              </p>
            )}

            {milestones.data?.map((milestone) => (
              <div
                key={milestone.id}
                className={cn(
                  'relative border-l-2 pl-6',
                  milestone.isCurrent ? 'border-primary-fixed' : 'border-outline-variant',
                )}
              >
                <span
                  className={cn(
                    'absolute -left-[7px] top-1 h-3 w-3 rounded-full',
                    milestone.isCurrent ? 'bg-primary' : 'bg-secondary-fixed',
                  )}
                />
                <p
                  className={cn(
                    'mb-1 font-label-sm text-label-sm',
                    milestone.isCurrent ? 'text-primary' : 'text-secondary',
                  )}
                >
                  {milestone.dateLabel}
                </p>
                <h3 className="mb-1 font-label-md text-label-md text-on-surface">
                  {milestone.title}
                </h3>
                <p className="font-body-md text-sm text-secondary">{milestone.eventName}</p>
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            fullWidth
            className="mt-6 border-outline-variant text-primary"
            onClick={() => navigate('/sponsor/sponsorluklar')}
          >
            Tüm Takvimi Gör
          </Button>
        </Card>
      </div>

      {/* --------------------------- Fırsat keşfi --------------------------- */}
      <section>
        <div className="mb-8 flex items-end justify-between border-b border-outline-variant pb-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Fırsatları Keşfedin</h2>
            <p className="mt-1 font-body-md text-body-md text-secondary">
              Marka profilinize ve hedef kitlenize göre seçilmiş eşleşmeler.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/sponsor/eslesmeler')}
            className="hidden items-center gap-2 font-label-md text-label-md text-primary transition-colors hover:text-on-primary-container sm:flex"
          >
            Tüm Eşleşmeler <Icon name="arrow_forward" />
          </button>
        </div>

        {matches.isLoading && <SkeletonCardGrid count={3} />}

        {matches.error && !matches.isLoading && (
          <ErrorState message={matches.error.message} onRetry={matches.refetch} />
        )}

        {matches.data && !matches.isLoading && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.data.slice(0, 3).map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                onReview={(item) => navigate(`/etkinlik/${item.eventId}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
