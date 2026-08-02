import { z } from 'zod';
import { db, initUserSettings } from '../data/db.js';
import { ApiError } from '../utils/ApiError.js';
import { authController } from './authController.js';
import { makeId } from '../utils/helpers.js';
/* ------------------------------- Şemalar ------------------------------- */
export const profileSchema = z.object({
    fullName: z.string().trim().min(3, 'Ad Soyad en az 3 karakter olmalıdır.').optional(),
    companyName: z.string().trim().min(2, 'Şirket adı zorunludur.').optional(),
    title: z.string().trim().max(80, 'Unvan en fazla 80 karakter olabilir.').optional(),
    phone: z.string().trim().max(30).optional(),
    avatarUrl: z.string().trim().max(500).optional(),
    // E-posta değişimi ayrı bir doğrulama akışı gerektirdiği için burada yok sayılır.
    email: z.string().optional(),
});
export const notificationSchema = z.object({
    newProposal: z.boolean().optional(),
    aiScoreUpdate: z.boolean().optional(),
    newMessage: z.boolean().optional(),
    weeklyDigest: z.boolean().optional(),
    productUpdates: z.boolean().optional(),
    digestFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
});
export const passwordSchema = z.object({
    currentPassword: z.string().min(1, 'Mevcut şifre zorunludur.'),
    newPassword: z.string().min(8, 'Yeni şifre en az 8 karakter olmalıdır.'),
});
export const twoFactorSchema = z.object({
    enabled: z.boolean(),
});
/* ------------------------------ Yardımcılar ------------------------------ */
function nowLabel() {
    return new Date().toLocaleString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
/* ------------------------------ Controller ------------------------------ */
export const settingsController = {
    profile(req, res) {
        if (!req.user)
            throw ApiError.unauthorized();
        const { fullName, email, companyName, title, phone, avatarUrl } = req.user;
        res.json({ fullName, email, companyName, title, phone: phone ?? '', avatarUrl });
    },
    updateProfile(req, res) {
        if (!req.user)
            throw ApiError.unauthorized();
        const payload = req.body;
        // E-posta ve rol bu uçtan değiştirilemez.
        if (payload.fullName !== undefined)
            req.user.fullName = payload.fullName;
        if (payload.companyName !== undefined)
            req.user.companyName = payload.companyName;
        if (payload.title !== undefined)
            req.user.title = payload.title;
        if (payload.phone !== undefined)
            req.user.phone = payload.phone;
        if (payload.avatarUrl !== undefined)
            req.user.avatarUrl = payload.avatarUrl;
        const { fullName, email, companyName, title, phone, avatarUrl } = req.user;
        res.json({ fullName, email, companyName, title, phone: phone ?? '', avatarUrl });
    },
    notifications(req, res) {
        if (!req.user)
            throw ApiError.unauthorized();
        initUserSettings(req.user.id);
        res.json(db.notificationSettings.get(req.user.id));
    },
    updateNotifications(req, res) {
        if (!req.user)
            throw ApiError.unauthorized();
        initUserSettings(req.user.id);
        const current = db.notificationSettings.get(req.user.id);
        if (!current)
            throw ApiError.notFound('Bildirim tercihleri bulunamadı.');
        const patch = req.body;
        const updated = { ...current, ...patch };
        db.notificationSettings.set(req.user.id, updated);
        res.json(updated);
    },
    security(req, res) {
        if (!req.user)
            throw ApiError.unauthorized();
        initUserSettings(req.user.id);
        res.json(db.securitySettings.get(req.user.id));
    },
    changePassword(req, res) {
        if (!req.user)
            throw ApiError.unauthorized();
        const { currentPassword, newPassword } = req.body;
        if (!authController.checkPassword(req.user, currentPassword)) {
            throw ApiError.badRequest('Mevcut şifreniz hatalı.', {
                currentPassword: 'Mevcut şifreniz hatalı.',
            });
        }
        if (currentPassword === newPassword) {
            throw ApiError.badRequest('Yeni şifre mevcut şifrenizden farklı olmalıdır.', {
                newPassword: 'Yeni şifre mevcut şifrenizden farklı olmalıdır.',
            });
        }
        authController.setPassword(req.user, newPassword);
        // Güvenlik günlüğüne kaydet.
        const settings = db.securitySettings.get(req.user.id);
        settings?.log.unshift({
            id: makeId('log'),
            action: 'Şifre değiştirildi',
            detail: 'Ayarlar üzerinden güncellendi',
            dateLabel: nowLabel(),
        });
        res.json({ message: 'Şifreniz başarıyla güncellendi.' });
    },
    setTwoFactor(req, res) {
        if (!req.user)
            throw ApiError.unauthorized();
        initUserSettings(req.user.id);
        const settings = db.securitySettings.get(req.user.id);
        if (!settings)
            throw ApiError.notFound('Güvenlik ayarları bulunamadı.');
        const { enabled } = req.body;
        settings.twoFactorEnabled = enabled;
        settings.log.unshift({
            id: makeId('log'),
            action: enabled
                ? 'İki adımlı doğrulama etkinleştirildi'
                : 'İki adımlı doğrulama devre dışı bırakıldı',
            detail: 'E-posta tabanlı doğrulama',
            dateLabel: nowLabel(),
        });
        res.json(settings);
    },
    revokeSession(req, res) {
        if (!req.user)
            throw ApiError.unauthorized();
        const settings = db.securitySettings.get(req.user.id);
        if (!settings)
            throw ApiError.notFound('Güvenlik ayarları bulunamadı.');
        const session = settings.sessions.find((item) => item.id === req.params.sessionId);
        if (!session)
            throw ApiError.notFound('Oturum bulunamadı.');
        if (session.isCurrent) {
            throw ApiError.badRequest('Mevcut oturumu bu ekrandan sonlandıramazsınız. Çıkış yapın.');
        }
        settings.sessions = settings.sessions.filter((item) => item.id !== session.id);
        settings.log.unshift({
            id: makeId('log'),
            action: 'Oturum sonlandırıldı',
            detail: `${session.device} · ${session.location}`,
            dateLabel: nowLabel(),
        });
        res.json(settings);
    },
};
//# sourceMappingURL=settingsController.js.map