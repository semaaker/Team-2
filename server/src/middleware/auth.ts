import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { db } from '../data/db.js';
import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';
import type { User, UserRole } from '../types.js';

// Express Request'e `user` alanı ekleniyor.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

function readToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

/** Oturum zorunlu — geçersizse 401 döner. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = readToken(req);
  if (!token) return next(ApiError.unauthorized());

  const userId = verifyToken(token);
  if (!userId)
    return next(ApiError.unauthorized('Oturumunuzun süresi doldu. Lütfen tekrar giriş yapın.'));

  const user = db.users.find((item) => item.id === userId);
  if (!user) return next(ApiError.unauthorized());

  req.user = user;
  next();
};

/**
 * Oturum varsa kullanıcıyı ekler, yoksa isteği geçirir.
 * Keşfet gibi hem misafir hem üyeye açık uçlar için.
 */
export const optionalAuth: RequestHandler = (req, _res, next) => {
  const token = readToken(req);
  if (token) {
    const userId = verifyToken(token);
    if (userId) req.user = db.users.find((item) => item.id === userId);
  }
  next();
};

/** Belirli role sahip kullanıcıları geçirir. */
export function requireRole(role: UserRole): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (req.user.role !== role) {
      return next(ApiError.forbidden('Bu bölüm hesap türünüz için kullanılamıyor.'));
    }
    next();
  };
}
