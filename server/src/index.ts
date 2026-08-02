import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`\n  SponsorMatch AI API`);
  console.log(`  ────────────────────────────────────────`);
  console.log(`  Ortam    : ${env.NODE_ENV}`);
  console.log(`  Adres    : http://localhost:${env.PORT}`);
  console.log(`  Sağlık   : http://localhost:${env.PORT}/api/health`);
  if (!env.isProduction) {
    console.log(`  Demo giriş: ayse@sponsormatch.ai (organizatör)`);
    console.log(`             mehmet@globalfinans.com (sponsor)`);
    console.log(`  Doğrulama kodu geliştirme modunda yanıtta döner.`);
  }
  console.log(`  ────────────────────────────────────────\n`);
});

/** Konteyner ortamlarında düzgün kapanış. */
function shutdown(signal: string) {
  console.log(`\n[api] ${signal} alındı, sunucu kapatılıyor...`);
  server.close(() => process.exit(0));

  // Bağlantılar 10 saniyede kapanmazsa zorla çık.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
