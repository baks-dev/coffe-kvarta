import { describe, expect, it } from 'vitest';
import { normalizeBelarusPhone, formatBelarusPhone } from '@/lib/phone';

describe('normalizeBelarusPhone', () => {
  // (а) Допустимые записи
  it('8 029 123-45-67 → +375291234567', () => {
    expect(normalizeBelarusPhone('8 029 123-45-67')).toBe('+375291234567');
  });
  it('29 123-45-67 → +375291234567', () => {
    expect(normalizeBelarusPhone('29 123-45-67')).toBe('+375291234567');
  });
  it('+375 25 765-43-21 → +375257654321', () => {
    expect(normalizeBelarusPhone('+375 25 765-43-21')).toBe('+375257654321');
  });
  it('+375291234567 → +375291234567', () => {
    expect(normalizeBelarusPhone('+375291234567')).toBe('+375291234567');
  });
  it('375291234567 → +375291234567', () => {
    expect(normalizeBelarusPhone('375291234567')).toBe('+375291234567');
  });
  it('80291234567 → +375291234567', () => {
    expect(normalizeBelarusPhone('80291234567')).toBe('+375291234567');
  });
  it('25 765-43-21 → +375257654321', () => {
    expect(normalizeBelarusPhone('25 765-43-21')).toBe('+375257654321');
  });
  it('+375 (33) 456-78-90 → +375334567890', () => {
    expect(normalizeBelarusPhone('+375 (33) 456-78-90')).toBe('+375334567890');
  });
  it('44 999-99-99 → +375449999999', () => {
    expect(normalizeBelarusPhone('44 999-99-99')).toBe('+375449999999');
  });

  // (б) Недопустимые записи
  it('пустая строка → null', () => {
    expect(normalizeBelarusPhone('')).toBeNull();
  });
  it('только пробелы → null', () => {
    expect(normalizeBelarusPhone('   ')).toBeNull();
  });
  it('++375291234567 → null', () => {
    expect(normalizeBelarusPhone('++375291234567')).toBeNull();
  });
  it('+375 17 123-45-67 → null', () => {
    expect(normalizeBelarusPhone('+375 17 123-45-67')).toBeNull();
  });
  it('+375 29 123456 → null', () => {
    expect(normalizeBelarusPhone('+375 29 123456')).toBeNull();
  });
  it('+375 29 123-45-678 → null', () => {
    expect(normalizeBelarusPhone('+375 29 123-45-678')).toBeNull();
  });
  it('8 17 123-45-67 → null', () => {
    expect(normalizeBelarusPhone('8 17 123-45-67')).toBeNull();
  });
  it('123456789 → null', () => {
    expect(normalizeBelarusPhone('123456789')).toBeNull();
  });
  it('+375 29 123-45-6X → null', () => {
    expect(normalizeBelarusPhone('+375 29 123-45-6X')).toBeNull();
  });
  it('29 123-45-6X → null', () => {
    expect(normalizeBelarusPhone('29 123-45-6X')).toBeNull();
  });
  it('666 123-45-67 → null', () => {
    expect(normalizeBelarusPhone('666 123-45-67')).toBeNull();
  });

  // Проверяем formatBelarusPhone в задачах 2.1(в)
  it('formatBelarusPhone обрабатывает допустимые и недопустимые', () => {
    expect(formatBelarusPhone('80291234567')).toBe('+375 29 123-45-67');
    expect(formatBelarusPhone('+375 (44) 999-99-99')).toBe('+375 44 999-99-99');
    expect(formatBelarusPhone('+375 17 1234567')).toBe('+375 17 1234567');
  });
});
