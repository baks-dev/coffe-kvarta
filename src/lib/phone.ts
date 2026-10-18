export const BELARUS_MOBILE_CODES = ['25', '29', '33', '44'] as const;

/**
 * Любая допустимая запись белорусского мобильного → '+375XXXXXXXXX'; иначе null.
 * Алгоритм — design.md, «Решения» п. 1.
 */
export function normalizeBelarusPhone(input: string): string | null {
  const s = input.trim();

  // Проверка на недопустимые символы
  const allowedChars = /[0-9 +()\-]/;
  for (const char of s) {
    if (!allowedChars.test(char)) return null;
  }

  // Проверка на '+': только первый символ и только один раз
  const plusCount = s.split('+').length - 1;
  if (plusCount > 1) return null;
  if (plusCount === 1 && s[0] !== '+') return null;

  // Извлекаем только цифры
  const digits = s.replace(/\d/g, '').replace(/[^\d]/g, '');

  let national: string | null = null;

  if (s.startsWith('+')) {
    if (digits.length !== 12 || !digits.startsWith('375')) return null;
    national = digits.slice(3);
  } else {
    // Без префикса +
    if (digits.length === 12 && digits.startsWith('375')) {
      national = digits.slice(3);
    } else if (digits.length === 11 && digits.startsWith('80')) {
      national = digits.slice(2);
    } else if (digits.length === 9) {
      national = digits;
    } else {
      return null;
    }
  }

  // Проверка, что первые две цифры — код мобильного оператора
  if (!BELARUS_MOBILE_CODES.includes(national.slice(0, 2) as any)) return null;

  return '+375' + national;
}

/**
 * Любая допустимая запись → '+375 29 123-45-67'. Недопустимая возвращается без изменений.
 */
export function formatBelarusPhone(input: string): string {
  const normalized = normalizeBelarusPhone(input);
  if (!normalized) return input;

  // normalized = '+375XXXXXXXXX'
  const digits = normalized.slice(1); // '375XXXXXXXXX'
  return `+375 ${digits.slice(0, 2)} ${digits.slice(2, 5)}-${digits.slice(5, 7)}-${digits.slice(7)}`;
}
