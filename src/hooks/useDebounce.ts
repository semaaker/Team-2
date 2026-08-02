import { useEffect, useState } from 'react';

/**
 * Bir değeri belirtilen süre boyunca sabitler.
 * Arama kutusunun her tuş vuruşunda istek atmasını engellemek için kullanılır.
 */
export function useDebounce<T>(value: T, delayMs = 350): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
