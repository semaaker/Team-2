import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { useAuth } from '@/store';
import { Avatar, Icon, Logo } from '@/components/ui';

export interface SideNavItem {
  to: string;
  label: string;
  icon: string;
  /** Yalnızca tam eşleşmede aktif say (kök panel yolu için). */
  end?: boolean;
}

interface SideNavBarProps {
  items: readonly SideNavItem[];
  /** Logonun altındaki alt başlık, örn. "Management Portal". */
  subtitle?: string;
  /** Menünün üstündeki birincil aksiyon. */
  primaryAction?: { label: string; icon: string; onClick: () => void };
  /** Mobilde açılır çekmece olarak gösterim. */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

/**
 * Panel yan menüsü (organizatör ve sponsor hub).
 * Masaüstünde sabit 256px kolon, mobilde kayan çekmece olarak davranır.
 */
export function SideNavBar({
  items,
  subtitle,
  primaryAction,
  mobileOpen = false,
  onMobileClose,
}: SideNavBarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  const content = (
    <>
      <div className="px-2 py-4">
        <Logo scale="sm" to="/" />
        {subtitle && <p className="mt-1 font-label-sm text-label-sm text-secondary">{subtitle}</p>}
      </div>

      {primaryAction && (
        <button
          type="button"
          onClick={primaryAction.onClick}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-4 py-3 font-label-md text-label-md text-on-primary transition-all hover:opacity-90 active:scale-95"
        >
          <Icon name={primaryAction.icon} size={18} />
          {primaryAction.label}
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-2" aria-label="Panel menüsü">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onMobileClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 font-label-md text-label-md transition-all',
                isActive
                  ? 'bg-primary-container text-on-primary'
                  : 'text-secondary hover:bg-secondary-fixed hover:text-primary',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} filled={isActive} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-1 border-t border-outline-variant pt-4">
        <NavLink
          to="/destek"
          onClick={onMobileClose}
          className="flex items-center gap-3 rounded-lg px-4 py-3 font-label-md text-label-md text-secondary transition-all hover:bg-surface-container hover:text-primary"
        >
          <Icon name="support_agent" />
          Destek
        </NavLink>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left font-label-md text-label-md text-secondary transition-all hover:bg-surface-container hover:text-error"
        >
          <Icon name="logout" />
          Çıkış Yap
        </button>

        {user && (
          <div className="flex items-center gap-3 border-t border-outline-variant px-2 pt-4">
            <Avatar name={user.fullName} src={user.avatarUrl} size={40} />
            <div className="min-w-0">
              <p className="truncate font-label-md text-label-md font-bold text-primary">
                {user.fullName}
              </p>
              <p className="truncate font-label-sm text-label-sm text-secondary">{user.title}</p>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Masaüstü — sabit kolon */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col gap-2 border-r border-outline-variant bg-surface-container-lowest p-4 shadow-soft md:sticky md:top-0 md:flex">
        {content}
      </aside>

      {/* Mobil — çekmece */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
            onClick={onMobileClose}
            aria-hidden
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] animate-scale-in flex-col gap-2 border-r border-outline-variant bg-surface-container-lowest p-4">
            <button
              type="button"
              aria-label="Menüyü kapat"
              onClick={onMobileClose}
              className="absolute right-3 top-3 rounded-lg p-2 text-secondary hover:bg-surface-container-low"
            >
              <Icon name="close" size={20} />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
