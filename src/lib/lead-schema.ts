import { z } from 'zod';
import { getProductById } from '@/lib/get-products';
import { LEAD_INTERESTS } from '@/lib/lead-intent';
import { normalizeBelarusPhone } from '@/lib/phone';

export const LEAD_NAME_MAX = 60;
export const LEAD_COMMENT_MAX = 500;

/** Тексты ошибок валидации; общие для формы и POST /api/lead. */
export const LEAD_MESSAGES = {
  nameRequired: 'Напишите, как к вам обращаться',
  nameTooLong: 'Имя не длиннее 60 символов',
  phoneRequired: 'Укажите телефон — по нему перезвонит менеджер',
  phoneInvalid: 'Введите номер в формате +375 29 123-45-67',
  interestInvalid: 'Выберите, что вас интересует',
  commentTooLong: 'Комментарий не длиннее 500 символов',
  productInvalid: 'Выбранный товар не найден',
} as const;

/** Поля заявки в порядке формы. */
export const LEAD_FIELDS = ['name', 'phone', 'interest', 'comment', 'productId'] as const;
export type LeadField = (typeof LEAD_FIELDS)[number];

/** Схема заявки (см. Algorithms / leadSchema). Тип НЕ аннотируется вручную: задача 07 вызовет `.extend`. */
export const leadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { error: LEAD_MESSAGES.nameRequired })
    .max(LEAD_NAME_MAX, { error: LEAD_MESSAGES.nameTooLong }),
  phone: z.string().transform((value, ctx) => {
    if (value.trim() === '') {
      ctx.addIssue({ code: 'custom', message: LEAD_MESSAGES.phoneRequired });
      return z.NEVER;
    }
    const normalized = normalizeBelarusPhone(value);
    if (normalized === null) {
      ctx.addIssue({ code: 'custom', message: LEAD_MESSAGES.phoneInvalid });
      return z.NEVER;
    }
    return normalized;
  }),
  interest: z.enum(LEAD_INTERESTS, { error: LEAD_MESSAGES.interestInvalid }),
  comment: z
    .string()
    .trim()
    .max(LEAD_COMMENT_MAX, { error: LEAD_MESSAGES.commentTooLong })
    .default(''),
  productId: z
    .string()
    .refine((id) => getProductById(id) !== undefined, { error: LEAD_MESSAGES.productInvalid })
    .optional(),
});

/** Значения формы до валидации. */
export type LeadFormValues = z.input<typeof leadSchema>;
/** Проверенная заявка: телефон '+375XXXXXXXXX', строки обрезаны, comment по умолчанию ''. */
export type Lead = z.output<typeof leadSchema>;

/** Тело ответа POST /api/lead (контракт для задачи 06). */
export type LeadApiResponse =
  | { status: 'ok'; id: string }
  | { status: 'duplicate' }
  | { status: 'invalid'; fieldErrors: Partial<Record<LeadField, string>> }
  | { status: 'error'; message: string };
