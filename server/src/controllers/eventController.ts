import { z } from 'zod';
import type { Request, Response } from 'express';
import { db, withBookmark } from '../data/db.js';
import { ApiError } from '../utils/ApiError.js';
import { makeId, matches, paginate } from '../utils/helpers.js';
import type { EventItem, SponsorshipPackage } from '../types.js';

/* ------------------------------- Şemalar ------------------------------- */

export const createEventSchema = z.object({
  eventName: z.string().trim().min(3, 'Etkinlik adı en az 3 karakter olmalıdır.'),
  eventDate: z.string().trim().min(1, 'Etkinlik tarihi zorunludur.'),
  eventCategory: z.string().trim().min(1, 'Kategori seçilmelidir.'),
  participantCount: z.string().trim().min(1, 'Katılımcı aralığı seçilmelidir.'),
  eventDescription: z.string().trim().min(20, 'Etkinlik detayı en az 20 karakter olmalıdır.'),
  /**
   * `multipart/form-data` tek değer gönderildiğinde string, birden fazla
   * gönderildiğinde dizi üretir; alan hiç işaretlenmediğinde ise gelmez.
   * Üç durumu da normalize edip tek bir Türkçe mesajla doğruluyoruz.
   */
  sponsorPackages: z
    .union([z.string(), z.array(z.string()), z.undefined()])
    .transform((value) => {
      if (value === undefined) return [];
      return (Array.isArray(value) ? value : [value]).map((item) => item.trim()).filter(Boolean);
    })
    .refine((value) => value.length > 0, {
      message: 'En az bir sponsorluk paketi seçin.',
    }),
  location: z.string().trim().optional(),
});

export const updateProposalSchema = z.object({
  status: z.enum(['pending', 'approved', 'cancelled']),
});

/* ------------------------------ Yardımcılar ------------------------------ */

/** Paket seviyesine göre varsayılan fiyat etiketi. */
const PACKAGE_PRICES: Record<string, string> = {
  Elmas: '$75k',
  Platin: '$50k',
  Altın: '$25k',
  Gümüş: '$10k',
  Bronz: '$5k',
};

function buildPackages(names: string[]): SponsorshipPackage[] {
  return names.filter(Boolean).map((name) => ({
    id: makeId('pkg'),
    name,
    tier: name,
    priceLabel: PACKAGE_PRICES[name] ?? '$10k',
  }));
}

/** "5000+" -> 5000 */
function parseAttendees(value: string): number {
  const parsed = Number.parseInt(value.replace(/\D/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Yeni etkinlik için AI uyum skoru üretir.
 *
 * Gerçek bir modelin yerini tutan deterministik bir yaklaşım: katılımcı
 * ölçeği, paket çeşitliliği ve açıklama zenginliği sinyallerinden hesaplanır.
 * Böylece aynı girdi her zaman aynı skoru verir ve arayüz tutarlı davranır.
 */
function computeMatchScore(event: {
  attendees: number;
  packages: SponsorshipPackage[];
  description: string;
}): number {
  // Ölçek: 10.000+ katılımcıda doyuma ulaşır (logaritmik, böylece küçük
  // etkinlikler de anlamlı puan alır).
  const scaleSignal = Math.min(28, Math.round(Math.log10(Math.max(10, event.attendees)) * 7));
  // Paket çeşitliliği: sponsorlara sunulan seçenek sayısı.
  const packageSignal = Math.min(16, event.packages.length * 4);
  // İçerik zenginliği: iyi yazılmış açıklama eşleşme kalitesini artırır.
  const contentSignal = Math.min(16, Math.round(event.description.length / 20));

  return Math.max(62, Math.min(98, 40 + scaleSignal + packageSignal + contentSignal));
}

/* ------------------------------ Controller ------------------------------ */

export const eventController = {
  /** Herkese açık etkinlik listesi (arama + kategori + sayfalama). */
  list(req: Request, res: Response) {
    const search = String(req.query.search ?? '').trim();
    const category = String(req.query.category ?? '').trim();
    const page = Number.parseInt(String(req.query.page ?? '1'), 10) || 1;
    const pageSize = Number.parseInt(String(req.query.pageSize ?? '9'), 10) || 9;
    const organizerId = String(req.query.organizerId ?? '').trim();

    let results = [...db.events];

    if (organizerId) {
      results = results.filter((event) => event.organizerId === organizerId);
    }

    if (category) {
      results = results.filter((event) => matches(event.category, category));
    }

    if (search) {
      results = results.filter(
        (event) =>
          matches(event.name, search) ||
          matches(event.description, search) ||
          matches(event.category, search) ||
          matches(event.location, search),
      );
    }

    // En yeni etkinlik önce
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const paged = paginate(results, page, pageSize);
    res.json({
      ...paged,
      items: paged.items.map((event) => withBookmark(event, req.user?.id)),
    });
  },

  /** Oturumdaki organizatörün etkinlikleri. */
  listMine(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized();

    req.query.organizerId = req.user.id;
    eventController.list(req, res);
  },

  byId(req: Request, res: Response) {
    const event = db.events.find((item) => item.id === req.params.id);
    if (!event) throw ApiError.notFound('Etkinlik bulunamadı.');

    res.json(withBookmark(event, req.user?.id));
  },

  /** Yeni etkinlik oluşturur (multipart/form-data). */
  create(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized();

    const payload = req.body as z.infer<typeof createEventSchema>;
    const packages = buildPackages(payload.sponsorPackages);
    const attendees = parseAttendees(payload.participantCount);

    const event: EventItem = {
      id: makeId('evt'),
      name: payload.eventName,
      category: payload.eventCategory,
      dateLabel: payload.eventDate,
      startDate: new Date().toISOString(),
      location: payload.location?.trim() || 'Belirtilmedi',
      description: payload.eventDescription,
      attendeesLabel: payload.participantCount.replace(
        /(\d+)\+?/,
        (_m, n: string) => `${Number(n).toLocaleString('tr-TR')}+`,
      ),
      attendees,
      coverImageUrl: '',
      status: 'seeking',
      organizerId: req.user.id,
      organizerName: req.user.companyName,
      aiMatchScore: 0,
      aiNote: '',
      packages,
      proposalCount: 0,
      bookmarked: false,
      createdAt: new Date().toISOString(),
      attachmentName: req.file?.originalname,
    };

    event.aiMatchScore = computeMatchScore(event);
    event.aiNote = `Bu etkinlik, platformdaki sponsor profilleriyle %${event.aiMatchScore} oranında örtüşmektedir.`;

    db.events.unshift(event);
    res.status(201).json(event);
  },

  update(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized();

    const event = db.events.find((item) => item.id === req.params.id);
    if (!event) throw ApiError.notFound('Etkinlik bulunamadı.');
    if (event.organizerId !== req.user.id) {
      throw ApiError.forbidden('Yalnızca kendi etkinliklerinizi düzenleyebilirsiniz.');
    }

    // Kimlik ve sahiplik alanları istemciden güncellenemez.
    const { id: _id, organizerId: _organizerId, createdAt: _createdAt, ...patch } = req.body ?? {};
    Object.assign(event, patch);

    res.json(withBookmark(event, req.user.id));
  },

  remove(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized();

    const index = db.events.findIndex((item) => item.id === req.params.id);
    if (index === -1) throw ApiError.notFound('Etkinlik bulunamadı.');
    if (db.events[index].organizerId !== req.user.id) {
      throw ApiError.forbidden('Yalnızca kendi etkinliklerinizi silebilirsiniz.');
    }

    db.events.splice(index, 1);
    res.status(204).end();
  },

  /** Kaydet / kaydı kaldır. */
  toggleBookmark(req: Request, res: Response) {
    if (!req.user) throw ApiError.unauthorized();

    const event = db.events.find((item) => item.id === req.params.id);
    if (!event) throw ApiError.notFound('Etkinlik bulunamadı.');

    const set = db.bookmarks.get(req.user.id) ?? new Set<string>();
    if (set.has(event.id)) set.delete(event.id);
    else set.add(event.id);
    db.bookmarks.set(req.user.id, set);

    res.json(withBookmark(event, req.user.id));
  },

  /** Bir etkinliğe gelen teklifler. */
  proposalsByEvent(req: Request, res: Response) {
    const event = db.events.find((item) => item.id === req.params.id);
    if (!event) throw ApiError.notFound('Etkinlik bulunamadı.');

    const proposals = db.proposals
      .filter((proposal) => proposal.eventId === event.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json(proposals);
  },

  /** Panelde gösterilen son teklifler. */
  recentProposals(req: Request, res: Response) {
    const limit = Number.parseInt(String(req.query.limit ?? '5'), 10) || 5;

    const proposals = [...db.proposals]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, Math.min(50, limit));

    res.json(proposals);
  },

  /** Teklif durumunu günceller. */
  updateProposal(req: Request, res: Response) {
    const proposal = db.proposals.find((item) => item.id === req.params.id);
    if (!proposal) throw ApiError.notFound('Teklif bulunamadı.');

    const { status } = req.body as z.infer<typeof updateProposalSchema>;
    proposal.status = status;

    res.json(proposal);
  },
};
