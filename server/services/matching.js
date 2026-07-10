// ============================================================================
// SponsorMatch Eslestirme Motoru
//
// Su an: deterministik, kural tabanli skorlama (0-100).
//
// >>> AI PLACEHOLDER <<<
// Proje planindaki "yapay zeka destekli eslestirme" icin gercek entegrasyon
// noktasi burasi. Uretim surumunde bu modul su sekilde genisletilebilir:
//   1. Etkinlik aciklamasi + sponsor profili metinlerinden embedding uret
//      (or. Claude API / bir embedding modeli) ve kosinus benzerligi ekle.
//   2. Skor aciklamasini ("neden eslesti?") bir LLM'e yazdir.
//   3. Gecmis kabul/red verisiyle agirliklari ogren (basit lojistik regresyon
//      bile yeterli baslangictir).
// Kural tabanli skor, AI katmani eklendiginde de taban (fallback) olarak
// kalmalidir — API erisimi olmadiginda sistem calismaya devam eder.
// ============================================================================

// Kategori <-> sektor yakinlik tablosu. Tam esleme 1.0, iliskili 0.6.
const SECTOR_AFFINITY = {
  teknoloji:    { teknoloji: 1, egitim: 0.6, girisimcilik: 0.8, finans: 0.6 },
  muzik:        { eglence: 1, muzik: 1, icecek: 0.7, gida: 0.6, medya: 0.6 },
  spor:         { spor: 1, saglik: 0.7, icecek: 0.7, giyim: 0.6 },
  egitim:       { egitim: 1, teknoloji: 0.7, yayincilik: 0.6, finans: 0.5 },
  girisimcilik: { girisimcilik: 1, teknoloji: 0.8, finans: 0.8, danismanlik: 0.6 },
  sanat:        { sanat: 1, medya: 0.7, moda: 0.6, eglence: 0.5 },
  other:        {}
};

const WEIGHTS = { sector: 40, budget: 25, city: 15, audience: 20 };

function sectorScore(eventCategory, sponsorSectors) {
  const table = SECTOR_AFFINITY[eventCategory] || {};
  let best = 0;
  for (const s of sponsorSectors) {
    const key = String(s).toLowerCase().trim();
    if (key === eventCategory) best = Math.max(best, 1);
    else if (table[key]) best = Math.max(best, table[key]);
    else best = Math.max(best, 0.1); // taniniyor ama iliskisiz: kucuk taban puani
  }
  return best;
}

function budgetScore(packages, budgetMin, budgetMax) {
  if (!budgetMax || !packages.length) return 0.5; // veri yoksa notr
  // Sponsorun butce araligina dusen en az bir paket varsa tam puan;
  // yoksa en yakin paketin uzakligina gore azalan puan.
  const prices = packages.map(p => p.price).filter(p => p > 0);
  if (!prices.length) return 0.5;
  const inRange = prices.some(p => p >= budgetMin && p <= budgetMax);
  if (inRange) return 1;
  const closest = Math.min(...prices.map(p => Math.min(Math.abs(p - budgetMin), Math.abs(p - budgetMax))));
  const ratio = closest / Math.max(budgetMax, 1);
  return Math.max(0, 1 - ratio); // %100 sapmada 0'a iner
}

function cityScore(eventCity, sponsorCity) {
  if (!eventCity || !sponsorCity) return 0.5; // veri yoksa notr
  return eventCity.toLowerCase().trim() === sponsorCity.toLowerCase().trim() ? 1 : 0.2;
}

function audienceScore(eventAudience, sponsorAudience) {
  // >>> AI PLACEHOLDER <<<
  // Iki serbest metin arasinda anlamsal benzerlik icin ideal nokta bir
  // embedding karsilastirmasidir. Su an: basit kelime kesisimi (Jaccard).
  const tokenize = t => new Set(String(t).toLowerCase().split(/[^a-zçğıöşü0-9]+/).filter(w => w.length > 2));
  const a = tokenize(eventAudience), b = tokenize(sponsorAudience);
  if (!a.size || !b.size) return 0.5;
  let common = 0;
  for (const w of a) if (b.has(w)) common++;
  return common / Math.min(a.size, b.size);
}

/**
 * Bir etkinlik ile bir sponsor profili arasinda 0-100 skor ve gerekce uretir.
 * @param event    events satiri + packages dizisi
 * @param sponsor  sponsor_profiles satiri (sectors: dizi olarak parse edilmis)
 */
function scoreMatch(event, sponsor) {
  const s = {
    sector: sectorScore(event.category, sponsor.sectors || []),
    budget: budgetScore(event.packages || [], sponsor.budget_min, sponsor.budget_max),
    city: cityScore(event.city, sponsor.city),
    audience: audienceScore(event.audience, sponsor.target_audience)
  };
  const total = Math.round(
    s.sector * WEIGHTS.sector + s.budget * WEIGHTS.budget +
    s.city * WEIGHTS.city + s.audience * WEIGHTS.audience
  );

  // Gerekce metni — uretimde bir LLM'in dogal dille yazacagi kisim.
  const reasons = [];
  if (s.sector >= 0.8) reasons.push('Sektor ve etkinlik kategorisi guclu ortusuyor');
  else if (s.sector >= 0.5) reasons.push('Sektor kategoriyle iliskili');
  if (s.budget === 1) reasons.push('Butce araligina uyan sponsorluk paketi mevcut');
  if (s.city === 1) reasons.push('Ayni sehirde');
  if (s.audience >= 0.5) reasons.push('Hedef kitleler benzesiyor');
  if (!reasons.length) reasons.push('Dusuk uyum: kriterler sinirli ortusuyor');

  return { score: total, breakdown: s, reasons };
}

module.exports = { scoreMatch };
