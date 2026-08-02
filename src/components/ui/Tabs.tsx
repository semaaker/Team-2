import { cn } from '@/utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  items: readonly TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  /** `underline`: yatay sekmeler · `sidebar`: dikey liste (hukuki metinlerdeki gibi) */
  variant?: 'underline' | 'sidebar' | 'pill';
  className?: string;
}

/** Sekme geçişleri — Keşfet hızlı filtreleri ve hukuki metin navigasyonu için. */
export function Tabs({ items, activeId, onChange, variant = 'underline', className }: TabsProps) {
  if (variant === 'sidebar') {
    return (
      <nav className={cn('flex w-full flex-col gap-2', className)} aria-label="Bölümler">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onChange(item.id)}
              className={cn(
                'rounded-lg px-4 py-3 text-left font-label-md text-label-md transition-colors',
                isActive
                  ? 'bg-surface-container-high font-semibold text-primary'
                  : 'text-secondary hover:bg-surface-container',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    );
  }

  if (variant === 'pill') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)} role="tablist">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(item.id)}
              className={cn(
                'rounded-full border px-4 py-2 font-label-sm text-label-sm transition-colors',
                isActive
                  ? 'border-primary-fixed bg-primary-fixed text-on-primary-fixed shadow-sm'
                  : 'border-outline-variant bg-surface-container-low text-on-surface hover:bg-surface-container',
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex gap-8 border-b border-outline-variant', className)} role="tablist">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={cn(
              'border-b-2 pb-3 font-label-md text-label-md transition-all',
              isActive
                ? 'border-primary font-bold text-primary'
                : 'border-transparent text-secondary hover:text-primary',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
