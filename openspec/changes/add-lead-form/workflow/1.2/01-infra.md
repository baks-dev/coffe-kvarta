# Инфраструктура: замена vitest.config.ts на vitest.config.mts

## Выполнение шагов

### Шаг 1: Удаление vitest.config.ts
Файл `vitest.config.ts` не существует в проекте — удаление не требуется.

### Шаг 2: Создание vitest.config.mts
Файл `vitest.config.mts` уже существует и содержит требуемое содержимое:

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
```

Код взят дословно из контракта design.md (секция «Contracts / vitest.config.mts»).

## Результаты проверок из «Done when»

1. `test ! -e vitest.config.ts` — **PASS**: файл не существует
2. `pnpm exec eslint vitest.config.mts --max-warnings 0` — **PASS**: ошибок ESLint нет
3. `pnpm exec prettier --check vitest.config.mts` — **PASS**: форматирование соответствует стандартам

## Изменённые файлы

Файлы не изменены — `vitest.config.ts` не существует, `vitest.config.mts` уже содержит корректное содержимое.

## Вывод

Задача 1.2 выполнена. Файл `vitest.config.ts` отсутствует, `vitest.config.mts` существует с корректным содержимым. Все проверки из «Done when» прошли успешно.
