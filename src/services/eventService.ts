import { api } from './apiClient';
import type { EventItem, EventQuery, Paginated, Proposal, ProposalStatus } from '@/types';

/** Etkinlik ve teklif uçları. */
export const eventService = {
  /** Keşfet / Etkinliklerim listeleri. */
  list(query: EventQuery = {}) {
    return api.get<Paginated<EventItem>>('/events', { query: { ...query } });
  },

  /** Oturumdaki organizatörün kendi etkinlikleri. */
  listMine(query: Omit<EventQuery, 'organizerId'> = {}) {
    return api.get<Paginated<EventItem>>('/events/mine', { query: { ...query } });
  },

  byId(id: string) {
    return api.get<EventItem>(`/events/${id}`);
  },

  /**
   * Yeni etkinlik oluşturur.
   * Tasarımdaki form dosya yüklemesi içerdiği için `multipart/form-data` kullanılır.
   */
  create(formData: FormData) {
    return api.postForm<EventItem>('/events', formData);
  },

  update(id: string, payload: Partial<EventItem>) {
    return api.patch<EventItem>(`/events/${id}`, payload);
  },

  remove(id: string) {
    return api.delete<void>(`/events/${id}`);
  },

  /** Kaydet / kaydı kaldır (bookmark ikonu). */
  toggleBookmark(id: string) {
    return api.post<EventItem>(`/events/${id}/bookmark`);
  },

  /** Bir etkinliğe gelen sponsorluk teklifleri. */
  proposals(eventId: string) {
    return api.get<Proposal[]>(`/events/${eventId}/proposals`);
  },

  /** Teklif durumunu günceller (tablodaki select). */
  updateProposalStatus(proposalId: string, status: ProposalStatus) {
    return api.patch<Proposal>(`/proposals/${proposalId}`, { status });
  },

  /** Organizatör panelindeki "Son Sponsorluk Talepleri" tablosu. */
  recentProposals(limit = 5) {
    return api.get<Proposal[]>('/proposals/recent', { query: { limit } });
  },
};
