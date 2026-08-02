import { api } from './apiClient';
import type { LegalDocument, StatMetric, SupportTicket, SupportTicketPayload } from '@/types';

/** Destek, hukuki metinler ve istatistik uçları. */
export const contentService = {
  /** Gizlilik politikası, kullanım şartları, KVKK vb. */
  legal(slug: 'gizlilik' | 'kosullar' | 'destek' | string) {
    return api.get<LegalDocument>(`/legal/${slug}`);
  },

  /** Destek talep formu gönderimi. */
  createTicket(payload: SupportTicketPayload) {
    return api.post<SupportTicket>('/support/tickets', payload);
  },

  /** Landing sayfasındaki platform istatistikleri. */
  platformStats() {
    return api.get<StatMetric[]>('/stats/platform');
  },

  /** Organizatör panelinin metrik kartları. */
  organizerStats() {
    return api.get<StatMetric[]>('/stats/organizer');
  },

  /** Sponsor panelinin metrik kartları. */
  sponsorStats() {
    return api.get<StatMetric[]>('/stats/sponsor');
  },
};
