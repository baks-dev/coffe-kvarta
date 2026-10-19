# Проверка 2.2 — Тесты для `normalizeBelarusPhone` и `formatBelarusPhone`

**Задача**: 2.2 [test] Write unit tests for `normalizeBelarusPhone` and `formatBelarusPhone`

## Результаты проверок

| Команда | Ожидание | Код выхода | Результат |
|---------|----------|-----------|-----------|
| `pnpm typecheck` | compiles (0) | 0 | ✓ Проходит |
| `pnpm exec eslint src/lib/phone.test.ts --max-warnings 0` | passes (0) | 0 | ✓ Проходит |
| `pnpm test src/lib/phone.test.ts` | fails (non-zero) | 1 | ✓ Падает на stub (29 тестов) |

## Детали выполнения тестов

**Тест `pnpm test src/lib/phone.test.ts`**: Успешно собрался, выполнил 29 тестов, все из которых упали с ожидаемой ошибкой `Error: not implemented`. Тесты проверяют stub-реализации функций `normalizeBelarusPhone` и `formatBelarusPhone` из файла `src/lib/phone.ts`.

Статус: **pass** — все критерии выполнены верно.
