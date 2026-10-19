import { describe, expect, it } from 'vitest';
import { LEAD_MESSAGES, leadSchema } from '@/lib/lead-schema';

const base = { name: 'Аня', phone: '+375291234567', interest: 'order' as const };

function messagesFor(input: unknown, field: string): string[] {
  const result = leadSchema.safeParse(input);
  if (result.success) return [];
  return result.error.issues
    .filter((issue) => issue.path[0] === field)
    .map((issue) => issue.message);
}

describe('leadSchema', () => {
  // Сценарий: Notations of one number
  it('Notations of one number: each value normalizes to +375291234567', () => {
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
    for (const value of values) {
      const parsed = leadSchema.parse({ ...base, phone: value });
      expect(parsed.phone).toBe('+375291234567');
    }
  });

  // Сценарий: Empty phone
  it('Empty phone: empty string and whitespace return required message', () => {
    expect(messagesFor({ ...base, phone: '' }, 'phone')).toEqual([LEAD_MESSAGES.phoneRequired]);
    expect(messagesFor({ ...base, phone: '   ' }, 'phone')).toEqual([LEAD_MESSAGES.phoneRequired]);
  });

  // Сценарий: Landline number
  it('Landline number: +375 17 123-45-67 and 8 017 123-45-67 are rejected', () => {
    const values = ['+375 17 123-45-67', '8 017 123-45-67'];
    for (const value of values) {
      expect(messagesFor({ ...base, phone: value }, 'phone')).toEqual([LEAD_MESSAGES.phoneInvalid]);
    }
  });

  // Сценарий: Wrong digit count
  it('Wrong digit count: +375 29 123-45-6, +375 29 123-45-678, 0291234567 are rejected', () => {
    const values = ['+375 29 123-45-6', '+375 29 123-45-678', '0291234567'];
    for (const value of values) {
      expect(messagesFor({ ...base, phone: value }, 'phone')).toEqual([LEAD_MESSAGES.phoneInvalid]);
    }
  });

  // Сценарий: Foreign number
  it('Foreign number: +7 900 123-45-67 is rejected', () => {
    expect(messagesFor({ ...base, phone: '+7 900 123-45-67' }, 'phone')).toEqual([
      LEAD_MESSAGES.phoneInvalid,
    ]);
  });

  // Сценарий: Forbidden characters
  it('Forbidden characters: 29 123-45-6X, ++375291234567, 375+291234567, +80291234567 are rejected', () => {
    const values = ['29 123-45-6X', '++375291234567', '375+291234567', '+80291234567'];
    for (const value of values) {
      expect(messagesFor({ ...base, phone: value }, 'phone')).toEqual([LEAD_MESSAGES.phoneInvalid]);
    }
  });

  // Сценарий: Empty name
  it('Empty name: empty string and whitespace return required message', () => {
    expect(messagesFor({ ...base, name: '' }, 'name')).toEqual([LEAD_MESSAGES.nameRequired]);
    expect(messagesFor({ ...base, name: '   ' }, 'name')).toEqual([LEAD_MESSAGES.nameRequired]);
  });

  // Сценарий: Name of 60 characters
  it('Name of 60 characters is accepted', () => {
    const parsed = leadSchema.parse({ ...base, name: 'А'.repeat(60) });
    expect(parsed.name).toBe('А'.repeat(60));
  });

  // Сценарий: Name of 61 characters
  it('Name of 61 characters returns too long message', () => {
    expect(messagesFor({ ...base, name: 'А'.repeat(61) }, 'name')).toEqual([
      LEAD_MESSAGES.nameTooLong,
    ]);
  });

  // Сценарий: Comment of 500 characters
  it('Comment of 500 characters is accepted', () => {
    const parsed = leadSchema.parse({ ...base, comment: 'к'.repeat(500) });
    expect(parsed.comment).toBe('к'.repeat(500));
  });

  // Сценарий: Comment of 501 characters
  it('Comment of 501 characters returns too long message', () => {
    expect(messagesFor({ ...base, comment: 'к'.repeat(501) }, 'comment')).toEqual([
      LEAD_MESSAGES.commentTooLong,
    ]);
  });

  // Сценарий: Comment omitted
  it('Comment omitted defaults to empty string', () => {
    const parsed = leadSchema.parse(base);
    expect(parsed.comment).toBe('');
  });

  // Сценарий: Unknown interest
  it('Unknown interest returns invalid message', () => {
    expect(messagesFor({ ...base, interest: 'wholesale' as never }, 'interest')).toEqual([
      LEAD_MESSAGES.interestInvalid,
    ]);
  });

  // Сценарий: Unknown product id
  it('Unknown product id returns not found message', () => {
    expect(messagesFor({ ...base, productId: 'latte' }, 'productId')).toEqual([
      LEAD_MESSAGES.productInvalid,
    ]);
  });

  it('Valid product id is accepted', () => {
    const parsed = leadSchema.parse({ ...base, productId: 'colombia' });
    expect(parsed.productId).toBe('colombia');
  });

  // Сценарий: Extra keys are dropped
  it('Extra keys are dropped', () => {
    const parsed = leadSchema.parse({ ...base, isAdmin: true });
    expect('isAdmin' in parsed).toBe(false);
  });

  // Сценарий: Request body with product
  it('Request body with product is serialized correctly', () => {
    const parsed = leadSchema.parse({
      name: '  Аня  ',
      phone: '8 029 123-45-67',
      interest: 'order' as const,
      comment: '  Позвоните после 18:00 ',
      productId: 'colombia',
    });
    expect(JSON.stringify(parsed)).toBe(
      '{"name":"Аня","phone":"+375291234567","interest":"order","comment":"Позвоните после 18:00","productId":"colombia"}',
    );
  });

  // Сценарий: Request body without product
  it('Request body without product is serialized correctly', () => {
    const parsed = leadSchema.parse({
      name: 'Аня',
      phone: '29 123-45-67',
      interest: 'question' as const,
      comment: '',
    });
    expect(JSON.stringify(parsed)).toBe(
      '{"name":"Аня","phone":"+375291234567","interest":"question","comment":""}',
    );
  });
});
