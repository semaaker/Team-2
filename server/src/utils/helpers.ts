import { randomUUID } from 'node:crypto';

/** Kısa, okunabilir kimlik üretir: "evt_9f3a1c2b". */
export function makeId(prefix: string): string {
  return `${prefix}_${randomUUID().replace(/-/g, '').slice(0, 8)}`;
}

/** 6 haneli doğrulama kodu. */
export function makeVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/** Türk Lirası biçimlendirmesi: 150000 -> "₺150.000" */
export function formatTRY(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/** Dizide sayfalama yapar ve istemcinin beklediği zarfı döner. */
export function paginate<T>(items: T[], page: number, pageSize: number) {
  const safePage = Math.max(1, page);
  const safeSize = Math.min(100, Math.max(1, pageSize));
  const start = (safePage - 1) * safeSize;
  const slice = items.slice(start, start + safeSize);

  return {
    items: slice,
    total: items.length,
    page: safePage,
    pageSize: safeSize,
    hasMore: start + slice.length < items.length,
  };
}

/** Yapay gecikme — istemcideki loading state'lerinin görünür olması için. */
export function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Türkçe karakterleri de doğru ele alan, aksan duyarsız arama karşılaştırması.
 * "sağlık" araması "Saglik" başlığını da bulur.
 */
export function normalize(value: string): string {
  return value
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/** `haystack` içinde `needle` geçiyor mu (aksan duyarsız). */
export function matches(haystack: string, needle: string): boolean {
  return normalize(haystack).includes(normalize(needle));
}
