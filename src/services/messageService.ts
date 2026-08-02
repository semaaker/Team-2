import { api } from './apiClient';
import type { Conversation, Message } from '@/types';

/** Mesajlar ekranının uçları. */
export const messageService = {
  conversations(search?: string) {
    return api.get<Conversation[]>('/conversations', { query: { search } });
  },

  messages(conversationId: string) {
    return api.get<Message[]>(`/conversations/${conversationId}/messages`);
  },

  send(conversationId: string, body: string) {
    return api.post<Message>(`/conversations/${conversationId}/messages`, { body });
  },

  markRead(conversationId: string) {
    return api.patch<Conversation>(`/conversations/${conversationId}/read`);
  },
};
