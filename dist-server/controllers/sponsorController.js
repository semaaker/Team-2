import { z } from 'zod';
import { db } from '../data/db.js';
import { ApiError } from '../utils/ApiError.js';
import { makeId } from '../utils/helpers.js';
import { buildRankedMatches } from './aiController.js';
export const addNoteSchema = z.object({
    body: z
        .string()
        .trim()
        .min(1, 'Not boş olamaz.')
        .max(2000, 'Not en fazla 2000 karakter olabilir.'),
});
export const sponsorController = {
    /**
     * Yapay zeka eşleşmeleri (filtre + sıralama).
     *
     * Skorlar `services/aiMatching.ts` tarafından oturumdaki sponsorun profiline
     * göre üretilir — seed'deki sabit değerler değil. Bu uç geriye dönük
     * uyumluluk için düz dizi döner; kaynak/motor bilgisi `/api/ai/matches`ta.
     */
    async matches(req, res) {
        const { items } = await buildRankedMatches(req.user, {
            category: String(req.query.category ?? '').trim() || undefined,
            sort: req.query.sort === 'date' ? 'date' : 'score',
        });
        res.json(items);
    },
    /** Sponsorun sponsorlukları. */
    sponsorships(req, res) {
        const status = String(req.query.status ?? '').trim();
        const results = status
            ? db.sponsorships.filter((item) => item.status === status)
            : db.sponsorships;
        res.json(results);
    },
    milestones(_req, res) {
        res.json(db.milestones);
    },
    /** Deal Room detayı — notlar istemcinin bakış açısına göre işaretlenir. */
    deal(req, res) {
        const deal = db.deals.find((item) => item.id === req.params.id);
        if (!deal)
            throw ApiError.notFound('Bu anlaşma bulunamadı.');
        res.json({
            ...deal,
            notes: deal.notes.map((note) => ({ ...note, isMine: note.authorId === req.user?.id })),
        });
    },
    addNote(req, res) {
        if (!req.user)
            throw ApiError.unauthorized();
        const deal = db.deals.find((item) => item.id === req.params.id);
        if (!deal)
            throw ApiError.notFound('Bu anlaşma bulunamadı.');
        const { body } = req.body;
        deal.notes.push({
            id: makeId('dnt'),
            authorId: req.user.id,
            authorName: req.user.fullName,
            authorAvatarUrl: req.user.avatarUrl,
            body,
            createdAt: new Date().toISOString(),
        });
        res.status(201).json({
            ...deal,
            notes: deal.notes.map((note) => ({ ...note, isMine: note.authorId === req.user?.id })),
        });
    },
    toggleDeliverable(req, res) {
        const deal = db.deals.find((item) => item.id === req.params.id);
        if (!deal)
            throw ApiError.notFound('Bu anlaşma bulunamadı.');
        const deliverable = deal.deliverables.find((item) => item.id === req.params.deliverableId);
        if (!deliverable)
            throw ApiError.notFound('Teslimat kalemi bulunamadı.');
        deliverable.done = !deliverable.done;
        // Sponsorluk ilerlemesini teslimat oranına göre güncel tut.
        const sponsorship = db.sponsorships.find((item) => item.id === deal.id);
        if (sponsorship) {
            const done = deal.deliverables.filter((item) => item.done).length;
            sponsorship.progress = Math.round((done / deal.deliverables.length) * 100);
        }
        res.json({
            ...deal,
            notes: deal.notes.map((note) => ({ ...note, isMine: note.authorId === req.user?.id })),
        });
    },
    /** Sponsor profil detayı. */
    profile(req, res) {
        const sponsor = db.sponsors.find((item) => item.id === req.params.id);
        if (!sponsor)
            throw ApiError.notFound('Sponsor profili bulunamadı.');
        res.json(sponsor);
    },
};
//# sourceMappingURL=sponsorController.js.map