import { useCallback, useEffect, useRef, useState } from 'react';
import { ApiError } from '@/services';

/**
 * Veri çekme durumunu (loading / error / empty / success) tek noktadan yöneten
 * hafif hook'lar. Harici bir sorgu kütüphanesi eklemeden aynı ergonomiyi verir.
 */

export interface QueryState<T> {
  data: T | null;
  isLoading: boolean;
  error: ApiError | null;
  /** İlk yükleme mi, yoksa arka planda tazeleme mi? */
  isRefreshing: boolean;
  refetch: () => void;
  /** Optimistic güncellemeler için yerel veriyi doğrudan set eder. */
  setData: (updater: T | null | ((prev: T | null) => T | null)) => void;
}

/**
 * Bir async fonksiyonu bağımlılıkları değiştikçe çalıştırır.
 *
 * @param fetcher Veriyi getiren fonksiyon. `useCallback` ile sarmalanmalıdır.
 * @param options.enabled `false` iken istek atılmaz (örn. id henüz yokken).
 */
export function useQuery<T>(
  fetcher: () => Promise<T>,
  options: { enabled?: boolean } = {},
): QueryState<T> {
  const { enabled = true } = options;

  const [data, setDataState] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Bileşen unmount olduktan sonra state güncellemesini engeller.
  const mountedRef = useRef(true);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    if (hasLoadedRef.current) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      if (!mountedRef.current) return;
      setDataState(result);
      hasLoadedRef.current = true;
    } catch (err) {
      if (!mountedRef.current) return;
      setError(
        err instanceof ApiError
          ? err
          : new ApiError(0, { message: 'Veri alınırken beklenmeyen bir hata oluştu.' }),
      );
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [fetcher, enabled]);

  useEffect(() => {
    void run();
  }, [run]);

  const setData = useCallback((updater: T | null | ((prev: T | null) => T | null)) => {
    setDataState((prev) =>
      typeof updater === 'function' ? (updater as (p: T | null) => T | null)(prev) : updater,
    );
  }, []);

  return { data, isLoading, isRefreshing, error, refetch: run, setData };
}

export interface MutationState<TArgs extends unknown[], TResult> {
  mutate: (...args: TArgs) => Promise<TResult>;
  isPending: boolean;
  error: ApiError | null;
  reset: () => void;
}

/**
 * Yazma işlemleri (form gönderimi, durum değişikliği) için.
 * Hata `ApiError` olarak döner; `error.fields` alan bazlı mesajları taşır.
 */
export function useMutation<TArgs extends unknown[], TResult>(
  mutationFn: (...args: TArgs) => Promise<TResult>,
  options: {
    onSuccess?: (result: TResult) => void;
    onError?: (error: ApiError) => void;
  } = {},
): MutationState<TArgs, TResult> {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  // Callback'leri ref'te tutarak `mutate`'in kimliğini stabil tutuyoruz.
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult> => {
      setIsPending(true);
      setError(null);
      try {
        const result = await mutationFn(...args);
        optionsRef.current.onSuccess?.(result);
        return result;
      } catch (err) {
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError(0, { message: 'İşlem tamamlanamadı. Lütfen tekrar deneyin.' });
        setError(apiError);
        optionsRef.current.onError?.(apiError);
        throw apiError;
      } finally {
        setIsPending(false);
      }
    },
    [mutationFn],
  );

  const reset = useCallback(() => setError(null), []);

  return { mutate, isPending, error, reset };
}
