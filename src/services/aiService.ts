import { api } from './apiClient';
import type { AiEventAnalysis, AiMatchResponse, AiStatus } from '@/types';

/**
 * Yapay zeka eşleştirme uçları.
 *
 * Sunucu tarafında skorlama ya n8n + Gemini akışıyla ya da yerleşik kural
 * motoruyla yapılır; hangisinin devrede olduğu `meta.source` ile döner ve
 * arayüzde rozet olarak gösterilir.
 */
export const aiService = {
  /** Devredeki motor ve değerlendirme kriterleri. */
  status() {
    return api.get<AiStatus>('/ai/status');
  },

  /** Eşleşmeleri yeniden hesaplatır. */
  matches(
    params: {
      sort?: 'score' | 'date';
      category?: string;
      brandVision?: string;
      focusAreas?: string[];
    } = {},
  ) {
    return api.post<AiMatchResponse>('/ai/matches', params);
  },

  /** Tek bir etkinliğin analizini yeniler. */
  analyzeEvent(eventId: string) {
    return api.post<AiEventAnalysis>(`/ai/events/${eventId}/analyze`);
  },
};
