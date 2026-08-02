/**
 * SponsorMatch AI — paylaşılan alan modeli tipleri.
 * Sunucudaki `server/src/types.ts` ile aynı sözleşmeyi tanımlar.
 */

/* -------------------------------------------------------------------------- */
/* Ortak                                                                       */
/* -------------------------------------------------------------------------- */

export type UserRole = 'organizer' | 'sponsor';

export type ProposalStatus = 'pending' | 'approved' | 'cancelled';

export type SponsorshipStatus = 'active' | 'negotiating' | 'completed' | 'cancelled';

export type EventStatus = 'draft' | 'seeking' | 'closed';

export type InvoiceStatus = 'paid' | 'pending' | 'failed';

/** Listeleme uçlarının ortak sayfalama zarfı. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Sunucudan dönen hata gövdesi. */
export interface ApiErrorBody {
  message: string;
  code?: string;
  /** Alan bazlı doğrulama hataları: { email: "Geçerli bir e-posta girin" } */
  fields?: Record<string, string>;
}

/* -------------------------------------------------------------------------- */
/* Kullanıcı & Kimlik                                                          */
/* -------------------------------------------------------------------------- */

export interface User {
  id: string;
  fullName: string;
  email: string;
  companyName: string;
  role: UserRole;
  title: string;
  avatarUrl: string;
  phone?: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: User;
}

/** Doğrulama kodu isteğinin yanıtı. */
export interface RequestCodeResponse {
  email: string;
  /** Yalnızca demo modunda döner; gerçek dağıtımda e-posta ile gönderilir. */
  devCode?: string;
  expiresInSeconds: number;
}

/* -------------------------------------------------------------------------- */
/* Etkinlik                                                                    */
/* -------------------------------------------------------------------------- */

export interface SponsorshipPackage {
  id: string;
  name: string;
  priceLabel: string;
  tier: 'Elmas' | 'Platin' | 'Altın' | 'Gümüş' | 'Bronz' | string;
}

export interface EventItem {
  id: string;
  name: string;
  category: string;
  dateLabel: string;
  startDate: string;
  location: string;
  description: string;
  attendeesLabel: string;
  attendees: number;
  coverImageUrl: string;
  status: EventStatus;
  organizerId: string;
  organizerName: string;
  aiMatchScore: number;
  aiNote: string;
  packages: SponsorshipPackage[];
  proposalCount: number;
  bookmarked: boolean;
  createdAt: string;
}

export interface CreateEventPayload {
  eventName: string;
  eventDate: string;
  eventCategory: string;
  participantCount: string;
  eventDescription: string;
  sponsorPackages: string[];
  location?: string;
}

export interface EventQuery {
  search?: string;
  category?: string;
  page?: number;
  pageSize?: number;
  organizerId?: string;
}

/* -------------------------------------------------------------------------- */
/* Sponsor & Teklif                                                            */
/* -------------------------------------------------------------------------- */

export interface Sponsor {
  id: string;
  name: string;
  industry: string;
  logoIcon: string;
  logoUrl?: string;
  about: string;
  website: string;
  location: string;
  employeeRange: string;
  annualBudgetLabel: string;
  focusAreas: string[];
  esgGoals: string[];
  aiAnalysis: {
    score: number;
    summary: string;
    strengths: string[];
    risks: string[];
  };
}

export interface Proposal {
  id: string;
  eventId: string;
  eventName: string;
  sponsorId: string;
  sponsorName: string;
  sponsorIndustry: string;
  sponsorIcon: string;
  budget: number;
  budgetLabel: string;
  aiScore: number;
  status: ProposalStatus;
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Eşleşme & Sponsorluk                                                        */
/* -------------------------------------------------------------------------- */

export interface MatchItem {
  id: string;
  eventId: string;
  eventName: string;
  dateLabel: string;
  location: string;
  attendeesLabel: string;
  industry: string;
  categories: string[];
  matchScore: number;
  coverImageUrl: string;
  /** Skoru gerekçelendiren, yapay zeka tarafından üretilen tek cümlelik not. */
  aiNote?: string;
  /** Skorun kriter bazlı kırılımı. n8n kipinde boş gelebilir. */
  breakdown?: AiScoreBreakdown[];
}

/* -------------------------------- Yapay zeka ------------------------------- */

export interface AiScoreBreakdown {
  label: string;
  earned: number;
  max: number;
}

/** Skorlamanın hangi motordan geldiği. */
export type AiSource = 'n8n' | 'local' | 'local-fallback';

export interface AiMeta {
  provider: 'n8n' | 'local';
  configured: boolean;
  source: AiSource;
  /** n8n denendi ve başarısız olduysa kullanıcıya gösterilecek uyarı. */
  warning?: string;
  generatedAt: string;
}

export interface AiStatus {
  provider: 'n8n' | 'local';
  configured: boolean;
  model: string;
  criteria: string[];
}

export interface AiMatchResponse {
  items: MatchItem[];
  meta: AiMeta & { sponsorName: string; evaluated: number };
}

export interface AiEventAnalysis {
  eventId: string;
  score: number;
  note: string;
  breakdown: AiScoreBreakdown[];
  /**
   * `sponsor`: oturumdaki markaya özel skor (etkinliğe kaydedilmez).
   * `pool`: tüm sponsor profillerinin ortalaması (etkinliğe kaydedilir).
   */
  scope: 'sponsor' | 'pool';
  persisted: boolean;
  /** Yalnızca `pool` kapsamında — en yüksek uyumu veren sponsor. */
  topSponsor?: { id: string; name: string; score: number };
  meta: AiMeta;
}

export interface Sponsorship {
  id: string;
  eventId: string;
  eventName: string;
  packageName: string;
  amount: number;
  amountLabel: string;
  status: SponsorshipStatus;
  dateLabel: string;
  progress: number;
  contactName: string;
}

export interface Milestone {
  id: string;
  dateLabel: string;
  title: string;
  eventName: string;
  isCurrent: boolean;
}

/* -------------------------------------------------------------------------- */
/* Deal Room                                                                   */
/* -------------------------------------------------------------------------- */

export interface DealDeliverable {
  id: string;
  label: string;
  done: boolean;
}

export interface DealNote {
  id: string;
  authorName: string;
  authorAvatarUrl: string;
  body: string;
  createdAt: string;
  isMine: boolean;
}

export interface Deal {
  id: string;
  eventName: string;
  sponsorName: string;
  packageName: string;
  amountLabel: string;
  paymentTerms: string;
  contractStatus: string;
  deliverables: DealDeliverable[];
  notes: DealNote[];
}

/* -------------------------------------------------------------------------- */
/* Mesajlaşma                                                                  */
/* -------------------------------------------------------------------------- */

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatarUrl: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  online: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  body: string;
  createdAt: string;
  isMine: boolean;
  senderName: string;
}

/* -------------------------------------------------------------------------- */
/* Faturalandırma                                                              */
/* -------------------------------------------------------------------------- */

export interface Subscription {
  planName: string;
  priceLabel: string;
  billingCycle: string;
  renewsAt: string;
  features: string[];
  limits: { label: string; used: number; total: number }[];
}

export interface PaymentMethod {
  brand: string;
  last4: string;
  expiry: string;
  holderName: string;
}

export interface Invoice {
  id: string;
  number: string;
  dateLabel: string;
  description: string;
  amountLabel: string;
  status: InvoiceStatus;
  downloadUrl: string;
}

/* -------------------------------------------------------------------------- */
/* Ayarlar                                                                     */
/* -------------------------------------------------------------------------- */

export interface ProfileSettings {
  fullName: string;
  email: string;
  companyName: string;
  title: string;
  phone: string;
  avatarUrl: string;
}

export interface NotificationSettings {
  newProposal: boolean;
  aiScoreUpdate: boolean;
  newMessage: boolean;
  weeklyDigest: boolean;
  productUpdates: boolean;
  digestFrequency: 'daily' | 'weekly' | 'monthly';
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  lastActiveLabel: string;
  isCurrent: boolean;
}

export interface SecurityLogEntry {
  id: string;
  action: string;
  detail: string;
  dateLabel: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessions: ActiveSession[];
  log: SecurityLogEntry[];
}

/* -------------------------------------------------------------------------- */
/* Destek & Hukuki                                                             */
/* -------------------------------------------------------------------------- */

export interface SupportTicketPayload {
  fullName: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

export interface SupportTicket extends SupportTicketPayload {
  id: string;
  reference: string;
  createdAt: string;
}

export interface LegalSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
  callout?: { title: string; body: string };
}

export interface LegalDocument {
  slug: string;
  title: string;
  updatedAt: string;
  sections: LegalSection[];
}

/* -------------------------------------------------------------------------- */
/* İstatistikler                                                               */
/* -------------------------------------------------------------------------- */

export interface StatMetric {
  key: string;
  label: string;
  value: string;
  icon: string;
  trend?: { label: string; direction: 'up' | 'down' };
  hint?: string;
}
