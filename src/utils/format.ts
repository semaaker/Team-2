/**
 * Görüntüleme biçimlendiricileri. Tasarımdaki metin formatlarını
 * (₺150.000, %92 Uyum, "3 saat önce") birebir üretir.
 */

const TRY_FORMATTER = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const NUMBER_FORMATTER = new Intl.NumberFormat('tr-TR');

const DATE_FORMATTER = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

const TIME_FORMATTER = new Intl.DateTimeFormat('tr-TR', {
  hour: '2-digit',
  minute: '2-digit',
});

/** 150000 -> "₺150.000" */
export function formatCurrency(value: number): string {
  return TRY_FORMATTER.format(value);
}

/** 5000 -> "5.000" */
export function formatNumber(value: number): string {
  return NUMBER_FORMATTER.format(value);
}

/** 92 -> "%92" (Türkçe yüzde gösterimi işaret önce gelir) */
export function formatPercent(value: number): string {
  return `%${Math.round(value)}`;
}

/** ISO tarih -> "15 Kasım 2024" */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return DATE_FORMATTER.format(date);
}

/** ISO tarih -> "14:32" */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return TIME_FORMATTER.format(date);
}

/** ISO tarih -> "3 saat önce" */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return 'az önce';
  if (minutes < 60) return `${minutes} dakika önce`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} gün önce`;

  return formatDate(iso);
}

/** "Ayşe Yılmaz" -> "AY" */
export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase('tr-TR') ?? '')
    .join('');
}

/**
 * AI uyum skoruna göre rozet renk sınıfları.
 * Tasarımda 90+ yeşil, 80-89 mavi, altı sarı tonlardadır.
 */
export function matchScoreTone(score: number): { dot: string; chip: string } {
  if (score >= 90) {
    return { dot: 'bg-green-500', chip: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  }
  if (score >= 80) {
    return { dot: 'bg-green-500', chip: 'bg-blue-100 text-blue-800 border-blue-200' };
  }
  return { dot: 'bg-yellow-500', chip: 'bg-amber-100 text-amber-800 border-amber-200' };
}
