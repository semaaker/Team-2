import { api, setToken } from './apiClient';
import type { AuthSession, RequestCodeResponse, User, UserRole } from '@/types';

/** Kimlik doğrulama akışının tüm uçları. */
export const authService = {
  /** Adım 1 — e-posta adresine 6 haneli doğrulama kodu gönderir. */
  requestCode(email: string) {
    return api.post<RequestCodeResponse>('/auth/request-code', { email });
  },

  /** Adım 2 — kodu doğrular ve oturumu başlatır. */
  async verifyCode(email: string, code: string) {
    const session = await api.post<AuthSession>('/auth/verify-code', { email, code });
    setToken(session.token);
    return session;
  },

  /** Yeni kurumsal hesap oluşturur ve oturumu açar. */
  async register(payload: {
    fullName: string;
    companyName: string;
    email: string;
    password: string;
    role: UserRole;
  }) {
    const session = await api.post<AuthSession>('/auth/register', payload);
    setToken(session.token);
    return session;
  },

  /** Şifre sıfırlama bağlantısı gönderir. */
  forgotPassword(email: string) {
    return api.post<{ message: string }>('/auth/forgot-password', { email });
  },

  /** Aktif oturumun kullanıcısını döner. */
  me() {
    return api.get<User>('/auth/me');
  },

  /** Oturumu kapatır. */
  async logout() {
    try {
      await api.post<void>('/auth/logout');
    } finally {
      setToken(null);
    }
  },
};
