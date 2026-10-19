# Задача 1.3: Удалить остаточные тестовые файлы

## Проверки

| Команда | Ожидание | Exit code | Результат |
|---------|----------|-----------|-----------|
| `test ! -e src/lib/phone.test.ts -a ! -e src/lib/lead-schema.test.ts -a ! -e src/lib/submit-lead.test.ts` | passes | 0 | pass |
| `pnpm test --passWithNoTests` | passes | 0 | pass |

## Результат
Все команды выполнены успешно. Тестовые файлы `src/lib/phone.test.ts`, `src/lib/lead-schema.test.ts` и `src/lib/submit-lead.test.ts` удалены, и запуск тестов проходит без ошибок.
