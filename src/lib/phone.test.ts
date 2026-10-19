import { describe, expect, it } from 'vitest';
import { normalizeBelarusPhone, formatBelarusPhone } from '@/lib/phone';

// @scenario: Notations of one number
describe('normalizeBelarusPhone - Notations of one number', () => {
  const values = [
    '+375 29 123-45-67',
    '+375291234567',
    '+375 (29) 123-45-67',
    '375291234567',
    '80291234567',
    '8 029 123-45-67',
    '8 (029) 123 45 67',
    '29 123-45-67',
    '291234567',
    '  +375 29 123-45-67  ',
  ];
  const expected = '+375291234567';

  for (const value of values) {
    it(`normalizes "${value}" to ${expected}`, () => {
      const result = normalizeBelarusPhone(value);
      expect(result).toBe(expected);
    });
  }
});

// @scenario: All operator codes
describe('normalizeBelarusPhone - All operator codes', () => {
  it('+375 25 765-43-21 → +375257654321', () => {
    expect(normalizeBelarusPhone('+375 25 765-43-21')).toBe('+375257654321');
  });

  it('+375 33 456-78-90 → +375334567890', () => {
    expect(normalizeBelarusPhone('+375 33 456-78-90')).toBe('+375334567890');
  });

  it('+375 44 999-99-99 → +375449999999', () => {
    expect(normalizeBelarusPhone('+375 44 999-99-99')).toBe('+375449999999');
  });
});

// @scenario: Empty phone
describe('normalizeBelarusPhone - Empty phone', () => {
  it('empty string returns null', () => {
    expect(normalizeBelarusPhone('')).toBeNull();
  });

  it('whitespace-only string returns null', () => {
    expect(normalizeBelarusPhone('   ')).toBeNull();
  });
});

// @scenario: Landline number
describe('normalizeBelarusPhone - Landline number', () => {
  it('+375 17 123-45-67 returns null', () => {
    expect(normalizeBelarusPhone('+375 17 123-45-67')).toBeNull();
  });

  it('8 017 123-45-67 returns null', () => {
    expect(normalizeBelarusPhone('8 017 123-45-67')).toBeNull();
  });
});

// @scenario: Wrong digit count
describe('normalizeBelarusPhone - Wrong digit count', () => {
  it('+375 29 123-45-6 returns null (missing digit)', () => {
    expect(normalizeBelarusPhone('+375 29 123-45-6')).toBeNull();
  });

  it('+375 29 123-45-678 returns null (extra digit)', () => {
    expect(normalizeBelarusPhone('+375 29 123-45-678')).toBeNull();
  });

  it('0291234567 returns null (missing leading 375)', () => {
    expect(normalizeBelarusPhone('0291234567')).toBeNull();
  });
});

// @scenario: Foreign number
describe('normalizeBelarusPhone - Foreign number', () => {
  it('+7 900 123-45-67 returns null', () => {
    expect(normalizeBelarusPhone('+7 900 123-45-67')).toBeNull();
  });
});

// @scenario: Forbidden characters
describe('normalizeBelarusPhone - Forbidden characters', () => {
  it('29 123-45-6X returns null (X is not a digit)', () => {
    expect(normalizeBelarusPhone('29 123-45-6X')).toBeNull();
  });

  it('++375291234567 returns null (double plus)', () => {
    expect(normalizeBelarusPhone('++375291234567')).toBeNull();
  });

  it('375+291234567 returns null (plus in the middle)', () => {
    expect(normalizeBelarusPhone('375+291234567')).toBeNull();
  });

  it('+80291234567 returns null (wrong country code)', () => {
    expect(normalizeBelarusPhone('+80291234567')).toBeNull();
  });
});

// @scenario: Valid number is reformatted
describe('formatBelarusPhone - Valid number is reformatted', () => {
  it('80291234567 → +375 29 123-45-67', () => {
    expect(formatBelarusPhone('80291234567')).toBe('+375 29 123-45-67');
  });

  it('all normalized values from Notations of one number format to +375 29 123-45-67', () => {
    const values = [
      '+375 29 123-45-67',
      '+375291234567',
      '+375 (29) 123-45-67',
      '375291234567',
      '80291234567',
      '8 029 123-45-67',
      '8 (029) 123 45 67',
      '29 123-45-67',
      '291234567',
      '  +375 29 123-45-67  ',
    ];
    const expected = '+375 29 123-45-67';

    for (const value of values) {
      const normalized = normalizeBelarusPhone(value);
      expect(normalized).toBe('+375291234567');
      expect(formatBelarusPhone(value)).toBe(expected);
    }
  });
});

// @scenario: Invalid number is left as typed
describe('formatBelarusPhone - Invalid number is left as typed', () => {
  it('+375 17 1234567 remains unchanged', () => {
    const input = '+375 17 1234567';
    expect(formatBelarusPhone(input)).toBe(input);
  });

  it('empty string remains unchanged', () => {
    expect(formatBelarusPhone('')).toBe('');
  });
});
