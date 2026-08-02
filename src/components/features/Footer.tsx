import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui';
import { COPYRIGHT } from '@/utils/constants';

const LINKS = [
  { to: '/gizlilik', label: 'Gizlilik Politikası' },
  { to: '/kosullar', label: 'Kullanım Şartları' },
  { to: '/destek', label: 'Destek Merkezi' },
] as const;

/** Herkese açık sayfaların alt bilgisi. */
export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-outline-variant bg-surface">
      <div className="mx-auto flex w-full max-w-container-max flex-col items-center justify-between gap-6 px-margin-mobile py-8 md:flex-row md:gap-0 md:px-margin-desktop">
        <Logo size={24} scale="sm" to="/" />

        <p className="text-center font-label-sm text-label-sm text-secondary md:text-left">
          {COPYRIGHT}
        </p>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="font-label-sm text-label-sm text-secondary transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
