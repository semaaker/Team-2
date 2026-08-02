import { useCallback, useState, type FormEvent } from 'react';
import { Button, EmptyState, ErrorState, Icon, SkeletonCardGrid, Tabs } from '@/components/ui';
import { EventCard } from '@/components/features';
import { useDebounce, useQuery } from '@/hooks';
import { eventService } from '@/services';
import { useAuth, useToast } from '@/store';
import { QUICK_FILTERS } from '@/utils/constants';
import type { EventItem } from '@/types';

const PAGE_SIZE = 9;

/**
 * "Etkinlikleri Keşfet" — arama, kategori filtreleme ve sayfalı liste.
 * Tüm veriler `GET /api/events` ucundan gelir.
 */
export function DiscoverPage() {
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  // Yazarken de arama yapılsın diye debounce; "Ara" butonu anında uygular.
  const debouncedSearch = useDebounce(searchInput);
  const effectiveSearch = appliedSearch || debouncedSearch;

  const fetcher = useCallback(
    () =>
      eventService.list({
        search: effectiveSearch,
        category,
        page: 1,
        pageSize: page * PAGE_SIZE,
      }),
    [effectiveSearch, category, page],
  );

  const { data, isLoading, error, refetch, setData } = useQuery(fetcher);

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    setAppliedSearch(searchInput);
    setPage(1);
  }

  function handleCategoryChange(next: string) {
    setCategory(next);
    setPage(1);
  }

  /** Kaydet ikonunu optimistic olarak günceller. */
  async function handleToggleBookmark(event: EventItem) {
    if (!isAuthenticated) {
      toast.info('Etkinlik kaydetmek için giriş yapmalısınız.');
      return;
    }

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
      // Başarısızsa geri al.
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
      toast.error('Kaydetme işlemi tamamlanamadı.');
    }
  }

  const items = data?.items ?? [];
  const isFiltered = Boolean(effectiveSearch || category);

  return (
    <div className="mx-auto w-full max-w-container-max px-margin-mobile py-8 md:px-margin-desktop md:py-12">
      {/* --------------------------- Başlık ve arama --------------------------- */}
      <section className="mb-12">
        <h1 className="mb-4 font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">
          Etkinlikleri Keşfet
        </h1>
        <p className="mb-8 max-w-2xl font-body-lg text-body-lg text-secondary">
          Yapay zeka tarafından markanızın vizyonuna ve ESG hedeflerine en uygun olarak eşleştirilen
          etkinlikleri inceleyin.
        </p>

        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-soft md:flex-row"
        >
          <div className="flex flex-grow items-center rounded-lg border border-outline-variant bg-surface px-3 transition-all focus-within:border-primary">
            <Icon name="search" className="mr-2 text-secondary" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setAppliedSearch('');
                setPage(1);
              }}
              placeholder="Etkinlik adı, sektör veya anahtar kelime ara..."
              aria-label="Etkinlik ara"
              className="w-full border-none bg-transparent py-3 font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none focus:ring-0"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              leadingIcon="filter_list"
              className="border-outline-variant text-on-surface"
              onClick={() => handleCategoryChange('')}
            >
              Filtreyi Temizle
            </Button>
            <Button type="submit" className="px-8">
              Ara
            </Button>
          </div>
        </form>

        <Tabs
          variant="pill"
          className="mt-4"
          items={QUICK_FILTERS.map((filter) => ({ id: filter.value, label: filter.label }))}
          activeId={category}
          onChange={handleCategoryChange}
        />
      </section>

      {/* ------------------------------ Sonuçlar ------------------------------ */}
      <section>
        {isLoading && <SkeletonCardGrid count={6} />}

        {error && !isLoading && <ErrorState message={error.message} onRetry={refetch} />}

        {!isLoading && !error && items.length === 0 && (
          <EmptyState
            icon={isFiltered ? 'search_off' : 'event_busy'}
            title={
              isFiltered ? 'Aramanızla eşleşen etkinlik yok' : 'Henüz yayınlanmış etkinlik yok'
            }
            description={
              isFiltered
                ? 'Farklı bir anahtar kelime deneyin veya kategori filtresini kaldırın.'
                : 'Yeni etkinlikler yayınlandığında burada listelenecek.'
            }
            action={
              isFiltered
                ? {
                    label: 'Filtreleri Temizle',
                    icon: 'refresh',
                    onClick: () => {
                      setSearchInput('');
                      setAppliedSearch('');
                      setCategory('');
                      setPage(1);
                    },
                  }
                : undefined
            }
          />
        )}

        {!isLoading && !error && items.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
              {items.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  href={`/etkinlik/${event.id}`}
                  onToggleBookmark={handleToggleBookmark}
                />
              ))}
            </div>

            <div className="mt-12 text-center">
              {data?.hasMore ? (
                <Button variant="secondary" onClick={() => setPage((current) => current + 1)}>
                  Daha Fazla Etkinlik Yükle
                </Button>
              ) : (
                <p className="font-label-md text-label-md text-secondary">
                  Toplam {data?.total} etkinliğin tamamı gösteriliyor.
                </p>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
