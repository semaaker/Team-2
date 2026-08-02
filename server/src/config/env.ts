import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Ortam değişkenlerini yükler ve doğrular.
 *
 * `.env` dosyası varsa okunur (dotenv bağımlılığı eklemeden), yoksa süreç
 * ortamı kullanılır. Böylece proje ek kurulum olmadan `npm run dev` ile çalışır.
 */

function loadDotEnv(): void {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf8');

    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      // Tırnak içindeki değerleri temizle
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Süreç ortamı .env'i ezer (CI/production öncelikli)
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    // .env yoksa sorun değil — varsayılanlarla devam ediyoruz.
  }
}

loadDotEnv();

function toInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const isProduction = NODE_ENV === 'production';

const AUTH_SECRET = process.env.AUTH_SECRET ?? 'sponsormatch-development-secret-do-not-use-in-prod';

// Üretimde varsayılan gizli anahtarla çalışmayı reddet — sessiz güvenlik açığı olmasın.
if (isProduction && AUTH_SECRET.includes('development-secret')) {
  throw new Error(
    'AUTH_SECRET ayarlanmamış. Üretim ortamında güçlü ve rastgele bir değer tanımlayın.',
  );
}

export const env = {
  NODE_ENV,
  isProduction,
  isDevelopment: NODE_ENV === 'development',
  PORT: toInt(process.env.PORT, 4000),
  AUTH_SECRET,
  AUTH_TOKEN_TTL: toInt(process.env.AUTH_TOKEN_TTL, 60 * 60 * 24 * 7),
  CORS_ORIGIN: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  API_LATENCY_MS: toInt(process.env.API_LATENCY_MS, isProduction ? 0 : 180),

  /**
   * n8n eşleştirme akışının üretim webhook adresi.
   * Tanımlıysa skorlama Gemini destekli akışa devredilir; tanımlı değilse
   * sunucu içindeki yerel kural motoru kullanılır (uygulama her hâlükârda çalışır).
   */
  AI_WEBHOOK_URL: (process.env.AI_WEBHOOK_URL ?? '').trim(),
  /** Webhook'a `X-SponsorMatch-Token` başlığıyla gönderilecek isteğe bağlı sır. */
  AI_WEBHOOK_TOKEN: (process.env.AI_WEBHOOK_TOKEN ?? '').trim(),
  /** n8n yanıt vermezse bu süre sonunda yerel motora düşülür. */
  AI_TIMEOUT_MS: toInt(process.env.AI_TIMEOUT_MS, 8000),
} as const;
