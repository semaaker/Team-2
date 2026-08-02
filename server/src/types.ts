/**
 * Sunucu tarafı alan modeli.
 * `src/types/index.ts` ile aynı sözleşmeyi tanımlar (paylaşılan API kontratı).
 */

export type UserRole = 'organizer' | 'sponsor';
export type ProposalStatus = 'pending' | 'approved' | 'cancelled';
export type SponsorshipStatus = 'active' | 'negotiating' | 'completed' | 'cancelled';
export type EventStatus = 'draft' | 'seeking' | 'closed';
export type InvoiceStatus = 'paid' | 'pending' | 'failed';

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
  /** Yalnızca sunucuda tutulur; istemciye asla gönderilmez. */
  passwordHash?: string;
}

export interface SponsorshipPackage {
  id: string;
  name: string;
  priceLabel: string;
  tier: string;
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
  /** Yüklenen sponsorluk dosyasının adı (varsa). */
  attachmentName?: string;
}

export interface Sponsor {
  id: string;
  name: string;
  industry: string;
  logoIcon: string;
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
  breakdown?: { label: string; earned: number; max: number }[];
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

export interface DealDeliverable {
  id: string;
  label: string;
  done: boolean;
}

export interface DealNote {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string;
  body: string;
  createdAt: string;
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
  senderId: string;
  senderName: string;
}

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

export interface SupportTicket {
  id: string;
  reference: string;
  fullName: string;
  email: string;
  subject: string;
  category: string;
  message: string;
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

export interface StatMetric {
  key: string;
  label: string;
  value: string;
  icon: string;
  trend?: { label: string; direction: 'up' | 'down' };
  hint?: string;
}

/** Bekleyen doğrulama kodu kaydı. */
export interface PendingCode {
  email: string;
  code: string;
  expiresAt: number;
  attempts: number;
}
