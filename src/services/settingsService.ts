import { api } from './apiClient';
import type { NotificationSettings, ProfileSettings, SecuritySettings } from '@/types';

/** Ayarlar bölümünün (profil / bildirim / güvenlik) uçları. */
export const settingsService = {
  profile() {
    return api.get<ProfileSettings>('/settings/profile');
  },

  updateProfile(payload: Partial<ProfileSettings>) {
    return api.patch<ProfileSettings>('/settings/profile', payload);
  },

  notifications() {
    return api.get<NotificationSettings>('/settings/notifications');
  },

  updateNotifications(payload: Partial<NotificationSettings>) {
    return api.patch<NotificationSettings>('/settings/notifications', payload);
  },

  security() {
    return api.get<SecuritySettings>('/settings/security');
  },

  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return api.post<{ message: string }>('/settings/security/password', payload);
  },

  setTwoFactor(enabled: boolean) {
    return api.patch<SecuritySettings>('/settings/security/two-factor', { enabled });
  },

  revokeSession(sessionId: string) {
    return api.delete<SecuritySettings>(`/settings/security/sessions/${sessionId}`);
  },
};
