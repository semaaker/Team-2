import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState, Icon, LoadingState, Tabs } from '@/components/ui';
import { useQuery } from '@/hooks';
import { contentService } from '@/services';

const TABS = [
  { id: 'gizlilik', label: 'Gizlilik Politikası' },
  { id: 'kosullar', label: 'Kullanım Şartları' },
  { id: 'kvkk', label: 'KVKK Aydınlatma Metni' },
] as const;

/**
 * Hukuki metinler (Gizlilik, Kullanım Şartları, KVKK).
 * İçerik `GET /api/legal/:slug` ucundan gelir — kod içinde gömülü değildir.
 */
export function LegalPage() {
  const { slug = 'gizlilik' } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const fetcher = useCallback(() => contentService.legal(slug), [slug]);
  const { data, isLoading, error, refetch } = useQuery(fetcher);

  return (
    <div className="mx-auto flex w-full max-w-container-max flex-col gap-gutter px-margin-mobile py-8 md:flex-row md:px-margin-desktop md:py-12">
      <aside className="w-full shrink-0 md:w-64">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 font-bold text-primary transition-transform hover:-translate-x-1"
        >
          <Icon name="arrow_back" />
          Anasayfaya Dön
        </button>

        <Tabs
          variant="sidebar"
          items={TABS}
          activeId={slug}
          onChange={(id) => navigate(`/${id === 'gizlilik' ? 'gizlilik' : id}`)}
        />
      </aside>

      <article className="min-w-0 flex-grow rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm md:p-8">
        {isLoading && <LoadingState label="Belge yükleniyor..." />}

        {error && <ErrorState message={error.message} onRetry={refetch} />}

        {data && !isLoading && (
          <>
            <header className="mb-8 border-b border-outline-variant pb-6">
              <h1 className="mb-2 font-headline-md text-headline-md font-bold text-primary">
                {data.title}
              </h1>
              <p className="font-label-sm text-label-sm text-secondary">
                Son güncelleme: {data.updatedAt}
              </p>
            </header>

            <div className="prose-legal max-w-none">
              {data.sections.map((section, index) => (
                <section key={`${section.heading}-${index}`} className="mb-8 last:mb-0">
                  <h2 className="mb-4 font-headline-sm text-headline-sm text-primary">
                    {section.heading}
                  </h2>

                  {section.paragraphs.map((paragraph, pIndex) => (
                    <p key={pIndex}>{paragraph}</p>
                  ))}

                  {section.list && (
                    <ul>
                      {section.list.map((item, lIndex) => (
                        <li key={lIndex}>{item}</li>
                      ))}
                    </ul>
                  )}

                  {section.callout && (
                    <aside className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
                      <p className="mb-1 flex items-center gap-2 font-label-md text-label-md font-semibold text-primary">
                        <Icon name="info" size={18} className="text-primary-container" />
                        {section.callout.title}
                      </p>
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        {section.callout.body}
                      </p>
                    </aside>
                  )}
                </section>
              ))}
            </div>
          </>
        )}
      </article>
    </div>
  );
}
