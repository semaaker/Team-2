import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

/**
 * Veri tablosu ilkelleri (DESIGN.md → Data Tables):
 * dikey çizgi yok, 1px yatay ayraç, Ice Blue başlık satırı.
 */

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-left', className)}>{children}</table>
    </div>
  );
}

export function TableHead({
  columns,
}: {
  columns: readonly { key: string; label: string; align?: 'left' | 'right' }[];
}) {
  return (
    <thead>
      <tr className="border-b border-surface-variant bg-ice-blue">
        {columns.map((column) => (
          <th
            key={column.key}
            scope="col"
            className={cn(
              'px-6 py-4 font-label-sm text-label-sm font-semibold text-secondary',
              column.align === 'right' && 'text-right',
            )}
          >
            {column.label}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="font-body-md text-body-md text-on-surface">{children}</tbody>;
}

export function TableRow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr
      className={cn(
        'border-b border-surface-variant transition-colors last:border-b-0 hover:bg-inverse-on-surface',
        className,
      )}
    >
      {children}
    </tr>
  );
}

export function TableCell({
  children,
  align = 'left',
  className,
}: {
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
}) {
  return (
    <td className={cn('px-6 py-4', align === 'right' && 'text-right', className)}>{children}</td>
  );
}

/** Tablo içi boş durum satırı. */
export function TableEmpty({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-16 text-center font-body-md text-body-md text-secondary"
      >
        {message}
      </td>
    </tr>
  );
}
