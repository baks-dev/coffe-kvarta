# Инфраструктурная задача 1.3

## Удаление оставшихся файлов тестов

### Выполненные шаги

1. Удалён `src/lib/phone.test.ts`
2. Удалён `src/lib/lead-schema.test.ts`
3. `src/lib/submit-lead.test.ts` не существовал — пропущено
4. Проверка: `pnpm test --passWithNoTests` — прошло успешно (exit code 0)

### Результаты

- Все указанные тестовые файлы удалены
- `pnpm test --passWithNoTests` завершился с кодом 0
- Ни один другой файл в `package.json` не изменён

### Изменённые файлы

- `src/lib/phone.test.ts` — удалён
- `src/lib/lead-schema.test.ts` — удалён
- `src/lib/submit-lead.test.ts` — отсутствовал, не изменён
