import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { MobileTopBar, SideNavBar, type SideNavItem } from '@/components/features';

const NAV_ITEMS: readonly SideNavItem[] = [
  { to: '/organizator', label: 'Sayfam', icon: 'dashboard', end: true },
  { to: '/organizator/etkinlikler', label: 'Etkinliklerim', icon: 'calendar_today' },
  { to: '/organizator/mesajlar', label: 'Mesajlar', icon: 'chat' },
  { to: '/organizator/faturalandirma', label: 'Faturalandırma', icon: 'receipt_long' },
  { to: '/organizator/ayarlar', label: 'Ayarlar', icon: 'settings' },
];

/** Organizatör panelinin kabuğu: sabit yan menü + kaydırılabilir içerik. */
export function OrganizerLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background font-sans text-on-surface antialiased">
      <SideNavBar
        items={NAV_ITEMS}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
