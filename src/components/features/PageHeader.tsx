import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui';
import { cn } from '@/utils/cn';

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Sağdaki aksiyon butonları. */
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
  /** Başlığın altında gösterilecek rozet/etiketler. */
  meta?: ReactNode;
  className?: string;
}

/** Panel sayfalarının ortak başlık bloğu — breadcrumb, başlık, açıklama, aksiyon. */
export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Sayfa yolu" className="flex flex-wrap items-center gap-2 text-secondary">
          {breadcrumbs.map((crumb, index) => (
            <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="font-label-sm text-label-sm transition-colors hover:text-primary"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-label-sm text-label-sm text-on-background">
                  {crumb.label}
                </span>
              )}
              {index < breadcrumbs.length - 1 && <Icon name="chevron_right" size={16} />}
            </span>
          ))}
        </nav>
      )}

      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-display-lg-mobile text-display-lg-mobile text-primary md:font-display-lg md:text-display-lg">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
              {description}
            </p>
          )}
          {meta && <div className="mt-3 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>

        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}
