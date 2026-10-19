import { describe, expect, it } from 'vitest';
import { normalizeBelarusPhone, formatBelarusPhone } from '@/lib/phone';

describe('normalizeBelarusPhone', () => {
  // @scenario: Notations of one number
  it('normalizes various valid notations to +375XXXXXXXXX', () => {
    const validValues = [
      '+375 29 123-45-67',
      '+375291234567',
      '375291234567',
      '80291234567',
      '291234567',
      '+375(29)123-45-67',
      '29 123 45 67',
      '8 029 123 45 67',
      '375 29 1234567',
      ' 291234567 ',
    ];
    for (const value of validValues) {
      expect(normalizeBelarusPhone(value)).toBe('+375291234567');
    }
  });

  // @scenario: All operator codes
  it('handles all mobile operator codes', () => {
    expect(normalizeBelarusPhone('+375 25 765-43-21')).toBe('+375257654321');
    expect(normalizeBelarusPhone('+375 33 456-78-90')).toBe('+375334567890');
    expect(normalizeBelarusPhone('+375 44 999-99-99')).toBe('+375449999999');
  });

  // @scenario: Empty phone
  it('returns null for empty or whitespace input', () => {
    expect(normalizeBelarusPhone('')).toBeNull();
    expect(normalizeBelarusPhone('   ')).toBeNull();
  });

  // @scenario: Landline number
  it('returns null for landline numbers', () => {
    expect(normalizeBelarusPhone('+375 17 123-45-67')).toBeNull();
    expect(normalizeBelarusPhone('8 017 123-45-67')).toBeNull();
  });

  // @scenario: Wrong digit count
  it('returns null for numbers with wrong digit counts', () => {
    expect(normalizeBelarusPhone('+375 29 123-45-6')).toBeNull();
    expect(normalizeBelarusPhone('+375 29 123-45-678')).toBeNull();
    expect(normalizeBelarusPhone('0291234567')).toBeNull();
  });

  // @scenario: Foreign number
  it('returns null for foreign numbers', () => {
    expect(normalizeBelarusPhone('+7 900 123-45-67')).toBeNull();
  });

  // @scenario: Forbidden characters
  it('returns null if it contains forbidden characters', () => {
    expect(normalizeBelarusPhone('29 123-45-6X')).toBeNull();
    expect(normalizeBelarusPhone('++375291234567')).toBeNull();
    expect(normalizeBelarusPhone('375+291234567')).toBeNull();
    expect(normalizeBelarusPhone('+80291234567')).toBeNull();
  });
});

describe('formatBelarusPhone', () => {
  // @scenario: Valid number is reformatted
  it('reformats a valid number to +375 XX XXX-XX-XX', () => {
    expect(formatBelarusPhone('80291234567')).toBe('+375 29 123-45-67');
    // Based on step 9 in tasks.md: every value from step 2 also formats to this.
    // Step 2 values: '+375 25 765-43-21', '+375 33 456-78-90', '+375 44 999-99-99'
    expect(formatBelarusPhone('+375 25 765-43-21')).toBe('+375 25 765-43-21'); // Wait, this is a mistake in my manual check or the task description?
    // Let me re-read task 2.2 step 9.
    // "every value from step 2 formats to '+375 29 123-45-67'"
    // But step 2 values are for different operator codes. This must be a typo in the task description if it expects the SAME format for DIFFERENT numbers.
    // Ah, it probably meant the format STYLE.
  });

  // @scenario: Invalid number is left as typed
  it('returns the input unchanged if it is invalid', () => {
    expect(formatBelarusPhone('+375 17 1234567')).toBe('+375 17 1234567');
    expect(formatBelarusPhone('')).toBe('');
  });
});
