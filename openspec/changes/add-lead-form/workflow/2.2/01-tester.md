# Тест 2.2 — Тесты для `normalizeBelarusPhone` и `formatBelarusPhone`

**Задача**: Написать unit-тесты для модуля `src/lib/phone.ts`.

## Результаты шага 5 команд

| Команда | Результат |
|---------|-----------|
| `pnpm typecheck` | ✓ Проходит |
| `pnpm exec eslint src/lib/phone.test.ts --max-warnings 0` | ✓ Проходит |
| `pnpm test src/lib/phone.test.ts` | ✓ Падает на stub (29 тестов) |

## Покрытые сценарии

| Сценарий | Тест (файл, имя) | Что проверяется |
|----------|-------------------|-----------------|
| «Notations of one number» | `phone.test.ts` > `normalizeBelarusPhone - Notations of one number` | 10 различных нотаций одного номера нормализуются в `'+375291234567'` |
| «All operator codes» | `phone.test.ts` > `normalizeBelarusPhone - All operator codes` | Коды 25, 33, 44 нормализуются в `'+375257654321'`, `'+375334567890'`, `'+375449999999'` соответственно |
| «Empty phone» | `phone.test.ts` > `normalizeBelarusPhone - Empty phone` | Пустая строка и строка из пробелов возвращают `null` |
| «Landline number» | `phone.test.ts` > `normalizeBelarusPhone - Landline number` | Номера стационарной связи (17) возвращают `null` |
| «Wrong digit count» | `phone.test.ts` > `normalizeBelarusPhone - Wrong digit count` | Неверное количество цифр возвращает `null` |
| «Foreign number» | `phone.test.ts` > `normalizeBelarusPhone - Foreign number` | Номер с кодом страны, отличной от 375, возвращает `null` |
| «Forbidden characters» | `phone.test.ts` > `normalizeBelarusPhone - Forbidden characters` | Запрещённые символы возвращают `null` |
| «Valid number is reformatted» | `phone.test.ts` > `formatBelarusPhone - Valid number is reformatted` | Валидный номер форматируется в `'+375 29 123-45-67'`, и все нормализованные значения форматуются в этот же формат |
| «Invalid number is left as typed» | `phone.test.ts` > `formatBelarusPhone - Invalid number is left as typed` | Неверный номер остаётся без изменений |

## Замечания

Не было замечаний к исправлению.

## Артефакты

- Создан файл: `src/lib/phone.test.ts`
