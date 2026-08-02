import { api } from './apiClient';
import type { Deal, MatchItem, Milestone, Sponsor, Sponsorship } from '@/types';

/** Sponsor tarafının uçları: eşleşmeler, sponsorluklar, deal room, profil. */
export const sponsorService = {
  /** Yapay zeka eşleşmeleri. Boş dizi dönerse UI "Henüz eşleşme yok" gösterir. */
  matches(params: { sort?: 'score' | 'date'; category?: string } = {}) {
    return api.get<MatchItem[]>('/matches', { query: { ...params } });
  },

  /** Sponsorun aktif ve geçmiş sponsorlukları. */
  sponsorships(status?: string) {
    return api.get<Sponsorship[]>('/sponsorships', { query: { status } });
  },

  /** Sponsor panelindeki "Upcoming Milestones" zaman çizelgesi. */
  milestones() {
    return api.get<Milestone[]>('/milestones');
  },

  /** Deal Room detayı. */
  deal(id: string) {
    return api.get<Deal>(`/deals/${id}`);
  },

  /** Deal Room tartışma başlığına not ekler. */
  addDealNote(dealId: string, body: string) {
    return api.post<Deal>(`/deals/${dealId}/notes`, { body });
  },

  /** Teslimat kalemini tamamlandı olarak işaretler. */
  toggleDeliverable(dealId: string, deliverableId: string) {
    return api.patch<Deal>(`/deals/${dealId}/deliverables/${deliverableId}`);
  },

  /** Sponsor profil detayı + AI analizi. */
  profile(id: string) {
    return api.get<Sponsor>(`/sponsors/${id}`);
  },
};
