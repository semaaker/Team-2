import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '@/components/ui';

/** 404 — tanımsız rotalar için. */
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-margin-mobile py-24 text-center">
      <span className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-surface-container-low">
        <Icon name="explore_off" size={40} className="text-primary-container" />
      </span>

      <p className="mb-2 font-label-md text-label-md uppercase tracking-wider text-secondary">
        404
      </p>
      <h1 className="mb-4 font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">
        Sayfa bulunamadı
      </h1>
      <p className="mb-8 max-w-md font-body-lg text-body-lg text-on-surface-variant">
        Aradığınız sayfa taşınmış veya hiç var olmamış olabilir. Aşağıdaki bağlantılardan devam
        edebilirsiniz.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button leadingIcon="home" onClick={() => navigate('/')}>
          Anasayfaya Dön
        </Button>
        <Button variant="secondary" leadingIcon="search" onClick={() => navigate('/kesfet')}>
          Etkinlikleri Keşfet
        </Button>
      </div>
    </div>
  );
}
