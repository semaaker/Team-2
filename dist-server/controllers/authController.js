import { createHash, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { db, initUserSettings, publicUser } from '../data/db.js';
import { ApiError } from '../utils/ApiError.js';
import { createToken } from '../utils/token.js';
import { makeId, makeVerificationCode } from '../utils/helpers.js';
import { env } from '../config/env.js';
const CODE_TTL_SECONDS = 300;
const MAX_CODE_ATTEMPTS = 5;
/* ------------------------------- Şemalar ------------------------------- */
export const requestCodeSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'E-posta adresi zorunludur.')
        .email('Geçerli bir e-posta adresi girin.'),
});
export const verifyCodeSchema = z.object({
    email: z.string().trim().email('Geçerli bir e-posta adresi girin.'),
    code: z
        .string()
        .trim()
        .regex(/^\d{6}$/, 'Kod 6 haneli olmalıdır.'),
});
export const registerSchema = z.object({
    fullName: z.string().trim().min(3, 'Ad Soyad en az 3 karakter olmalıdır.'),
    companyName: z.string().trim().min(2, 'Şirket adı zorunludur.'),
    email: z.string().trim().email('Geçerli bir e-posta adresi girin.'),
    password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır.'),
    role: z.enum(['organizer', 'sponsor'], {
        errorMap: () => ({ message: 'Hesap türü organizer veya sponsor olmalıdır.' }),
    }),
});
export const forgotPasswordSchema = requestCodeSchema;
/* ------------------------------ Yardımcılar ------------------------------ */
function hashPassword(password) {
    // Not: Üretim dağıtımında bcrypt/argon2 tercih edilmelidir. Burada ek
    // bağımlılık olmadan salt'lı SHA-256 kullanılıyor.
    return createHash('sha256').update(`${env.AUTH_SECRET}:${password}`).digest('hex');
}
function verifyPassword(password, hash) {
    const candidate = Buffer.from(hashPassword(password));
    const expected = Buffer.from(hash);
    if (candidate.length !== expected.length)
        return false;
    return timingSafeEqual(candidate, expected);
}
function findUserByEmail(email) {
    const normalized = email.trim().toLowerCase();
    return db.users.find((user) => user.email.toLowerCase() === normalized);
}
/* ------------------------------ Controller ------------------------------ */
export const authController = {
    /**
     * Adım 1 — doğrulama kodu üretir.
     *
     * Hesap yoksa da başarılı yanıt döneriz (kullanıcı numaralandırma saldırısını
     * önlemek için); kod yalnızca kayıtlı adresler için gerçekten üretilir.
     */
    requestCode(req, res) {
        const { email } = req.body;
        const normalized = email.trim().toLowerCase();
        const user = findUserByEmail(normalized);
        const code = makeVerificationCode();
        if (user) {
            db.pendingCodes.set(normalized, {
                email: normalized,
                code,
                expiresAt: Date.now() + CODE_TTL_SECONDS * 1000,
                attempts: 0,
            });
        }
        res.json({
            email: normalized,
            expiresInSeconds: CODE_TTL_SECONDS,
            // Demo kolaylığı: geliştirme ortamında kodu yanıtta döneriz.
            // Üretimde bu alan hiçbir zaman gönderilmez.
            ...(env.isProduction || !user ? null : { devCode: code }),
        });
    },
    /** Adım 2 — kodu doğrular ve oturum açar. */
    verifyCode(req, res) {
        const { email, code } = req.body;
        const normalized = email.trim().toLowerCase();
        const pending = db.pendingCodes.get(normalized);
        if (!pending) {
            throw ApiError.badRequest('Doğrulama kodu bulunamadı. Lütfen yeni bir kod isteyin.');
        }
        if (pending.expiresAt < Date.now()) {
            db.pendingCodes.delete(normalized);
            throw ApiError.badRequest('Kodun süresi doldu. Lütfen yeni bir kod isteyin.');
        }
        pending.attempts += 1;
        if (pending.attempts > MAX_CODE_ATTEMPTS) {
            db.pendingCodes.delete(normalized);
            throw ApiError.badRequest('Çok fazla hatalı deneme yaptınız. Lütfen yeni bir kod isteyin.');
        }
        if (pending.code !== code) {
            throw ApiError.badRequest('Girdiğiniz kod hatalı. Lütfen tekrar deneyin.');
        }
        const user = findUserByEmail(normalized);
        if (!user)
            throw ApiError.notFound('Kullanıcı bulunamadı.');
        db.pendingCodes.delete(normalized);
        initUserSettings(user.id);
        res.json({ token: createToken(user.id), user: publicUser(user) });
    },
    /** Yeni kurumsal hesap oluşturur. */
    register(req, res) {
        const payload = req.body;
        const normalized = payload.email.trim().toLowerCase();
        if (findUserByEmail(normalized)) {
            throw ApiError.conflict('Bu e-posta adresiyle kayıtlı bir hesap zaten var.', {
                email: 'Bu e-posta adresi kullanımda.',
            });
        }
        const user = {
            id: makeId('usr'),
            fullName: payload.fullName.trim(),
            email: normalized,
            companyName: payload.companyName.trim(),
            role: payload.role,
            title: payload.role === 'organizer' ? 'Organizatör' : 'Marka Temsilcisi',
            avatarUrl: '',
            createdAt: new Date().toISOString(),
            passwordHash: hashPassword(payload.password),
        };
        db.users.push(user);
        initUserSettings(user.id);
        res.status(201).json({ token: createToken(user.id), user: publicUser(user) });
    },
    /** Şifre sıfırlama bağlantısı isteği. */
    forgotPassword(req, res) {
        const { email } = req.body;
        // Hesabın varlığını sızdırmamak için her durumda aynı yanıt döner.
        res.json({
            message: `${email.trim().toLowerCase()} adresine bir sıfırlama bağlantısı gönderildi.`,
        });
    },
    /** Aktif oturumun kullanıcısı. */
    me(req, res) {
        if (!req.user)
            throw ApiError.unauthorized();
        res.json(publicUser(req.user));
    },
    /**
     * Oturumu kapatır.
     * Token durumsuz olduğu için sunucuda saklanan bir kayıt yoktur; istemci
     * token'ı siler. Uç, ileride token kara listesi eklemek için mevcuttur.
     */
    logout(_req, res) {
        res.status(204).end();
    },
    /** Parola doğrulama — ayarlar ekranındaki şifre değiştirme akışı kullanır. */
    checkPassword(user, password) {
        // Tohum kullanıcıların parolası yoktur; demo amaçlı sabit parola kabul edilir.
        if (!user.passwordHash)
            return password === 'sponsormatch';
        return verifyPassword(password, user.passwordHash);
    },
    setPassword(user, password) {
        user.passwordHash = hashPassword(password);
    },
};
//# sourceMappingURL=authController.js.map