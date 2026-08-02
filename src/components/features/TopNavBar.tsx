import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useAuth } from '@/store';
import { useClickOutside } from '@/hooks';
import { Avatar, Button, Icon, Logo } from '@/components/ui';

const NAV_LINKS = [
  { to: '/kesfet', label: 'Keşfet' },
  { to: '/organizator', label: 'Organizatör Paneli' },
  { to: '/sponsor', label: 'Sponsor Paneli' },
] as const;

/**
 * Herkese açık sayfaların üst navigasyonu.
 * Oturum açıksa "Giriş Yap" butonu yerine profil menüsü gösterilir.
 */
export function TopNavBar() {
  const { isAuthenticated, user, signOut, homePathFor } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuRef = useClickOutside<HTMLDivElement>(() => setMenuOpen(false), menuOpen);

  async function handleSignOut() {
    setMenuOpen(false);
    await signOut();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-surface">
      <div className="mx-auto flex w-full max-w-container-max items-center justify-between px-margin-mobile py-4 md:px-margin-desktop">
        <Logo to="/" />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'border-b-2 pb-1 font-body-md text-body-md transition-colors',
                  isActive
                    ? 'border-primary font-bold text-primary'
                    : 'border-transparent text-secondary hover:border-primary hover:text-primary',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-surface-container-low"
              >
                <Avatar name={user.fullName} src={user.avatarUrl} size={32} />
                <span className="hidden font-label-md text-label-md text-primary sm:inline">
                  {user.fullName}
                </span>
                <Icon name="expand_more" size={18} className="text-secondary" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full mt-2 w-56 animate-scale-in overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest shadow-soft"
                >
                  <div className="border-b border-outline-variant px-4 py-3">
                    <p className="font-label-md text-label-md font-semibold text-primary">
                      {user.companyName}
                    </p>
                    <p className="font-label-sm text-label-sm text-secondary">{user.email}</p>
                  </div>
                  <Link
                    to={homePathFor()}
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-secondary transition-colors hover:bg-surface-container-low hover:text-primary"
                  >
                    <Icon name="dashboard" size={18} />
                    Panelim
                  </Link>
                  <Link
                    to="/organizator/ayarlar"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 font-label-md text-label-md text-secondary transition-colors hover:bg-surface-container-low hover:text-primary"
                  >
                    <Icon name="settings" size={18} />
                    Ayarlar
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 border-t border-outline-variant px-4 py-3 text-left font-label-md text-label-md text-error transition-colors hover:bg-error-container/40"
                  >
                    <Icon name="logout" size={18} />
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => navigate('/giris')}>
              Giriş Yap
            </Button>
          )}

          <button
            type="button"
            aria-label="Menüyü aç"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="rounded-lg p-2 text-primary transition-colors hover:bg-surface-container-low md:hidden"
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-outline-variant bg-surface-container-lowest px-margin-mobile py-2 md:hidden">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block rounded-lg px-4 py-3 font-body-md text-body-md transition-colors',
                  isActive ? 'bg-surface-container-low font-bold text-primary' : 'text-secondary',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
