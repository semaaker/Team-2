import { db } from '../data/db.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';
function readToken(req) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer '))
        return null;
    return header.slice(7).trim() || null;
}
/** Oturum zorunlu — geçersizse 401 döner. */
export const requireAuth = (req, _res, next) => {
    const token = readToken(req);
    if (!token)
        return next(ApiError.unauthorized());
    const userId = verifyToken(token);
    if (!userId)
        return next(ApiError.unauthorized('Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.'));
    const user = db.users.find((item) => item.id === userId);
    if (!user)
        return next(ApiError.unauthorized());
    req.user = user;
    next();
};
/**
 * Oturum varsa kullanıcıyı ekler, yoksa isteği geçirir.
 * Keşfet gibi hem misafir hem üyeye açık uçlar için.
 */
export const optionalAuth = (req, _res, next) => {
    const token = readToken(req);
    if (token) {
        const userId = verifyToken(token);
        if (userId)
            req.user = db.users.find((item) => item.id === userId);
    }
    next();
};
/** Belirli role sahip kullanıcıları geçirir. */
export function requireRole(role) {
    return (req, _res, next) => {
        if (!req.user)
            return next(ApiError.unauthorized());
        if (req.user.role !== role) {
            return next(ApiError.forbidden('Bu bölüm hesap türünüz için kullanılamıyor.'));
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map