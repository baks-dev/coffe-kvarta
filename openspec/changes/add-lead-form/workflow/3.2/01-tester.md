# Отчёт тестировщика: задача 3.2 [test]

## Обзор

Написаны тесты для `leadSchema` в файле `src/lib/lead-schema.test.ts`. Тесты покрывают все 17 сценариев из задачи:

| Сценарий | Тест | Что проверяется |
|----------|------|-----------------|
| Notations of one number | `normalizes phone values to +375291234567` | 10 значений телефона нормализуются в `+375291234567` |
| Empty phone | `rejects empty or whitespace-only phone with phoneRequired message` | Пустые/пробельные телефоны отклоняются с `LEAD_MESSAGES.phoneRequired` |
| Landline number | `rejects landline numbers with phoneInvalid message` | Стационарные номера отклоняются с `LEAD_MESSAGES.phoneInvalid` |
| Wrong digit count | `rejects numbers with wrong digit count with phoneInvalid message` | Неправильное количество цифр отклоняется с `LEAD_MESSAGES.phoneInvalid` |
| Foreign number | `rejects foreign numbers with phoneInvalid message` | Иностранные номера отклоняются с `LEAD_MESSAGES.phoneInvalid` |
| Forbidden characters | `rejects phone values with forbidden characters with phoneInvalid message` | Запрещённые символы в телефоне отклоняются с `LEAD_MESSAGES.phoneInvalid` |
| Empty name | `rejects empty or whitespace-only name with nameRequired message` | Пустые/пробельные имена отклоняются с `LEAD_MESSAGES.nameRequired` |
| Name of 60 characters | `accepts name with exactly 60 characters` | Имя из 60 символов принимается |
| Name of 61 characters | `rejects name with 61 characters with nameTooLong message` | Имя из 61 символа отклоняется с `LEAD_MESSAGES.nameTooLong` |
| Comment of 500 characters | `accepts comment with exactly 500 characters` | Комментарий из 500 символов принимается |
| Comment of 501 characters | `rejects comment with 501 characters with commentTooLong message` | Комментарий из 501 символа отклоняется с `LEAD_MESSAGES.commentTooLong` |
| Comment omitted | `defaults comment to empty string when omitted` | Отсутствующий комментарий по умолчанию `''` |
| Unknown interest | `rejects unknown interest with interestInvalid message` | Неизвестный interest отклоняется с `LEAD_MESSAGES.interestInvalid` |
| Unknown product id | `rejects unknown product id with productInvalid message` | Неизвестный productId отклоняется с `LEAD_MESSAGES.productInvalid` |
| Valid product id | `accepts valid product id` | Известный productId (`colombia`) принимается |
| Extra keys are dropped | `drops extra keys from parsed data` | Лишние ключи (например, `isAdmin`) удаляются |
| Request body with product | `produces correct JSON for request with product` | JSON-тело запроса с продуктом совпадает с ожидаемым |
| Request body without product | `produces correct JSON for request without product` | JSON-тело запроса без продукта совпадает с ожидаемым |

## Результаты команд

| Команда | Результат |
|---------|-----------|
| `pnpm typecheck` | ✓ Проходит |
| `pnpm exec eslint src/lib/lead-schema.test.ts --max-warnings 0` | ✓ Проходит |
| `pnpm test src/lib/lead-schema.test.ts` | ✗ Падает (13 неудач, 5 успехов) |

Тесты падают из-за того, что `leadSchema` в текущей реализации (task 3.1 — skeleton) не содержит логики валидации:
- phone: строка без нормализации и проверки через `normalizeBelarusPhone`
- name: без `trim()`, `min(1)` и `max(60)`
- comment: без `trim()` и `max(500)`
- interest: без пользовательского сообщения об ошибке
- productId: без проверки через `getProductById`

Это ожидаемое поведение для тестов перед реализацией (task 3.2 — test, task 3.3 — code).

## Артефакты

| Путь | Действие | Причина |
|------|----------|---------|
| `src/lib/lead-schema.test.ts` | Created | Новый файл с тестами для `leadSchema` |

## Примечания

- Все тесты включают маркер `// @scenario: <название сценария>` перед соответствующим `it(...)`, как требует Conventions в design.md.
- Ожидаемые значения взяты строго из задачи и сценариев в spec.md.
- Тесты детерминированы: нет реальных сетевых вызовов, времени, случайных чисел или сонов.
