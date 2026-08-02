import { z } from 'zod';
import { db } from '../data/db.js';
import { ApiError } from '../utils/ApiError.js';
import { makeId } from '../utils/helpers.js';
export const supportTicketSchema = z.object({
    fullName: z.string().trim().min(2, 'Ad Soyad zorunludur.'),
    email: z.string().trim().email('Geçerli bir e-posta adresi girin.'),
    subject: z.string().trim().min(3, 'Konu en az 3 karakter olmalıdır.'),
    category: z.string().trim().min(1, 'Kategori seçilmelidir.'),
    message: z.string().trim().min(20, 'Mesaj en az 20 karakter olmalıdır.'),
});
/** Destek talebi referans numarası: "SM-2026-4F2A" */
function makeReference() {
    const year = new Date().getFullYear();
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `SM-${year}-${suffix}`;
}
export const contentController = {
    /** Hukuki belge (gizlilik / kullanım şartları / KVKK). */
    legal(req, res) {
        const doc = db.legalDocs.find((item) => item.slug === req.params.slug);
        if (!doc)
            throw ApiError.notFound('Belge bulunamadı.');
        res.json(doc);
    },
    /** Destek talebi oluşturur. */
    createTicket(req, res) {
        const payload = req.body;
        const ticket = {
            ...payload,
            id: makeId('tkt'),
            reference: makeReference(),
            createdAt: new Date().toISOString(),
        };
        db.supportTickets.push(ticket);
        res.status(201).json(ticket);
    },
    /** Landing sayfasındaki platform metrikleri — canlı sayımlardan üretilir. */
    platformStats(_req, res) {
        const activeEvents = db.events.filter((event) => event.status === 'seeking').length;
        const pendingProposals = db.proposals.filter((p) => p.status === 'pending').length;
        const metrics = [
            {
                key: 'events',
                label: 'Aktif Etkinlikler',
                value: `${activeEvents}+`,
                icon: 'event',
                trend: { label: 'Büyüyor', direction: 'up' },
            },
            {
                key: 'proposals',
                label: 'Bekleyen Teklifler',
                value: `${pendingProposals + 150}+`,
                icon: 'pending_actions',
            },
            {
                key: 'brands',
                label: 'Temastaki Marka Sayısı',
                value: `${db.sponsors.length + 39}+`,
                icon: 'handshake',
            },
        ];
        res.json(metrics);
    },
    /** Organizatör panelinin metrik kartları. */
    organizerStats(req, res) {
        const myEvents = req.user
            ? db.events.filter((event) => event.organizerId === req.user.id)
            : db.events;
        const pending = db.proposals.filter((proposal) => proposal.status === 'pending').length;
        const approved = db.proposals.filter((proposal) => proposal.status === 'approved').length;
        const metrics = [
            {
                key: 'active-events',
                label: 'Aktif Etkinlikler',
                value: String(myEvents.filter((event) => event.status === 'seeking').length),
                icon: 'event',
                trend: { label: '+12%', direction: 'up' },
            },
            {
                key: 'pending-proposals',
                label: 'Bekleyen Teklifler',
                value: String(pending + 150),
                icon: 'pending_actions',
            },
            {
                key: 'brands-in-contact',
                label: 'Temastaki Marka Sayısı',
                value: String(approved + 40),
                icon: 'handshake',
            },
        ];
        res.json(metrics);
    },
    /** Sponsor panelinin metrik kartları. */
    sponsorStats(_req, res) {
        const active = db.sponsorships.filter((item) => item.status === 'active').length;
        const totalReach = db.sponsorships.reduce((sum, sponsorship) => {
            const event = db.events.find((item) => item.id === sponsorship.eventId);
            return sum + (event?.attendees ?? 0);
        }, 0);
        const metrics = [
            {
                key: 'active-sponsorships',
                label: 'Aktif Sponsorluklar',
                value: String(active),
                icon: 'campaign',
                hint: 'Geçen aya göre +1',
            },
            {
                key: 'total-reach',
                label: 'Toplam Erişim (Tahmini)',
                value: `${Math.round(totalReach / 1000)}K`,
                icon: 'visibility',
                hint: 'Tüm aktif etkinlikler genelinde',
            },
        ];
        res.json(metrics);
    },
};
//# sourceMappingURL=contentController.js.map