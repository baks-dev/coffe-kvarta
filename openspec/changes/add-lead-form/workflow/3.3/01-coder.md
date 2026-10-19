# Отчет по задаче 3.3 [code]: Реализация leadSchema

## Что было сделано

Реализована схема валидации `leadSchema` в файле `src/lib/lead-schema.ts` согласно разделу «Algorithms / leadSchema» документа `design.md`.

### Шаги реализации

**Шаг 1 (Импорты):** Добавлены импорты `getProductById` из `@/lib/get-products` и `normalizeBelarusPhone` из `@/lib/phone`.

**Шаг 2 (Поле name):** Реализовано валидационное правило:
```ts
name: z.string().trim().min(1, { error: LEAD_MESSAGES.nameRequired }).max(LEAD_NAME_MAX, { error: LEAD_MESSAGES.nameTooLong })
```
- Обрезка пробелов через `.trim()`
- Минимальная длина 1 символ с сообщением `nameRequired`
- Максимальная длина 60 символов с сообщением `nameTooLong`

**Шаг 3 (Поле phone):** Реализована трансформация с валидацией:
```ts
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
})
```
- Если значение пустое или состоит из пробелов → ошибка `phoneRequired`
- Если `normalizeBelarusPhone` возвращает `null` → ошибка `phoneInvalid`
- Иначе возвращается нормализованный номер

**Шаг 4 (Поле interest):** Реализовано перечисление:
```ts
interest: z.enum(LEAD_INTERESTS, { error: LEAD_MESSAGES.interestInvalid })
```

**Шаг 5 (Поле comment):** Реализовано с ограничением длины:
```ts
comment: z.string().trim().max(LEAD_COMMENT_MAX, { error: LEAD_MESSAGES.commentTooLong }).default('')
```
- Обрезка пробелов через `.trim()`
- Максимальная длина 500 символов
- Значение по умолчанию `''`

**Шаг 6 (Поле productId):** Реализована проверка через `refine`:
```ts
productId: z.string().refine((id) => getProductById(id) !== undefined, { error: LEAD_MESSAGES.productInvalid }).optional()
```

## Результаты проверки

| Команда | Результат |
|---------|-----------|
| `pnpm test src/lib/lead-schema.test.ts` | **18 тестов прошли** |
| `pnpm test src/lib/phone.test.ts` | **9 тестов прошли** |
| `pnpm typecheck` | **Успешно** |
| `pnpm exec eslint src/lib/lead-schema.ts --max-warnings 0` | **Успешно** |
| `pnpm exec prettier --check src/lib/lead-schema.ts src/lib/lead-schema.test.ts` | **Успешно** |

## Файлы

- **src/lib/lead-schema.ts** — изменен: реализована схема `leadSchema` по алгоритму из `design.md`

## Замечаний

Замечаний нет. Все тесты проходят успешно.
