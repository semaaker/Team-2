import { useCallback, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Icon, Input } from '@/components/ui';
import { StatCard, StatCardSkeleton } from '@/components/features';
import { useQuery } from '@/hooks';
import { contentService, authService } from '@/services';
import { useAuth, useToast } from '@/store';
import { hasErrors, validateLoginEmail, type FieldErrors } from '@/utils/validation';

/**
 * Açılış sayfası.
 * Hero + hızlı giriş kartı, platform istatistikleri ve bento düzeninde
 * değer önerisi bölümü — tasarımdaki hiyerarşiyle birebir.
 */
export function LandingPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { setPendingEmail } = useAuth();

  const statsFetcher = useCallback(() => contentService.platformStats(), []);
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery(statsFetcher);

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors<{ email: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /** Hero kartındaki hızlı giriş — kod akışının 1. adımını tetikler. */
  async function handleQuickLogin(event: FormEvent) {
    event.preventDefault();

    const validationErrors = validateLoginEmail({ email });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setIsSubmitting(true);
    try {
      const result = await authService.requestCode(email.trim());
      setPendingEmail(result.email);
      toast.success(
        result.devCode
          ? `Doğrulama kodunuz: ${result.devCode} (demo modu)`
          : 'Doğrulama kodu e-posta adresinize gönderildi.',
      );
      navigate('/giris/dogrulama');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Giriş başlatılamadı.';
      setErrors({ email: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* ------------------------------- Hero + Auth ------------------------------ */}
      <section className="mx-auto grid w-full max-w-container-max items-center gap-gutter px-margin-mobile pb-16 pt-12 md:grid-cols-2 md:px-margin-desktop md:pb-24">
        <div className="flex flex-col gap-8 pr-0 md:pr-12">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-surface-container-low px-3 py-1">
            <Icon name="auto_awesome" size={16} className="text-primary-container" />
            <span className="font-label-sm text-label-sm text-primary-container">
              Yapay Zeka Destekli B2B Platformu
            </span>
          </span>

          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">
            Geleceğin Etkinliklerini Birlikte İnşa Edin
          </h1>

          <p className="max-w-lg font-body-lg text-body-lg text-on-surface-variant">
            Organizatörler ve sponsorlar için en gelişmiş B2B pazar yeri platformu. Yapay zeka
            destekli eşleştirme ile doğru iş ortaklıklarını saniyeler içinde kurun. Markanızın
            vizyonuna ve ESG hedeflerine en uygun etkinlikleri keşfedin.
          </p>

          <div className="mt-4 flex flex-wrap gap-4">
            <Button trailingIcon="arrow_forward" onClick={() => navigate('/kesfet')}>
              Sponsorları Keşfet
            </Button>
            <Button
              variant="secondary"
              trailingIcon="add_circle"
              onClick={() => navigate('/kayit')}
            >
              Etkinlik Yarat
            </Button>
          </div>
        </div>

        {/* Giriş / kayıt kartı */}
        <div className="relative mt-12 overflow-hidden rounded-2xl border border-surface-variant bg-surface-container-lowest p-8 shadow-soft md:mt-0">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-surface-container-low opacity-50"
          />

          <div className="relative z-10 mb-8">
            <h2 className="mb-2 font-headline-md text-headline-md text-primary">Hemen Başlayın</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Platforma giriş yapın veya saniyeler içinde ücretsiz hesap oluşturun.
            </p>
          </div>

          <form
            onSubmit={handleQuickLogin}
            className="relative z-10 flex flex-col gap-5"
            noValidate
          >
            <Input
              label="E-posta Adresi"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="ornek@sirket.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({});
              }}
              error={errors.email}
              labelAction={
                <Link
                  to="/sifremi-unuttum"
                  className="font-label-sm text-label-sm text-primary-container hover:underline"
                >
                  Şifremi Unuttum
                </Link>
              }
            />

            <Button
              type="submit"
              fullWidth
              className="mt-2"
              isLoading={isSubmitting}
              loadingText="Gönderiliyor..."
            >
              Giriş Yap
            </Button>

            <div className="my-2 flex items-center gap-4">
              <span className="h-px flex-grow bg-surface-variant" />
              <span className="font-label-sm text-label-sm text-outline">veya</span>
              <span className="h-px flex-grow bg-surface-variant" />
            </div>

            <Button
              variant="secondary"
              fullWidth
              leadingIcon="corporate_fare"
              className="border-surface-variant text-on-surface"
              onClick={() => navigate('/kayit')}
            >
              Kurumsal Kayıt Oluştur
            </Button>
          </form>
        </div>
      </section>

      {/* ---------------------------- Platform metrikleri --------------------------- */}
      <section className="mx-auto w-full max-w-container-max border-t border-surface-variant px-margin-mobile py-12 md:px-margin-desktop">
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {statsLoading &&
            Array.from({ length: 3 }).map((_, index) => <StatCardSkeleton key={index} />)}

          {statsError && (
            <p className="col-span-full rounded-2xl border border-outline-variant bg-surface-container-low p-6 text-center font-body-md text-body-md text-secondary">
              Platform istatistikleri şu anda görüntülenemiyor.
            </p>
          )}

          {stats?.map((metric) => (
            <StatCard key={metric.key} metric={metric} centered />
          ))}
        </div>
      </section>

      {/* --------------------------- Değer önerisi (bento) -------------------------- */}
      <section className="mx-auto w-full max-w-container-max px-margin-mobile py-16 md:px-margin-desktop md:py-24">
        <div className="mb-12">
          <h2 className="mb-2 font-headline-md text-headline-md text-primary">
            Neden SponsorMatch AI?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Profesyoneller için tasarlanmış akıllı özellikler.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Geniş kutu — küresel ağ */}
          <div className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-2xl border border-surface-variant bg-gradient-to-br from-surface-container-low via-surface-container to-secondary-container p-8 shadow-soft transition-all hover:shadow-md md:col-span-2">
            <div className="relative z-10 max-w-md">
              <span className="mb-4 block w-fit rounded bg-surface-container-lowest px-2 py-1 font-label-sm text-label-sm text-primary-container">
                Küresel Ağ
              </span>
              <h3 className="mb-2 font-headline-sm text-headline-sm text-primary">
                Geniş Sponsor Ağına Erişin
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Binlerce doğrulanmış marka ve kurumsal sponsor ile anında iletişim kurun.
                Sektörünüze en uygun partnerleri keşfedin.
              </p>
            </div>
            <Icon
              name="hub"
              size={180}
              className="pointer-events-none absolute -right-6 -top-6 text-primary-container opacity-[0.06]"
            />
          </div>

          {/* AI eşleştirme */}
          <FeatureCard
            icon="smart_toy"
            title="Yapay Zeka Eşleştirme"
            description="Etkinlik metriklerinizi ve marka hedeflerini analiz eden algoritmamız, en yüksek dönüşüm sağlayacak eşleşmeleri otomatik önerir."
          />

          {/* ROI analitiği */}
          <div className="flex flex-col rounded-2xl border border-surface-variant bg-surface-container-lowest p-8 shadow-soft transition-all hover:shadow-md">
            <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-low">
              <Icon name="bar_chart" size={28} className="text-primary-container" />
            </span>
            <h3 className="mb-3 font-headline-sm text-headline-sm text-primary">
              Detaylı ROI Analitiği
            </h3>
            <p className="mb-6 font-body-md text-body-md text-on-surface-variant">
              Sponsorluk yatırımlarının getirisini gerçek zamanlı paneller üzerinden şeffaf bir
              şekilde takip edin.
            </p>

            {/* Soyut sütun grafiği — tasarımdaki dekoratif görselleştirme */}
            <div className="relative mt-auto flex h-24 items-end gap-3 overflow-hidden rounded-lg bg-surface-container px-4">
              <span className="h-1/3 w-6 rounded-t-sm bg-primary-fixed-dim" />
              <span className="h-2/3 w-6 rounded-t-sm bg-primary-container" />
              <span className="h-1/2 w-6 rounded-t-sm bg-surface-tint" />
              <span className="h-full w-6 rounded-t-sm bg-outline-variant" />
            </div>
          </div>

          {/* Güvenlik */}
          <div className="flex items-center gap-8 rounded-2xl border border-surface-variant bg-surface-container-lowest p-8 shadow-soft transition-all hover:shadow-md md:col-span-2">
            <span className="hidden h-24 w-24 shrink-0 items-center justify-center rounded-full bg-surface-container-low md:flex">
              <Icon name="shield_lock" size={40} className="text-primary-container" />
            </span>
            <div>
              <h3 className="mb-2 font-headline-sm text-headline-sm text-primary">
                Kurumsal Düzeyde Güvenlik ve Ödeme
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Tüm anlaşmalar, dijital sözleşmeler ve ödemeler banka seviyesinde şifreleme ile
                korunur. Sürtünmesiz ve güvenli bir B2B işlem deneyimi yaşayın.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-surface-variant bg-surface-container-lowest p-8 shadow-soft transition-all hover:shadow-md">
      <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container-low">
        <Icon name={icon} size={28} className="text-primary-container" />
      </span>
      <h3 className="mb-3 font-headline-sm text-headline-sm text-primary">{title}</h3>
      <p className="flex-grow font-body-md text-body-md text-on-surface-variant">{description}</p>
    </div>
  );
}
