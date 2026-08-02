import { useCallback, useState } from 'react';
import { Button, EmptyState, ErrorState, SkeletonCardGrid, Tabs } from '@/components/ui';
import { EventCard, EventDetailModal, EventFormModal, PageHeader } from '@/components/features';
import { useDebounce, useQuery } from '@/hooks';
import { eventService } from '@/services';
import { useToast } from '@/store';
import { QUICK_FILTERS } from '@/utils/constants';
import type { EventItem } from '@/types';

/**
 * "Etkinliklerim" — organizatörün kendi etkinlik listesi.
 * Karta tıklamak hızlı detay modalını açar; modal içinden tam sayfaya geçilir.
 */
export function MyEventsPage() {
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [detailEventId, setDetailEventId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);

  const fetcher = useCallback(
    () => eventService.listMine({ search: debouncedSearch, category, pageSize: 50 }),
    [debouncedSearch, category],
  );

  const { data, isLoading, error, refetch, setData } = useQuery(fetcher);
  const events = data?.items ?? [];

  async function handleToggleBookmark(event: EventItem) {
    setData((prev) =>
      prev
        ? {
            ...prev,
            items: prev.items.map((item) =>
              item.id === event.id ? { ...item, bookmarked: !item.bookmarked } : item,
            ),
          }
        : prev,
    );

    try {
      await eventService.toggleBookmark(event.id);
    } catch {
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((item) =>
                item.id === event.id ? { ...item, bookmarked: event.bookmarked } : item,
              ),
            }
          : prev,
      );
      toast.error('İşlem tamamlanamadı.');
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-container-max flex-col gap-8 px-margin-mobile py-8 md:px-margin-desktop md:py-12">
      <PageHeader
        title="Etkinliklerim"
        description="Yayınladığınız tüm etkinlikleri görüntüleyin, teklifleri takip edin ve yenisini ekleyin."
        actions={
          <Button leadingIcon="add" onClick={() => setIsFormOpen(true)}>
            Yeni Etkinlik Ekle
          </Button>
        }
      />

      {/* Arama ve kategori filtresi */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center rounded-lg border border-outline-variant bg-surface-container-lowest px-4 shadow-soft focus-within:border-primary-container">
          <span className="material-symbols-outlined mr-2 text-secondary" aria-hidden>
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Etkinliklerimde ara..."
            aria-label="Etkinliklerimde ara"
            className="w-full border-none bg-transparent py-3 font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none focus:ring-0"
          />
        </div>

        <Tabs
          variant="pill"
          items={QUICK_FILTERS.map((filter) => ({ id: filter.value, label: filter.label }))}
          activeId={category}
          onChange={setCategory}
        />
      </div>

      {/* Liste */}
      {isLoading && <SkeletonCardGrid count={6} />}

      {error && !isLoading && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && events.length === 0 && (
        <EmptyState
          icon="event_note"
          title={search || category ? 'Eşleşen etkinlik yok' : 'Henüz etkinlik oluşturmadınız'}
          description={
            search || category
              ? 'Arama ve filtre kriterlerinizi değiştirerek tekrar deneyin.'
              : 'İlk etkinliğinizi oluşturun; yapay zeka en uygun sponsorları hemen eşleştirmeye başlasın.'
          }
          action={
            search || category
              ? {
                  label: 'Filtreleri Temizle',
                  icon: 'refresh',
                  onClick: () => {
                    setSearch('');
                    setCategory('');
                  },
                }
              : { label: 'Yeni Etkinlik Ekle', icon: 'add', onClick: () => setIsFormOpen(true) }
          }
        />
      )}

      {!isLoading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onOpen={(item) => setDetailEventId(item.id)}
              onToggleBookmark={handleToggleBookmark}
            />
          ))}
        </div>
      )}

      <EventFormModal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onCreated={() => refetch()}
      />

      <EventDetailModal eventId={detailEventId} onClose={() => setDetailEventId(null)} />
    </div>
  );
}
