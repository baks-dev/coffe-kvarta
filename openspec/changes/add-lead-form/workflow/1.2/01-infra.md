# Отчёт по задаче 1.2 [infra]: Замена vitest.config.ts на vitest.config.mts

## Выполненные шаги

### Шаг 1: Удаление vitest.config.ts
Файл `vitest.config.ts` удалён.

### Шаг 2: Создание vitest.config.mts
Создан файл `vitest.config.mts` с точным кодом из контракта:

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

## Изменения в файлах

| Путь | Действие |
|------|----------|
| `vitest.config.ts` | удалён |
| `vitest.config.mts` | создан |

## Результат проверок

### Проверка удаления vitest.config.ts
Команда `test ! -e vitest.config.ts` — прошла (код выхода 0).

### Проверка eslint
Команда `pnpm exec eslint vitest.config.mts --max-warnings 0` — прошла (код выхода 0).

### Проверка prettier
Команда `pnpm exec prettier --check vitest.config.mts` — прошла (код выхода 0).

## Заключение
Задача выполнена успешно. Все проверки пройдены.
