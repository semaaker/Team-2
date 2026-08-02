import { seedConversations, seedDeals, seedEvents, seedInvoices, seedLegalDocs, seedMessages, seedMilestones, seedNotificationSettings, seedPaymentMethod, seedProposals, seedSecuritySettings, seedSponsors, seedSponsorships, seedSubscription, seedUsers, } from './seed.js';
/** Referans paylaşımını önlemek için derin kopya. */
function clone(value) {
    return structuredClone(value);
}
function createDatabase() {
    const notificationSettings = new Map();
    const securitySettings = new Map();
    const bookmarks = new Map();
    for (const user of seedUsers) {
        notificationSettings.set(user.id, clone(seedNotificationSettings));
        securitySettings.set(user.id, clone(seedSecuritySettings));
        bookmarks.set(user.id, new Set(seedEvents.filter((e) => e.bookmarked).map((e) => e.id)));
    }
    return {
        users: clone(seedUsers),
        events: clone(seedEvents),
        sponsors: clone(seedSponsors),
        proposals: clone(seedProposals),
        sponsorships: clone(seedSponsorships),
        milestones: clone(seedMilestones),
        deals: clone(seedDeals),
        conversations: clone(seedConversations),
        messages: clone(seedMessages),
        subscription: clone(seedSubscription),
        paymentMethod: clone(seedPaymentMethod),
        invoices: clone(seedInvoices),
        legalDocs: clone(seedLegalDocs),
        supportTickets: [],
        notificationSettings,
        securitySettings,
        pendingCodes: new Map(),
        bookmarks,
    };
}
export const db = createDatabase();
/** Testlerde depoyu başlangıç durumuna döndürmek için. */
export function resetDatabase() {
    Object.assign(db, createDatabase());
}
/* -------------------------------------------------------------------------- */
/* Yardımcı erişimciler                                                        */
/* -------------------------------------------------------------------------- */
/** Parola alanını temizleyerek istemciye güvenli kullanıcı nesnesi döner. */
export function publicUser(user) {
    const { passwordHash: _passwordHash, ...safe } = user;
    return safe;
}
/** Yeni kullanıcı için varsayılan ayarları oluşturur. */
export function initUserSettings(userId) {
    if (!db.notificationSettings.has(userId)) {
        db.notificationSettings.set(userId, clone(seedNotificationSettings));
    }
    if (!db.securitySettings.has(userId)) {
        db.securitySettings.set(userId, {
            twoFactorEnabled: false,
            sessions: [
                {
                    id: 'ses_current',
                    device: 'Bu tarayıcı',
                    location: 'Bilinmiyor',
                    lastActiveLabel: 'Şu anda aktif',
                    isCurrent: true,
                },
            ],
            log: [
                {
                    id: 'log_signup',
                    action: 'Hesap oluşturuldu',
                    detail: 'SponsorMatch AI kaydı tamamlandı',
                    dateLabel: new Date().toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                    }),
                },
            ],
        });
    }
    if (!db.bookmarks.has(userId))
        db.bookmarks.set(userId, new Set());
}
/** Bir etkinliğin belirli kullanıcı için kaydedilmiş olup olmadığını işaretler. */
export function withBookmark(event, userId) {
    if (!userId)
        return { ...event, bookmarked: false };
    return { ...event, bookmarked: db.bookmarks.get(userId)?.has(event.id) ?? false };
}
//# sourceMappingURL=db.js.map