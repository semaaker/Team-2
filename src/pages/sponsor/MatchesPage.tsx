import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Icon,
  SkeletonCardGrid,
  Tabs,
} from '@/components/ui';
import { MatchCard, PageHeader } from '@/components/features';
import { useQuery } from '@/hooks';
import { aiService } from '@/services';
import { useToast } from '@/store';
import { QUICK_FILTERS } from '@/utils/constants';

/**
 * "Yapay Zeka Eşleşmeleri" ekranı.
 *
 * Skorlar `/api/ai/matches` ucundan gelir: sunucu, sponsorun sektör/odak
 * alanı/vizyon/bütçe profilini etkinliklerle karşılaştırır. Motor n8n + Gemini
 * akışı ya da yerleşik kural motoru olabilir; hangisi çalıştıysa başlıktaki
 * rozette gösterilir. Sonuç yoksa tasarımdaki "Henüz Eşleşme Yok" durumu görünür.
 */
export function MatchesPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [sort, setSort] = useState<'score' | 'date'>('score');
  const [category, setCategory] = useState('');

  const fetcher = useCallback(() => aiService.matches({ sort, category }), [sort, category]);
  const { data, isLoading, isRefreshing, error, refetch } = useQuery(fetcher);

  const matches = data?.items ?? [];
  const meta = data?.meta;
  const isFiltered = Boolean(category);

  function handleRescore() {
    refetch();
    toast.info('Eşleşmeler marka profilinize göre yeniden hesaplanıyor.');
  }

  return (
    <div className="mx-auto w-full max-w-container-max px-margin-mobile py-8 md:px-margin-desktop md:py-12">
      <PageHeader
        title="Yapay Zeka Eşleşmeleri"
        description="Marka kriterlerinize en uygun, yüksek dönüşüm potansiyeline sahip etkinlikleri keşfedin."
        className="mb-6"
        actions={
          <>
            <Button
              variant="secondary"
              leadingIcon="sort"
              className="border-outline-variant text-on-surface"
              onClick={() => setSort((current) => (current === 'score' ? 'date' : 'score'))}
            >
              {sort === 'score' ? 'Skora Göre' : 'Tarihe Göre'}
            </Button>
            <Button
              leadingIcon="auto_awesome"
              isLoading={isRefreshing}
              loadingText="Hesaplanıyor"
              onClick={handleRescore}
            >
              Yeniden Eşleştir
            </Button>
          </>
        }
      />

      {/* Skorun hangi motordan geldiğini şeffaf biçimde göster. */}
      {meta && (
        <div className="mb-8 flex flex-wrap items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3">
          <Icon name="auto_awesome" size={20} className="text-primary" />
          <span className="text-label-sm text-on-surface">
            <strong>{meta.sponsorName}</strong> profiline göre {meta.evaluated} etkinlik
            değerlendirildi.
          </span>
          <Badge tone={meta.source === 'n8n' ? 'success' : 'neutral'}>
            {meta.source === 'n8n'
              ? 'n8n · Gemini'
              : meta.source === 'local-fallback'
                ? 'Yerel motor (yedek)'
                : 'Yerel kural motoru'}
          </Badge>
          {meta.warning && (
            <span className="text-label-sm text-error" role="status">
              {meta.warning}
            </span>
          )}
        </div>
      )}

      <Tabs
        variant="pill"
        className="mb-8"
        items={QUICK_FILTERS.map((filter) => ({ id: filter.value, label: filter.label }))}
        activeId={category}
        onChange={setCategory}
      />

      {isLoading && <SkeletonCardGrid count={6} />}

      {error && !isLoading && <ErrorState message={error.message} onRetry={refetch} />}

      {!isLoading && !error && matches.length === 0 && (
        <EmptyState
          icon="handshake"
          title="Henüz Eşleşme Yok"
          description={
            isFiltered
              ? 'Seçtiğiniz kategoride uygun etkinlik bulunamadı. Filtreyi genişleterek tekrar deneyin.'
              : 'Yapay zeka henüz marka profilinize uyan bir etkinlik bulamadı. Eşleştirme kriterlerinizi güncelleyerek daha fazla sonuç görebilirsiniz.'
          }
          action={
            isFiltered
              ? { label: 'Filtreyi Temizle', icon: 'refresh', onClick: () => setCategory('') }
              : {
                  label: 'Kriterleri Güncelle',
                  icon: 'tune',
                  onClick: () => navigate('/organizator/ayarlar'),
                }
          }
          secondaryAction={{ label: 'Tüm Etkinlikleri Gör', onClick: () => navigate('/kesfet') }}
        />
      )}

      {!isLoading && !error && matches.length > 0 && (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onReview={(item) => navigate(`/etkinlik/${item.eventId}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
