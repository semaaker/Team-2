import { Card, Icon, Skeleton } from '@/components/ui';
import { cn } from '@/utils/cn';
import type { StatMetric } from '@/types';

interface StatCardProps {
  metric: StatMetric;
  /** Landing sayfasındaki ortalanmış varyant. */
  centered?: boolean;
}

/**
 * Panel ve landing sayfasındaki metrik kartı.
 * Değer, backend'den gelen `StatMetric` ile beslenir — hardcoded değildir.
 */
export function StatCard({ metric, centered = false }: StatCardProps) {
  return (
    <Card className={cn('flex flex-col gap-2', centered && 'items-center text-center')}>
      <div className="mb-2 flex items-center gap-2 font-label-md text-label-md text-secondary">
        <Icon name={metric.icon} className="text-primary-container" />
        {metric.label}
      </div>

      <div className="flex items-baseline gap-3">
        <span className="font-display-lg-mobile text-display-lg-mobile text-primary">
          {metric.value}
        </span>
        {metric.trend && (
          <span
            className={cn(
              'flex items-center gap-0.5 rounded-full px-2 py-1 font-label-sm text-label-sm',
              metric.trend.direction === 'up'
                ? 'bg-success-bg text-success'
                : 'bg-error-container text-on-error-container',
            )}
          >
            <Icon
              name={metric.trend.direction === 'up' ? 'trending_up' : 'trending_down'}
              size={14}
            />
            {metric.trend.label}
          </span>
        )}
      </div>

      {metric.hint && (
        <p className="font-label-sm text-label-sm text-on-secondary-container">{metric.hint}</p>
      )}
    </Card>
  );
}

/** Metrik kartlarının yükleniyor hâli. */
export function StatCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-9 w-20" />
    </Card>
  );
}
