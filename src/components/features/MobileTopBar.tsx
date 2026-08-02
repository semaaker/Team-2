import { Icon, Logo } from '@/components/ui';

interface MobileTopBarProps {
  onMenuClick: () => void;
}

/** Panel sayfalarında yan menü gizliyken görünen mobil üst çubuk. */
export function MobileTopBar({ onMenuClick }: MobileTopBarProps) {
  return (
    <header className="sticky top-0 z-10 flex w-full items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-margin-mobile py-4 md:hidden">
      <Logo size={28} scale="sm" to="/" />
      <button
        type="button"
        aria-label="Menüyü aç"
        onClick={onMenuClick}
        className="rounded-lg p-2 text-primary transition-colors hover:bg-surface-container-low"
      >
        <Icon name="menu" />
      </button>
    </header>
  );
}
