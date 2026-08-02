import { env } from '../config/env.js';
import { normalize } from '../utils/helpers.js';
import type { EventItem, Sponsor } from '../types.js';

/**
 * Yapay zeka eşleştirme katmanı.
 *
 * İki çalışma kipi vardır:
 *
 *  1. **n8n + Google Gemini** — `AI_WEBHOOK_URL` tanımlıysa skorlama,
 *     `workflows/03-sponsormatch-api.json` akışına devredilir.
 *  2. **Yerel kural motoru** — webhook tanımlı değilse ya da çağrı başarısız
 *     olursa aynı kriterleri (sektör, vizyon, kitle, bütçe) deterministik
 *     olarak puanlayan yerleşik motor devreye girer.
 *
 * Bu ayrım bilinçlidir: demo/CI ortamında dış servis olmadan da uygulama
 * eksiksiz çalışır, üretimde ise tek bir ortam değişkeniyle gerçek LLM'e geçilir.
 */

/* -------------------------------------------------------------------------- */
/* Tipler                                                                      */
/* -------------------------------------------------------------------------- */

/** Skorlamanın girdisi olan sponsor kriterleri. */
export interface SponsorCriteria {
  sponsorId?: string;
  companyName: string;
  industry: string;
  focusAreas: string[];
  esgGoals: string[];
  brandVision: string;
  minBudget?: number;
  maxBudget?: number;
}

/** Tek bir etkinlik için üretilen değerlendirme. */
export interface EventAnalysis {
  eventId: string;
  score: number;
  note: string;
  /** Skorun nasıl oluştuğunu gösteren kırılım — UI'da şeffaflık için. */
  breakdown: { label: string; earned: number; max: number }[];
}

export type AiSource = 'n8n' | 'local' | 'local-fallback';

export interface AnalysisResult {
  analyses: EventAnalysis[];
  source: AiSource;
  /** n8n denendi ve başarısız olduysa nedeni. */
  warning?: string;
}

/* -------------------------------------------------------------------------- */
/* Yardımcılar                                                                 */
/* -------------------------------------------------------------------------- */

/** Türkçe stop-word'leri ve tek harfleri eleyerek anlamlı kelime kümesi çıkarır. */
const STOP_WORDS = new Set([
  've',
  'ile',
  'icin',
  'bir',
  'bu',
  'da',
  'de',
  'en',
  'the',
  'and',
  'for',
  'ltd',
  'as',
  'sti',
  'inc',
]);

function tokenize(value: string): string[] {
  return normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function tokenSet(values: string[]): Set<string> {
  const set = new Set<string>();
  for (const value of values) for (const token of tokenize(value)) set.add(token);
  return set;
}

/**
 * İki kelimenin aynı kökten gelip gelmediğine bakar.
 *
 * Türkçe sondan eklemeli bir dil olduğu için birebir eşitlik yetersiz kalır:
 * "şehir" ile "şehirler", "enerji" ile "enerjisi" aynı kavramı işaret eder.
 * Bu yüzden 4+ harfli kelimelerde ön ek içerme de eşleşme sayılır.
 */
function sameStem(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length >= 4 && b.startsWith(a)) return true;
  if (b.length >= 4 && a.startsWith(b)) return true;
  return false;
}

/** İki kelime kümesinin kök duyarlı kesişim oranı (0-1). */
function overlapRatio(needles: Set<string>, haystack: Set<string>): number {
  if (needles.size === 0) return 0;

  let hits = 0;
  for (const needle of needles) {
    for (const candidate of haystack) {
      if (sameStem(needle, candidate)) {
        hits += 1;
        break;
      }
    }
  }

  return hits / needles.size;
}

/**
 * Paket etiketini sayısal TL değerine çevirir.
 * "$50k" -> 1.700.000 ₺, "₺150.000" -> 150.000, "250 bin" -> 250.000
 */
const USD_TO_TRY = 34;

export function parsePriceLabel(label: string): number | null {
  const raw = label.trim();
  const isUsd = raw.includes('$') || /usd/i.test(raw);

  // Binlik ayırıcıları at, ondalık virgülü noktaya çevir.
  const numeric = raw
    .replace(/[^\d.,k]/gi, '')
    .replace(/\./g, '')
    .replace(/,/g, '.');
  const match = numeric.match(/([\d.]+)\s*k?/i);
  if (!match) return null;

  let value = Number.parseFloat(match[1]);
  if (!Number.isFinite(value)) return null;

  if (/k/i.test(numeric)) value *= 1000;
  if (/\bbin\b/i.test(raw)) value *= 1000;
  if (/\bmilyon\b/i.test(raw)) value *= 1_000_000;
  if (isUsd) value *= USD_TO_TRY;

  return Math.round(value);
}

/** "₺12.000.000" gibi etiketten yıllık bütçeyi çıkarır. */
export function parseBudgetLabel(label: string): number | null {
  const numeric = label.replace(/[^\d]/g, '');
  if (!numeric) return null;
  const value = Number.parseInt(numeric, 10);
  return Number.isFinite(value) ? value : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/* -------------------------------------------------------------------------- */
/* Yerel kural motoru                                                          */
/* -------------------------------------------------------------------------- */

const WEIGHTS = {
  sector: 40,
  vision: 25,
  audience: 20,
  budget: 15,
} as const;

/**
 * Skor kırılımının tek kaynağı.
 *
 * Hem yerel motor hem n8n akışı aynı dört kriteri kullanır; `key` alanı akışın
 * `kriterler` nesnesinde döndürdüğü anahtarlarla eşleşir. Böylece hangi motor
 * çalışırsa çalışsın arayüzdeki kırılım aynı etiket ve tavan değerleriyle gelir.
 */
const CRITERIA = [
  { key: 'sektor', label: 'Sektör uyumu', max: WEIGHTS.sector },
  { key: 'vizyon', label: 'Vizyon & ESG örtüşmesi', max: WEIGHTS.vision },
  { key: 'katilimci', label: 'Katılımcı ölçeği', max: WEIGHTS.audience },
  { key: 'butce', label: 'Bütçe uygunluğu', max: WEIGHTS.budget },
] as const;

/**
 * Tek bir etkinliği sponsor kriterlerine göre puanlar.
 *
 * n8n akışındaki sistem mesajıyla aynı dört kriteri kullanır; böylece iki kip
 * arasında geçiş yapıldığında sonuçlar aynı mantıksal çerçevede kalır.
 */
export function scoreEvent(event: EventItem, criteria: SponsorCriteria): EventAnalysis {
  const eventTokens = tokenSet([event.name, event.category, event.description]);

  /* 1. Sektör ve odak alanı örtüşmesi */
  const industryTokens = tokenSet([criteria.industry]);
  const focusTokens = tokenSet(criteria.focusAreas);
  const sectorRatio =
    0.6 * overlapRatio(industryTokens, eventTokens) + 0.4 * overlapRatio(focusTokens, eventTokens);
  // Hiç örtüşme yoksa bile taban puan verilir: sektör dışı sponsorluk da mümkündür.
  const sectorScore = 8 + sectorRatio * (WEIGHTS.sector - 8);

  /* 2. Marka vizyonu ve ESG hedefleriyle tematik yakınlık */
  const visionTokens = tokenSet([criteria.brandVision, ...criteria.esgGoals]);
  const visionScore = 4 + overlapRatio(visionTokens, eventTokens) * (WEIGHTS.vision - 4);

  /* 3. Katılımcı ölçeği — 10.000 katılımcıda tavan yapar */
  const audienceScore = clamp(event.attendees / 10000, 0, 1) * WEIGHTS.audience;

  /* 4. Paket fiyatlarının bütçe aralığına uygunluğu */
  const packagePrices = event.packages
    .map((pkg) => parsePriceLabel(pkg.priceLabel))
    .filter((price): price is number => price !== null);

  let budgetScore = WEIGHTS.budget * 0.5; // bütçe bilgisi yoksa nötr
  if (packagePrices.length && (criteria.minBudget || criteria.maxBudget)) {
    const min = criteria.minBudget ?? 0;
    const max = criteria.maxBudget ?? Number.POSITIVE_INFINITY;
    const affordable = packagePrices.filter((price) => price >= min && price <= max).length;
    budgetScore = (affordable / packagePrices.length) * WEIGHTS.budget;
  }

  const earned = [sectorScore, visionScore, audienceScore, budgetScore];
  const breakdown = CRITERIA.map((criterion, index) => ({
    label: criterion.label,
    earned: Math.round(earned[index]),
    max: criterion.max,
  }));

  const score = clamp(
    breakdown.reduce((total, item) => total + item.earned, 0),
    0,
    100,
  );

  return {
    eventId: event.id,
    score,
    note: buildNote(event, criteria, score, breakdown),
    breakdown,
  };
}

/** Skorun gerekçesini tek cümlelik, kurumsal bir nota çevirir. */
function buildNote(
  event: EventItem,
  criteria: SponsorCriteria,
  score: number,
  breakdown: EventAnalysis['breakdown'],
): string {
  const strongest = [...breakdown].sort((a, b) => b.earned / b.max - a.earned / a.max)[0];
  const weakest = [...breakdown].sort((a, b) => a.earned / a.max - b.earned / b.max)[0];

  if (score >= 85) {
    return `${event.name}, ${criteria.companyName} profiliyle %${score} örtüşüyor; en güçlü katkı "${strongest.label}" kriterinden geliyor.`;
  }
  if (score >= 65) {
    return `Uyum oranı %${score}. "${strongest.label}" olumlu, ancak "${weakest.label}" beklenenin altında kalıyor.`;
  }
  return `Uyum oranı %${score}. "${weakest.label}" kriteri zayıf olduğu için bu etkinlik öncelikli öneri listesinde değil.`;
}

/** Tüm etkinlikleri yerel motorla puanlar. */
function scoreLocally(events: EventItem[], criteria: SponsorCriteria): EventAnalysis[] {
  return events.map((event) => scoreEvent(event, criteria));
}

/* -------------------------------------------------------------------------- */
/* n8n köprüsü                                                                 */
/* -------------------------------------------------------------------------- */

/** n8n akışının döndürebileceği alan adlarının hepsini tolere eder. */
interface RawAiResult {
  eventId?: string;
  id?: string;
  uyum_orani?: number | string;
  score?: number | string;
  yapay_zeka_notu?: string;
  note?: string;
  /** Kriter anahtarına göre puanlar: `{ sektor: 33, vizyon: 18, ... }` */
  kriterler?: Record<string, number | string>;
  /** Ya da doğrudan arayüzün beklediği biçim. */
  breakdown?: { label?: string; earned?: number | string; max?: number | string }[];
}

function readNumber(value: unknown): number | null {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value;
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null;
}

/**
 * Akışın gönderdiği skor kırılımını okur.
 *
 * Kırılım isteğe bağlıdır: eski sürüm bir akış yalnızca skor ve not döndürürse
 * boş dizi döner ve arayüz kırılım bölümünü gizler. Böylece akış güncellenmeden
 * de entegrasyon çalışmayı sürdürür.
 */
function parseBreakdown(row: RawAiResult): EventAnalysis['breakdown'] {
  if (Array.isArray(row.breakdown)) {
    const items = row.breakdown.flatMap((item) => {
      const earned = readNumber(item.earned);
      const max = readNumber(item.max);
      if (!item.label || earned === null || max === null || max <= 0) return [];
      return [{ label: item.label, earned: Math.round(clamp(earned, 0, max)), max }];
    });
    if (items.length) return items;
  }

  if (row.kriterler) {
    const items = CRITERIA.flatMap((criterion) => {
      const value = readNumber(row.kriterler?.[criterion.key]);
      if (value === null) return [];
      return [
        {
          label: criterion.label,
          earned: Math.round(clamp(value, 0, criterion.max)),
          max: criterion.max,
        },
      ];
    });
    if (items.length) return items;
  }

  return [];
}

/** n8n yanıtını `EventAnalysis` listesine indirger; tanınmayan kayıtları atar. */
function parseWebhookResponse(payload: unknown, events: EventItem[]): EventAnalysis[] {
  // Akış `{ results: [...] }`, düz dizi ya da tek nesne döndürebilir.
  const container =
    payload && typeof payload === 'object' && 'results' in payload
      ? (payload as { results: unknown }).results
      : payload;

  const rows: RawAiResult[] = Array.isArray(container)
    ? (container as RawAiResult[])
    : container && typeof container === 'object'
      ? [container as RawAiResult]
      : [];

  const known = new Map(events.map((event) => [event.id, event]));
  const analyses: EventAnalysis[] = [];

  for (const row of rows) {
    const eventId = row.eventId ?? row.id;
    const event = eventId ? known.get(eventId) : undefined;
    if (!event) continue;

    const score = readNumber(row.uyum_orani ?? row.score);
    if (score === null) continue;

    analyses.push({
      eventId: event.id,
      score: Math.round(clamp(score, 0, 100)),
      note: (row.yapay_zeka_notu ?? row.note ?? '').trim() || `Uyum oranı %${Math.round(score)}.`,
      breakdown: parseBreakdown(row),
    });
  }

  return analyses;
}

/**
 * Yeniden denemeye değer hata sınıfı.
 *
 * Bağlantı kopması, 429 ve 5xx geçicidir; 4xx (yanlış adres, geçersiz token) ve
 * bozuk gövde tekrar denemekle düzelmez, o yüzden doğrudan yerel motora düşülür.
 */
class TransientWebhookError extends Error {}

const MAX_WEBHOOK_ATTEMPTS = 2;

async function requestWebhook(body: string, timeoutMs: number): Promise<unknown> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (env.AI_WEBHOOK_TOKEN) headers['X-SponsorMatch-Token'] = env.AI_WEBHOOK_TOKEN;

  let response: Response;
  try {
    response = await fetch(env.AI_WEBHOOK_URL, {
      method: 'POST',
      headers,
      signal: AbortSignal.timeout(timeoutMs),
      body,
    });
  } catch (error) {
    // Bağlantı kurulamadı ya da süre doldu — ikisi de geçici sayılır.
    throw new TransientWebhookError(error instanceof Error ? error.message : 'ağ hatası');
  }

  if (!response.ok) {
    const message = `n8n akışı ${response.status} döndürdü.`;
    if (response.status === 429 || response.status >= 500) {
      throw new TransientWebhookError(message);
    }
    throw new Error(message);
  }

  return response.json();
}

/**
 * Akışı çağırır ve gerekirse bir kez yeniden dener.
 *
 * Yeniden deneme `AI_TIMEOUT_MS` ile belirlenen *toplam* bütçeyi paylaşır; ilk
 * deneme zaman aşımına uğradıysa bütçe biter ve ikinci deneme yapılmaz. Böylece
 * ek gecikme yalnızca hızlı başarısızlıklarda (bağlantı reddi, anlık 5xx)
 * oluşur ve isteğin toplam süresi hiçbir zaman bütçeyi aşmaz.
 */
async function scoreViaWebhook(
  events: EventItem[],
  criteria: SponsorCriteria,
): Promise<EventAnalysis[]> {
  const body = JSON.stringify({
    sponsor: criteria,
    events: events.map((event) => ({
      id: event.id,
      name: event.name,
      category: event.category,
      description: event.description,
      attendees: event.attendees,
      packages: event.packages.map((pkg) => ({ tier: pkg.tier, priceLabel: pkg.priceLabel })),
    })),
  });

  const deadline = Date.now() + env.AI_TIMEOUT_MS;
  let lastError: Error = new Error('n8n akışına ulaşılamadı.');

  for (let attempt = 1; attempt <= MAX_WEBHOOK_ATTEMPTS; attempt += 1) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) break;

    try {
      const analyses = parseWebhookResponse(await requestWebhook(body, remaining), events);
      if (analyses.length === 0) {
        throw new Error('n8n akışından tanınabilir bir sonuç gelmedi.');
      }
      return analyses;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (!(error instanceof TransientWebhookError)) break;
    }
  }

  throw lastError;
}

/* -------------------------------------------------------------------------- */
/* Genel API                                                                   */
/* -------------------------------------------------------------------------- */

/** Yapılandırılmış sağlayıcı — `/api/ai/status` ve UI rozeti bunu kullanır. */
export function aiProvider(): { provider: 'n8n' | 'local'; configured: boolean } {
  const configured = env.AI_WEBHOOK_URL.length > 0;
  return { provider: configured ? 'n8n' : 'local', configured };
}

/**
 * Etkinlikleri sponsor kriterlerine göre değerlendirir.
 *
 * n8n yapılandırılmışsa önce o denenir; her tür hatada (zaman aşımı, 5xx,
 * bozuk yanıt) sessizce yerel motora düşülür ve neden `warning` ile döner.
 * Böylece dış servis çökse bile eşleşme ekranı boş kalmaz.
 */
export async function analyzeEvents(
  events: EventItem[],
  criteria: SponsorCriteria,
): Promise<AnalysisResult> {
  if (!env.AI_WEBHOOK_URL) {
    return { analyses: scoreLocally(events, criteria), source: 'local' };
  }

  try {
    const analyses = await scoreViaWebhook(events, criteria);

    // Akış bazı etkinlikleri atlamış olabilir; eksikleri yerel motorla tamamla.
    const covered = new Set(analyses.map((item) => item.eventId));
    const missing = events.filter((event) => !covered.has(event.id));

    return { analyses: [...analyses, ...scoreLocally(missing, criteria)], source: 'n8n' };
  } catch (error) {
    return {
      analyses: scoreLocally(events, criteria),
      source: 'local-fallback',
      warning:
        error instanceof Error
          ? `Yapay zeka servisine ulaşılamadı (${error.message}); yerel skorlama kullanıldı.`
          : 'Yapay zeka servisine ulaşılamadı; yerel skorlama kullanıldı.',
    };
  }
}

/**
 * Sponsor kaydını skorlama kriterlerine çevirir.
 * Kayıt yoksa platform genelini temsil eden nötr bir profil üretilir.
 */
export function criteriaFromSponsor(
  sponsor: Sponsor | undefined,
  companyName?: string,
): SponsorCriteria {
  if (!sponsor) {
    return {
      companyName: companyName ?? 'Markanız',
      industry: '',
      focusAreas: [],
      esgGoals: [],
      brandVision: '',
    };
  }

  const annualBudget = parseBudgetLabel(sponsor.annualBudgetLabel);

  return {
    sponsorId: sponsor.id,
    companyName: sponsor.name,
    industry: sponsor.industry,
    focusAreas: sponsor.focusAreas,
    esgGoals: sponsor.esgGoals,
    brandVision: sponsor.about,
    // Yıllık bütçenin %1'i ile %25'i tek bir etkinlik için makul aralık kabul edilir.
    minBudget: annualBudget ? Math.round(annualBudget * 0.01) : undefined,
    maxBudget: annualBudget ? Math.round(annualBudget * 0.25) : undefined,
  };
}
