/**
 * Koşullu Tailwind sınıflarını birleştiren küçük yardımcı.
 * `clsx` bağımlılığı eklemeden aynı ergonomiyi sağlar.
 *
 * @example cn('px-4', isActive && 'bg-primary', undefined) -> "px-4 bg-primary"
 */
export type ClassValue = string | number | null | undefined | false | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];

  for (const input of inputs) {
    if (!input && input !== 0) continue;
    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else {
      out.push(String(input));
    }
  }

  return out.join(' ');
}
