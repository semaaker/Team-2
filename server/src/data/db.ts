import {
  seedConversations,
  seedDeals,
  seedEvents,
  seedInvoices,
  seedLegalDocs,
  seedMessages,
  seedMilestones,
  seedNotificationSettings,
  seedPaymentMethod,
  seedProposals,
  seedSecuritySettings,
  seedSponsors,
  seedSponsorships,
  seedSubscription,
  seedUsers,
} from './seed.js';
import type {
  Conversation,
  Deal,
  EventItem,
  Invoice,
  LegalDocument,
  Message,
  Milestone,
  NotificationSettings,
  PaymentMethod,
  PendingCode,
  Proposal,
  SecuritySettings,
  Sponsor,
  Sponsorship,
  Subscription,
  SupportTicket,
  User,
} from '../types.js';

/**
 * Bellek içi veri deposu.
 *
 * Bu proje bir vitrin/prototip olduğu için kalıcı bir veritabanı yerine
 * süreç belleğinde tutulan bir depo kullanılır. Controller'lar yalnızca bu
 * modülle konuşur; gerçek bir veritabanına (PostgreSQL, Mongo vb.) geçerken
 * değiştirilecek tek katman burasıdır.
 *
 * NOT: Sunucu yeniden başladığında veriler tohum (seed) hâline döner.
 */

interface Database {
  users: User[];
  events: EventItem[];
  sponsors: Sponsor[];
  proposals: Proposal[];
  sponsorships: Sponsorship[];
  milestones: Milestone[];
  deals: Deal[];
  conversations: Conversation[];
  messages: Message[];
  subscription: Subscription;
  paymentMethod: PaymentMethod;
  invoices: Invoice[];
  legalDocs: LegalDocument[];
  supportTickets: SupportTicket[];
  /** Kullanıcı kimliğine göre bildirim tercihleri. */
  notificationSettings: Map<string, NotificationSettings>;
  /** Kullanıcı kimliğine göre güvenlik ayarları. */
  securitySettings: Map<string, SecuritySettings>;
  /** E-posta -> bekleyen doğrulama kodu. */
  pendingCodes: Map<string, PendingCode>;
  /** Kullanıcı kimliğine göre kaydedilen etkinlik kimlikleri. */
  bookmarks: Map<string, Set<string>>;
}

/** Referans paylaşımını önlemek için derin kopya. */
function clone<T>(value: T): T {
  return structuredClone(value);
}

function createDatabase(): Database {
  const notificationSettings = new Map<string, NotificationSettings>();
  const securitySettings = new Map<string, SecuritySettings>();
  const bookmarks = new Map<string, Set<string>>();

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

export const db: Database = createDatabase();

/** Testlerde depoyu başlangıç durumuna döndürmek için. */
export function resetDatabase(): void {
  Object.assign(db, createDatabase());
}

/* -------------------------------------------------------------------------- */
/* Yardımcı erişimciler                                                        */
/* -------------------------------------------------------------------------- */

/** Parola alanını temizleyerek istemciye güvenli kullanıcı nesnesi döner. */
export function publicUser(user: User): Omit<User, 'passwordHash'> {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

/** Yeni kullanıcı için varsayılan ayarları oluşturur. */
export function initUserSettings(userId: string): void {
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
  if (!db.bookmarks.has(userId)) db.bookmarks.set(userId, new Set());
}

/** Bir etkinliğin belirli kullanıcı için kaydedilmiş olup olmadığını işaretler. */
export function withBookmark(event: EventItem, userId?: string): EventItem {
  if (!userId) return { ...event, bookmarked: false };
  return { ...event, bookmarked: db.bookmarks.get(userId)?.has(event.id) ?? false };
}
