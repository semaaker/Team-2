import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, ErrorState, Icon, SkeletonRows } from '@/components/ui';
import {
  EventFormModal,
  PageHeader,
  ProposalTable,
  StatCard,
  StatCardSkeleton,
} from '@/components/features';
import { useQuery } from '@/hooks';
import { contentService, eventService } from '@/services';
import { useAuth } from '@/store';

/**
 * Organizatör paneli ana ekranı.
 * Metrik kartları ve "Son Sponsorluk Talepleri" tablosu backend'den beslenir.
 */
export function OrganizerDashboardPage() {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const statsFetcher = useCallback(() => contentService.organizerStats(), []);
  const stats = useQuery(statsFetcher);

  const proposalsFetcher = useCallback(() => eventService.recentProposals(5), []);
  const proposals = useQuery(proposalsFetcher);

  return (
    <div className="mx-auto flex w-full max-w-container-max flex-col gap-8 px-margin-mobile py-8 md:px-margin-desktop md:py-12">
      <PageHeader
        title={`Hoş Geldiniz, ${user?.fullName.split(' ')[0] ?? 'Organizatör'}`}
        description="Etkinliklerinizi yönetin, gelen sponsorluk tekliflerini inceleyin ve AI eşleşmelerinizi tek bir yerden takip edin."
        actions={
          <Button leadingIcon="add" onClick={() => setIsFormOpen(true)}>
            Yeni Etkinlik Ekle
          </Button>
        }
      />

      {/* ------------------------------ Metrikler ------------------------------ */}
      <section className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        {stats.isLoading &&
          Array.from({ length: 3 }).map((_, index) => <StatCardSkeleton key={index} />)}

        {stats.error && !stats.isLoading && (
          <div className="col-span-full">
            <ErrorState
              title="Metrikler yüklenemedi"
              message={stats.error.message}
              onRetry={stats.refetch}
            />
          </div>
        )}

        {stats.data?.map((metric) => (
          <StatCard key={metric.key} metric={metric} />
        ))}
      </section>

      {/* ------------------------- Son sponsorluk talepleri ------------------------- */}
      <section>
        <Card padded={false} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-surface-variant bg-inverse-on-surface px-6 py-5">
            <h2 className="font-headline-sm text-headline-sm text-primary">
              Son Sponsorluk Talepleri
            </h2>
            <Link
              to="/organizator/etkinlikler"
              className="flex items-center gap-1 font-label-md text-label-md text-primary-container hover:underline"
            >
              Tümünü Gör
              <Icon name="arrow_forward" size={16} />
            </Link>
          </div>

          {proposals.isLoading && <SkeletonRows rows={3} columns={6} />}

          {proposals.error && !proposals.isLoading && (
            <div className="p-6">
              <ErrorState message={proposals.error.message} onRetry={proposals.refetch} />
            </div>
          )}

          {proposals.data && !proposals.isLoading && (
            <ProposalTable
              proposals={proposals.data}
              emptyMessage="Henüz sponsorluk talebi almadınız. Etkinliğinizi yayınladıktan sonra teklifler burada listelenir."
            />
          )}
        </Card>
      </section>

      <EventFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={() => {
          stats.refetch();
          proposals.refetch();
        }}
      />
    </div>
  );
}
