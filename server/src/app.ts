import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { env } from './config/env.js';
import { apiRoutes } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { simulateLatency } from './middleware/latency.js';

/**
 * Express uygulaması.
 * `index.ts` yalnızca dinlemeyi başlatır; bu ayrım testlerde uygulamayı
 * port açmadan çağırabilmeyi sağlar.
 */
export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Güvenlik başlıkları. CSP'yi kapatıyoruz çünkü SPA varlıkları ve
  // Google Fonts aynı sayfadan yükleniyor; üretimde proje alan adına göre
  // özelleştirilmiş bir politika tanımlanmalıdır.
  app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

  app.use(
    cors({
      origin: env.CORS_ORIGIN.length ? env.CORS_ORIGIN : true,
      credentials: true,
    }),
  );

  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (!env.isProduction) {
    app.use(morgan('dev'));
    app.use(simulateLatency);
  }

  app.use('/api', apiRoutes);

  // Üretimde derlenmiş istemciyi aynı sunucudan servis et.
  const clientDist = resolve(process.cwd(), 'dist');
  if (env.isProduction && existsSync(clientDist)) {
    app.use(express.static(clientDist));

    // SPA geri dönüşü — API dışındaki tüm yollar index.html'e gider.
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(resolve(clientDist, 'index.html'));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
