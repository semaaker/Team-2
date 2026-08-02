import { TOKEN_STORAGE_KEY } from '@/utils/constants';
import type { ApiErrorBody } from '@/types';

/**
 * Tüm HTTP trafiğinin tek giriş noktası.
 *
 * - Oturum token'ını otomatik ekler
 * - Sunucu hatalarını `ApiError` olarak normalleştirir (UI her yerde aynı
 *   şekilde `error.message` ve `error.fields` okuyabilir)
 * - 401 durumunda oturumu düşürüp dinleyicileri bilgilendirir
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fields?: Record<string, string>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message);
    this.name = 'ApiError';
    this.status = status;
    this.code = body.code;
    this.fields = body.fields;
  }
}

/* ------------------------------ Token yönetimi ----------------------------- */

let inMemoryToken: string | null = null;

export function getToken(): string | null {
  if (inMemoryToken) return inMemoryToken;
  try {
    inMemoryToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    inMemoryToken = null;
  }
  return inMemoryToken;
}

export function setToken(token: string | null): void {
  inMemoryToken = token;
  try {
    if (token) window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* localStorage kapalıysa bellekteki token yeterlidir */
  }
}

/** Oturum düştüğünde AuthProvider'ın haberdar olması için basit bir yayın. */
type UnauthorizedListener = () => void;
const unauthorizedListeners = new Set<UnauthorizedListener>();

export function onUnauthorized(listener: UnauthorizedListener): () => void {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

/* --------------------------------- İstek ---------------------------------- */

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  /** JSON gövde. `FormData` gönderilecekse `formData` alanını kullanın. */
  body?: unknown;
  formData?: FormData;
  /** Sorgu parametreleri; `undefined` değerler atlanır. */
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = `${BASE_URL}/api${path.startsWith('/') ? path : `/${path}`}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.append(key, String(value));
  }

  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, formData, query, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  const token = getToken();
  if (token) finalHeaders.set('Authorization', `Bearer ${token}`);

  let payload: BodyInit | undefined;
  if (formData) {
    // Content-Type'ı tarayıcı boundary ile birlikte kendisi belirlemeli.
    payload = formData;
  } else if (body !== undefined) {
    finalHeaders.set('Content-Type', 'application/json');
    payload = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path, query), {
      ...rest,
      headers: finalHeaders,
      body: payload,
    });
  } catch {
    throw new ApiError(0, {
      message: 'Sunucuya ulaşılamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.',
      code: 'NETWORK_ERROR',
    });
  }

  if (response.status === 204) return undefined as T;

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401) {
      setToken(null);
      unauthorizedListeners.forEach((listener) => listener());
    }

    throw new ApiError(response.status, {
      message: (data as ApiErrorBody)?.message ?? 'Beklenmeyen bir hata oluştu.',
      code: (data as ApiErrorBody)?.code,
      fields: (data as ApiErrorBody)?.fields,
    });
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  postForm: <T>(path: string, formData: FormData, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', formData }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
