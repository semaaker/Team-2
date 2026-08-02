import { z } from 'zod';
import type { Request, Response } from 'express';
import { db } from '../data/db.js';
import { ApiError } from '../utils/ApiError.js';
import { matches, normalize } from '../utils/helpers.js';
import {
  aiProvider,
  analyzeEvents,
  criteriaFromSponsor,
  scoreEvent,
  type SponsorCriteria,
} from '../services/aiMatching.js';
import type { EventItem, MatchItem, User } from '../types.js';

/**
 * Yapay zeka uçları.
 *
 * Skorlama mantığı `services/aiMatching.ts` içinde yaşar; buradaki iş,
 * oturumdaki kullanıcıdan sponsor kriterlerini çözmek ve sonucu istemcinin
 * beklediği zarfa sarmaktır.
 */

export const aiMatchSchema = z.object({
  category: z.string().trim().max(80).optional(),
  sort: z.enum(['score', 'date']).optional(),
  /** İstemci kriterleri geçici olarak ezebilir ("senaryo dene" akışı). */
  brandVision: z.string().trim().max(2000).optional(),
  focusAreas: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  minBudget: z.number().int().nonnegative().optional(),
  maxBudget: z.number().int().nonnegative().optional(),
});

/**
 * Oturumdaki kullanıcı için sponsor kriterlerini çözer.
 *
 * Sponsor kayıtları şirket adı üzerinden eşleştirilir; organizatör hesapları
 * ya da eşleşmeyen şirketler için nötr profil döner (skorlama yine çalışır).
 */
export function resolveCriteria(user: User | undefined): SponsorCriteria {
  if (!user) return criteriaFromSponsor(undefined);

  const sponsor = db.sponsors.find((item) => normalize(item.name) === normalize(user.companyName));

  return criteriaFromSponsor(sponsor, user.companyName);
}

/** Kullanıcı gövdede kriter gönderdiyse çözülen profilin üzerine yazar. */
function applyOverrides(
  criteria: SponsorCriteria,
  body: z.infer<typeof aiMatchSchema>,
): SponsorCriteria {
  return {
    ...criteria,
    brandVision: body.brandVision ?? criteria.brandVision,
    focusAreas: body.focusAreas ?? criteria.focusAreas,
    minBudget: body.minBudget ?? criteria.minBudget,
    maxBudget: body.maxBudget ?? criteria.maxBudget,
  };
}

/** Etkinlik + değerlendirmeyi istemcinin `MatchItem` sözleşmesine çevirir. */
function toMatchItem(
  event: EventItem,
  score: number,
  note: string,
  breakdown: MatchItem['breakdown'],
): MatchItem {
  return {
    id: `mth_${event.id}`,
    eventId: event.id,
    eventName: event.name,
    dateLabel: event.dateLabel,
    location: event.location,
    attendeesLabel: event.attendeesLabel,
    industry: event.category.split('&')[0].trim(),
    categories: event.packages.map((pkg) => pkg.name),
    matchScore: score,
    coverImageUrl: event.coverImageUrl,
    aiNote: note,
    breakdown,
  };
}

/**
 * Etkinlikleri değerlendirip sıralanmış eşleşme listesi üretir.
 * Hem `/api/matches` hem `/api/ai/matches` bu ortak yolu kullanır.
 */
export async function buildRankedMatches(
  user: User | undefined,
  options: z.infer<typeof aiMatchSchema>,
) {
  const criteria = applyOverrides(resolveCriteria(user), options);

  // Yalnızca sponsor arayan etkinlikler değerlendirmeye girer; taslak ve
  // kapanmış etkinlikler eşleşme listesinde yer almaz.
  const candidates = db.events.filter((event) => event.status !== 'draft');

  const { analyses, source, warning } = await analyzeEvents(candidates, criteria);
  const byId = new Map(analyses.map((item) => [item.eventId, item]));

  let items = candidates.map((event) => {
    const analysis = byId.get(event.id);
    return toMatchItem(
      event,
      analysis?.score ?? event.aiMatchScore,
      analysis?.note ?? event.aiNote,
      analysis?.breakdown,
    );
  });

  if (options.category) {
    items = items.filter((item) => matches(item.industry, options.category as string));
  }

  items.sort((a, b) => {
    if (options.sort === 'date') return a.eventName.localeCompare(b.eventName, 'tr');
    return b.matchScore - a.matchScore;
  });

  return {
    items,
    meta: {
      ...aiProvider(),
      source,
      warning,
      sponsorName: criteria.companyName,
      evaluated: candidates.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

export const aiController = {
  /** Hangi motorun devrede olduğunu bildirir — UI rozeti bunu okur. */
  status(_req: Request, res: Response) {
    const { provider, configured } = aiProvider();

    res.json({
      provider,
      configured,
      model: configured ? 'google/gemini-2.5-flash (n8n)' : 'yerleşik kural motoru',
      criteria: ['Sektör uyumu', 'Vizyon & ESG örtüşmesi', 'Katılımcı ölçeği', 'Bütçe uygunluğu'],
    });
  },

  /** Eşleşmeleri yeniden hesaplar ve kaynak bilgisiyle birlikte döner. */
  async matches(req: Request, res: Response) {
    const body = req.body as z.infer<typeof aiMatchSchema>;
    res.json(await buildRankedMatches(req.user, body));
  },

  /**
   * Tek bir etkinliğin yapay zeka analizini yeniler.
   *
   * İki farklı bakış açısı vardır ve karıştırılmamaları önemlidir:
   *
   * - **Sponsor** çağırırsa sonuç o markaya özeldir; etkinliğin herkese görünen
   *   `aiMatchScore` alanına *yazılmaz* (bir sponsorun skoru diğerlerini bağlamaz).
   * - **Organizatör** çağırırsa etkinliğin sponsor havuzu genelindeki
   *   çekiciliği hesaplanır (tüm sponsor profillerinin ortalaması) ve bu
   *   değer depoya yazılır — kart/detay ekranlarının gösterdiği skor budur.
   */
  async analyzeEvent(req: Request, res: Response) {
    const event = db.events.find((item) => item.id === req.params.id);
    if (!event) throw ApiError.notFound('Bu etkinlik bulunamadı.');

    const criteria = resolveCriteria(req.user);

    if (criteria.sponsorId) {
      const { analyses, source, warning } = await analyzeEvents([event], criteria);
      const analysis = analyses[0];
      if (!analysis) throw ApiError.internal('Yapay zeka değerlendirmesi üretilemedi.');

      return res.json({
        eventId: event.id,
        score: analysis.score,
        note: analysis.note,
        breakdown: analysis.breakdown,
        scope: 'sponsor' as const,
        persisted: false,
        meta: { ...aiProvider(), source, warning, generatedAt: new Date().toISOString() },
      });
    }

    // Havuz ortalaması bir toplam metriktir; her sponsor için ayrı LLM çağrısı
    // yapmak yerine deterministik yerel motor kullanılır.
    const pool = db.sponsors.map((sponsor) => scoreEvent(event, criteriaFromSponsor(sponsor)));
    if (pool.length === 0) throw ApiError.internal('Değerlendirilecek sponsor profili yok.');

    const average = Math.round(pool.reduce((total, item) => total + item.score, 0) / pool.length);
    const best = [...pool].sort((a, b) => b.score - a.score)[0];
    const bestSponsor = db.sponsors[pool.indexOf(best)];

    event.aiMatchScore = average;
    event.aiNote = `${db.sponsors.length} sponsor profili üzerinden ortalama uyum %${average}; en yüksek uyum %${best.score} ile ${bestSponsor.name}.`;

    res.json({
      eventId: event.id,
      score: average,
      note: event.aiNote,
      breakdown: best.breakdown,
      scope: 'pool' as const,
      persisted: true,
      topSponsor: { id: bestSponsor.id, name: bestSponsor.name, score: best.score },
      meta: { ...aiProvider(), source: 'local' as const, generatedAt: new Date().toISOString() },
    });
  },
};
