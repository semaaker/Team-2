/** Uygulama genelinde tekrar eden sabitler. */

export const APP_NAME = 'SponsorMatch AI';

export const COPYRIGHT = `© ${new Date().getFullYear()} ${APP_NAME}. Tüm hakları saklıdır.`;

/** Oturum token'ının localStorage anahtarı. */
export const TOKEN_STORAGE_KEY = 'sponsormatch.token';

/** Tasarımdaki "Yeni Etkinlik Ekle" formunun kategori listesi (birebir). */
export const EVENT_CATEGORIES = [
  'Eğitim & Akademi',
  'Enerji & Madencilik',
  'E-Ticaret & Perakende',
  'Finans & Fintech',
  'Gastronomi & Gıda',
  'Gayrimenkul & Proptech',
  'Havacılık & Uzay',
  'Kimya & Malzeme Bilimi',
  'Lojistik & Tedarik Zinciri',
  'Moda & Tasarım',
  'Otomotiv & Ulaşım',
  'Oyun & E-Spor',
  'Perakende & Mağazacılık Altyapıları',
  'Sağlık & Biyoteknoloji',
  'Sanat, Medya & Eğlence',
  'Sigortacılık (Insurtech)',
  'Sosyal Sorumluluk & Sivil Toplum',
  'Spor & Fitness',
  'Sürdürülebilirlik & Çevre',
  'Tarım Teknolojileri (AgTech)',
  'Teknoloji & Yazılım',
  'Telekomünikasyon',
  'Turizm & Seyahat (TravelTech)',
] as const;

/** Beklenen katılımcı aralıkları (tasarımdaki select ile aynı). */
export const PARTICIPANT_RANGES = [
  { value: '1000+', label: '1.000+' },
  { value: '3000+', label: '3.000+' },
  { value: '5000+', label: '5.000+' },
  { value: '10000+', label: '10.000+' },
] as const;

/** Sponsorluk paket seviyeleri. */
export const SPONSOR_PACKAGES = ['Elmas', 'Platin', 'Altın', 'Gümüş', 'Bronz'] as const;

/** Keşfet ekranındaki hızlı filtreler. */
export const QUICK_FILTERS = [
  { value: '', label: 'Tümü' },
  { value: 'Teknoloji', label: 'Teknoloji' },
  { value: 'Sağlık', label: 'Sağlık' },
  { value: 'Finans', label: 'Finans' },
  { value: 'Sürdürülebilirlik', label: 'Sürdürülebilirlik' },
] as const;

/** Destek formundaki talep kategorileri. */
export const SUPPORT_CATEGORIES = [
  'Teknik Sorun',
  'Faturalandırma',
  'Hesap ve Güvenlik',
  'Eşleşme Kriterleri',
  'Algoritma Denetimi',
  'Diğer',
] as const;

/** Teklif durumu -> Türkçe etiket. */
export const PROPOSAL_STATUS_LABELS: Record<string, string> = {
  pending: 'Beklemede',
  approved: 'Onaylandı',
  cancelled: 'İptal',
};

/** Sponsorluk durumu -> Türkçe etiket. */
export const SPONSORSHIP_STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  negotiating: 'Görüşmede',
  completed: 'Tamamlandı',
  cancelled: 'İptal',
};

/** Fatura durumu -> Türkçe etiket. */
export const INVOICE_STATUS_LABELS: Record<string, string> = {
  paid: 'Ödendi',
  pending: 'Bekliyor',
  failed: 'Başarısız',
};
