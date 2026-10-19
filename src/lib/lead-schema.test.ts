import { describe, expect, it } from 'vitest';
import { LEAD_MESSAGES, leadSchema } from '@/lib/lead-schema';

describe('leadSchema', () => {
  const base = { name: 'Аня', phone: '+375291234567', interest: 'order' };

  function messagesFor(input: unknown, field: string): string[] {
    const result = leadSchema.safeParse(input);
    if (result.success) {
      return [];
    }
    return result.error.issues
      .filter((issue) => issue.path[0] === field)
      .map((issue) => issue.message);
  }

  // @scenario: Notations of one number
  it('normalizes phone values to +375291234567', () => {
    const validPhoneValues = [
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
    for (const value of validPhoneValues) {
      expect(leadSchema.parse({ ...base, phone: value }).phone).toBe('+375291234567');
    }
  });

  // @scenario: Empty phone
  it('rejects empty or whitespace-only phone with phoneRequired message', () => {
    expect(messagesFor({ ...base, phone: '' }, 'phone')).toEqual([LEAD_MESSAGES.phoneRequired]);
    expect(messagesFor({ ...base, phone: '   ' }, 'phone')).toEqual([LEAD_MESSAGES.phoneRequired]);
  });

  // @scenario: Landline number
  it('rejects landline numbers with phoneInvalid message', () => {
    expect(messagesFor({ ...base, phone: '+375 17 123-45-67' }, 'phone')).toEqual([
      LEAD_MESSAGES.phoneInvalid,
    ]);
    expect(messagesFor({ ...base, phone: '8 017 123-45-67' }, 'phone')).toEqual([
      LEAD_MESSAGES.phoneInvalid,
    ]);
  });

  // @scenario: Wrong digit count
  it('rejects numbers with wrong digit count with phoneInvalid message', () => {
    expect(messagesFor({ ...base, phone: '+375 29 123-45-6' }, 'phone')).toEqual([
      LEAD_MESSAGES.phoneInvalid,
    ]);
    expect(messagesFor({ ...base, phone: '+375 29 123-45-678' }, 'phone')).toEqual([
      LEAD_MESSAGES.phoneInvalid,
    ]);
    expect(messagesFor({ ...base, phone: '0291234567' }, 'phone')).toEqual([
      LEAD_MESSAGES.phoneInvalid,
    ]);
  });

  // @scenario: Foreign number
  it('rejects foreign numbers with phoneInvalid message', () => {
    expect(messagesFor({ ...base, phone: '+7 900 123-45-67' }, 'phone')).toEqual([
      LEAD_MESSAGES.phoneInvalid,
    ]);
  });

  // @scenario: Forbidden characters
  it('rejects phone values with forbidden characters with phoneInvalid message', () => {
    expect(messagesFor({ ...base, phone: '29 123-45-6X' }, 'phone')).toEqual([
      LEAD_MESSAGES.phoneInvalid,
    ]);
    expect(messagesFor({ ...base, phone: '++375291234567' }, 'phone')).toEqual([
      LEAD_MESSAGES.phoneInvalid,
    ]);
    expect(messagesFor({ ...base, phone: '375+291234567' }, 'phone')).toEqual([
      LEAD_MESSAGES.phoneInvalid,
    ]);
    expect(messagesFor({ ...base, phone: '+80291234567' }, 'phone')).toEqual([
      LEAD_MESSAGES.phoneInvalid,
    ]);
  });

  // @scenario: Empty name
  it('rejects empty or whitespace-only name with nameRequired message', () => {
    expect(messagesFor({ ...base, name: '' }, 'name')).toEqual([LEAD_MESSAGES.nameRequired]);
    expect(messagesFor({ ...base, name: '   ' }, 'name')).toEqual([LEAD_MESSAGES.nameRequired]);
  });

  // @scenario: Name of 60 characters
  it('accepts name with exactly 60 characters', () => {
    const name60 = 'А'.repeat(60);
    expect(leadSchema.parse({ ...base, name: name60 }).name).toBe(name60);
  });

  // @scenario: Name of 61 characters
  it('rejects name with 61 characters with nameTooLong message', () => {
    const name61 = 'А'.repeat(61);
    expect(messagesFor({ ...base, name: name61 }, 'name')).toEqual([LEAD_MESSAGES.nameTooLong]);
  });

  // @scenario: Comment of 500 characters
  it('accepts comment with exactly 500 characters', () => {
    const comment500 = 'к'.repeat(500);
    expect(leadSchema.parse({ ...base, comment: comment500 }).comment).toBe(comment500);
  });

  // @scenario: Comment of 501 characters
  it('rejects comment with 501 characters with commentTooLong message', () => {
    const comment501 = 'к'.repeat(501);
    expect(messagesFor({ ...base, comment: comment501 }, 'comment')).toEqual([
      LEAD_MESSAGES.commentTooLong,
    ]);
  });

  // @scenario: Comment omitted
  it('defaults comment to empty string when omitted', () => {
    expect(leadSchema.parse(base).comment).toBe('');
  });

  // @scenario: Unknown interest
  it('rejects unknown interest with interestInvalid message', () => {
    expect(messagesFor({ ...base, interest: 'wholesale' }, 'interest')).toEqual([
      LEAD_MESSAGES.interestInvalid,
    ]);
  });

  // @scenario: Unknown product id
  it('rejects unknown product id with productInvalid message', () => {
    expect(messagesFor({ ...base, productId: 'latte' }, 'productId')).toEqual([
      LEAD_MESSAGES.productInvalid,
    ]);
  });

  // @scenario: Unknown product id (valid product check)
  it('accepts valid product id', () => {
    expect(leadSchema.parse({ ...base, productId: 'colombia' }).productId).toBe('colombia');
  });

  // @scenario: Extra keys are dropped
  it('drops extra keys from parsed data', () => {
    const result = leadSchema.parse({ ...base, isAdmin: true });
    expect('isAdmin' in result).toBe(false);
  });

  // @scenario: Request body with product
  it('produces correct JSON for request with product', () => {
    const input = {
      name: '  Аня  ',
      phone: '8 029 123-45-67',
      interest: 'order',
      comment: '  Позвоните после 18:00 ',
      productId: 'colombia',
    };
    expect(JSON.stringify(leadSchema.parse(input))).toBe(
      '{"name":"Аня","phone":"+375291234567","interest":"order","comment":"Позвоните после 18:00","productId":"colombia"}',
    );
  });

  // @scenario: Request body without product
  it('produces correct JSON for request without product', () => {
    const input = {
      name: 'Аня',
      phone: '29 123-45-67',
      interest: 'question',
      comment: '',
    };
    expect(JSON.stringify(leadSchema.parse(input))).toBe(
      '{"name":"Аня","phone":"+375291234567","interest":"question","comment":""}',
    );
  });
});
