# Задача 3.1 [stub]: Создать скелет src/lib/lead-schema.ts

## Выполнение шагов

### Шаг 1: Импорты
Создан файл `src/lib/lead-schema.ts` с импортами:
- `z` из `zod`
- `LEAD_INTERESTS` из `@/lib/lead-intent`

### Шаг 2: Экспорт констант и типов
Экспортированы следующие элементы из контракта (`design.md`, раздел `src/lib/lead-schema.ts`):
- `LEAD_NAME_MAX` — константа 60
- `LEAD_COMMENT_MAX` — константа 500
- `LEAD_MESSAGES` — объект с текстами ошибок
- `LEAD_FIELDS` — массив полей
- `LeadField` — тип из массива полей
- `leadSchema` — заглушка схемы (см. шаг 3)
- `LeadFormValues` — тип zod input
- `Lead` — тип zod output
- `LeadApiResponse` — тип ответа API

Для всех экспортируемых элементов добавлены JSDoc-комментарии на русском языке, как требует конвенция проекта.

### Шаг 3: Placeholder schema
Создана заглушка схемы:
```ts
export const leadSchema = z.object({ name: z.string(), phone: z.string(), interest: z.enum(LEAD_INTERESTS), comment: z.string().default(''), productId: z.string().optional() });
```
Тело содержит только валидацию типов без логики валидации (реализуется в задаче 3.3).

## Результаты проверки

### `pnpm typecheck`
✓ Прошел успешно. Сгенерированы типы маршрутов, ошибок TypeScript не обнаружено.

### `pnpm exec eslint src/lib/lead-schema.ts --max-warnings 0`
✓ Прошел успешно. Нарушений ESLint нет.

## Artifacts
- `src/lib/lead-schema.ts` — создан файл со всеми экспортируемыми элементами, отформатирован с помощью Prettier

## Примечания
- Никаких вопросов или блокировок не возникло.
- Все элементы взяты дословно из контракта (`design.md`).
- Заглушка схемы соответствует описанию в шаге 3 задачи (без проверок, без `getProductById` и `normalizeBelarusPhone` — они добавляются в задаче 3.3).
