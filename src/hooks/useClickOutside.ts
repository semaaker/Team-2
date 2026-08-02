import { useEffect, useRef } from 'react';

/**
 * Referans verilen elemanın dışına tıklandığında veya Escape'e basıldığında
 * `handler`'ı çalıştırır. Dropdown ve modal kapatma davranışı için.
 */
export function useClickOutside<T extends HTMLElement>(
  handler: () => void,
  active = true,
): React.RefObject<T> {
  const ref = useRef<T>(null);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const node = ref.current;
      if (!node || node.contains(event.target as Node)) return;
      handlerRef.current();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handlerRef.current();
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active]);

  return ref;
}
