import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

/** Tanımsız rotalar için 404. */
export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({
    message: `İstenen uç bulunamadı: ${req.method} ${req.originalUrl}`,
    code: 'NOT_FOUND',
  });
};

/**
 * Merkezî hata yakalayıcı.
 * Tüm hataları istemcinin beklediği `{ message, code, fields }` biçimine çevirir.
 */
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  // Zod doğrulama hataları -> alan bazlı mesajlar
  if (error instanceof ZodError) {
    const fields: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = issue.path.join('.') || 'form';
      if (!fields[key]) fields[key] = issue.message;
    }

    res.status(400).json({
      message: 'Gönderilen bilgilerde eksik veya hatalı alanlar var.',
      code: 'VALIDATION_ERROR',
      fields,
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.status).json({
      message: error.message,
      code: error.code,
      ...(error.fields ? { fields: error.fields } : null),
    });
    return;
  }

  // Multer dosya boyutu hatası
  if ((error as { code?: string }).code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      message: 'Yüklenen dosya çok büyük. En fazla 10 MB yükleyebilirsiniz.',
      code: 'FILE_TOO_LARGE',
    });
    return;
  }

  // Beklenmeyen hata — sunucu tarafında logla, istemciye detay sızdırma.
  console.error('[api] Beklenmeyen hata:', error);

  res.status(500).json({
    message: 'Sunucuda beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.',
    code: 'INTERNAL_ERROR',
    ...(env.isProduction ? null : { detail: (error as Error)?.message }),
  });
};
