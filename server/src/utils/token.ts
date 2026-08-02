import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import { env } from '../config/env.js';

/**
 * HMAC ile imzalanmış, süresi olan basit oturum token'ı.
 *
 * Biçim: base64url(payload).base64url(signature)
 *
 * Not: Harici JWT bağımlılığı eklemeden aynı garantileri (bütünlük + süre)
 * sağlar. Gerçek bir dağıtımda `jsonwebtoken` veya oturum sunucusu tercih
 * edilebilir; arayüz aynı kaldığı için değişim tek dosyayla sınırlıdır.
 */

interface TokenPayload {
  sub: string;
  iat: number;
  exp: number;
  jti: string;
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(padded, 'base64');
}

function sign(data: string): string {
  return base64url(createHmac('sha256', env.AUTH_SECRET).update(data).digest());
}

/** Kullanıcı kimliği için yeni token üretir. */
export function createToken(userId: string): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    sub: userId,
    iat: now,
    exp: now + env.AUTH_TOKEN_TTL,
    jti: randomUUID(),
  };

  const encoded = base64url(JSON.stringify(payload));
  return `${encoded}.${sign(encoded)}`;
}

/**
 * Token'ı doğrular ve kullanıcı kimliğini döner.
 * Geçersiz imza veya süresi dolmuş token için `null` döner.
 */
export function verifyToken(token: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encoded, signature] = parts;

  const expected = sign(encoded);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  // Uzunluk farklıysa timingSafeEqual hata fırlatır — önce kontrol et.
  if (expectedBuffer.length !== actualBuffer.length) return null;
  if (!timingSafeEqual(expectedBuffer, actualBuffer)) return null;

  try {
    const payload = JSON.parse(fromBase64url(encoded).toString('utf8')) as TokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload.sub;
  } catch {
    return null;
  }
}
