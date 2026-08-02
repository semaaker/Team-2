/**
 * İstemcinin anlayabileceği yapıda hata.
 * `fields` alanı, formlarda alan bazlı hata göstermek için kullanılır.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fields?: Record<string, string>;

  constructor(
    status: number,
    message: string,
    options: { code?: string; fields?: Record<string, string> } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options.code;
    this.fields = options.fields;
  }

  static badRequest(message: string, fields?: Record<string, string>) {
    return new ApiError(400, message, { code: 'BAD_REQUEST', fields });
  }

  static unauthorized(message = 'Bu işlem için giriş yapmanız gerekiyor.') {
    return new ApiError(401, message, { code: 'UNAUTHORIZED' });
  }

  static forbidden(message = 'Bu kaynağa erişim yetkiniz yok.') {
    return new ApiError(403, message, { code: 'FORBIDDEN' });
  }

  static notFound(message = 'Kayıt bulunamadı.') {
    return new ApiError(404, message, { code: 'NOT_FOUND' });
  }

  static conflict(message: string, fields?: Record<string, string>) {
    return new ApiError(409, message, { code: 'CONFLICT', fields });
  }

  static internal(message = 'Beklenmeyen bir hata oluştu.') {
    return new ApiError(500, message, { code: 'INTERNAL_ERROR' });
  }
}
