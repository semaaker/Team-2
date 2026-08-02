import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui';

interface SettingsNavItem {
  to: string;
  label: string;
  icon: string;
  /** Yalnızca tam eşleşmede aktif say (kök ayarlar yolu için). */
  end?: boolean;
}

const SETTINGS_NAV: readonly SettingsNavItem[] = [
  { to: '/organizator/ayarlar', label: 'Profil Bilgileri', icon: 'person', end: true },
  { to: '/organizator/ayarlar/bildirimler', label: 'Bildirim Tercihleri', icon: 'notifications' },
  { to: '/organizator/ayarlar/guvenlik', label: 'Güvenlik', icon: 'lock' },
];

/** Ayarlar bölümünün iç navigasyonu ve içerik alanı. */
export function SettingsLayout() {
  return (
    <div className="mx-auto w-full max-w-container-max px-margin-mobile py-8 md:px-margin-desktop md:py-12">
      <header className="mb-8">
        <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">
          Ayarlar
        </h1>
        <p className="mt-2 font-body-lg text-body-lg text-on-surface-variant">
          Hesap bilgilerinizi, bildirim tercihlerinizi ve güvenlik ayarlarınızı yönetin.
        </p>
      </header>

      <div className="flex flex-col gap-gutter lg:flex-row">
        <nav aria-label="Ayarlar menüsü" className="flex shrink-0 gap-2 lg:w-64 lg:flex-col">
          {SETTINGS_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex flex-1 items-center gap-3 rounded-lg px-4 py-3 font-label-md text-label-md transition-colors lg:flex-none',
                  isActive
                    ? 'bg-surface-container-high font-semibold text-primary'
                    : 'text-secondary hover:bg-surface-container',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} size={20} filled={isActive} />
                  <span className="hidden sm:inline">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
