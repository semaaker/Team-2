import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { MobileTopBar, SideNavBar, type SideNavItem } from '@/components/features';

const NAV_ITEMS: readonly SideNavItem[] = [
  { to: '/sponsor', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/sponsor/eslesmeler', label: 'Eşleşmeler', icon: 'handshake' },
  { to: '/sponsor/sponsorluklar', label: 'Sponsorluklarım', icon: 'assignment' },
  { to: '/sponsor/mesajlar', label: 'Mesajlar', icon: 'chat' },
  { to: '/organizator/ayarlar', label: 'Ayarlar', icon: 'settings' },
];

/** Sponsor hub'ının kabuğu. */
export function SponsorLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-surface font-sans text-on-surface antialiased">
      <SideNavBar
        items={NAV_ITEMS}
        subtitle="Sponsor Hub · Premium Tier"
        primaryAction={{
          label: 'Yeni Sponsorluk Bul',
          icon: 'add',
          onClick: () => navigate('/sponsor/eslesmeler'),
        }}
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
