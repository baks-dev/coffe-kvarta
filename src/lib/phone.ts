/** Коды мобильных операторов Беларуси. */
export const BELARUS_MOBILE_CODES = ['25', '29', '33', '44'] as const;

/**
 * Любая допустимая запись белорусского мобильного → '+375XXXXXXXXX'; иначе null.
 * Не бросает исключений.
 */
export function normalizeBelarusPhone(input: string): string | null {
  // Step 1: Let s = input.trim().
  const s = input.trim();

  // Step 2: If s === '', return null.
  if (s === '') {
    return null;
  }

  // Step 3: If s contains any character outside 0-9, space, +, (, ), -, return null.
  if (/[^0-9 +()-]/.test(s)) {
    return null;
  }

  // Step 4: If s contains + at any index other than 0, return null (this also rejects ++…).
  if (s.indexOf('+') > 0 || (s.indexOf('+') === 0 && s.lastIndexOf('+') > 0)) {
    return null;
  }

  // Step 5: Let digits = s.replace(/\D/g, '').
  const digits = s.replace(/\D/g, '');

  // Step 6: If s starts with +: if digits.length === 12 and digits.startsWith('375'), let national = digits.slice(3); otherwise return null.
  // Otherwise: if digits.length === 12 and digits.startsWith('375'), national = digits.slice(3);
  // else if digits.length === 11 and digits.startsWith('80'), national = digits.slice(2);
  // else if digits.length === 9, national = digits;
  // else return null.
  let national: string;

  if (s.startsWith('+')) {
    if (digits.length === 12 && digits.startsWith('375')) {
      national = digits.slice(3);
    } else {
      return null;
    }
  } else {
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

  // Step 8: If national.slice(0, 2) is not one of BELARUS_MOBILE_CODES, return null.
  if (!(BELARUS_MOBILE_CODES as readonly string[]).includes(national.slice(0, 2))) {
    return null;
  }

  // Step 9: Return '+375' + national.
  return '+375' + national;
}

/**
 * Допустимая запись → '+375 XX XXX-XX-XX'; недопустимая возвращается без изменений.
 */
export function formatBelarusPhone(input: string): string {
  // Step 1: Let normalized = normalizeBelarusPhone(input).
  const normalized = normalizeBelarusPhone(input);

  // Step 2: If normalized === null, return input unchanged.
  if (normalized === null) {
    return input;
  }

  // Step 3: Let n = normalized.slice(4) (9 digits).
  const n = normalized.slice(4);

  // Step 4: Return `+375 ${n.slice(0, 2)} ${n.slice(2, 5)}-${n.slice(5, 7)}-${n.slice(7, 9)}`.
  return `+375 ${n.slice(0, 2)} ${n.slice(2, 5)}-${n.slice(5, 7)}-${n.slice(7, 9)}`;
}
