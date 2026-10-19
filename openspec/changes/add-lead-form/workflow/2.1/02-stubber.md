# Отчет стоббера: задача 2.1 [stub] — Create the `src/lib/phone.ts` skeleton

## Выполненные шаги

### Шаг 1: Замена всего содержимого файла
Файл `src/lib/phone.ts` создан полностью с нуля.

### Шаг 2: Экспорт `BELARUS_MOBILE_CODES`
Добавлен константа с JSDoc из контракта:
```ts
/** Коды мобильных операторов Беларуси. */
export const BELARUS_MOBILE_CODES = ['25', '29', '33', '44'] as const;
```

### Шаг 3: Экспорт функций-заглушек
Созданы заглушки для функций с JSDoc из контракта и телами, выбрасывающими исключение:
```ts
/**
 * Любая допустимая запись белорусского мобильного → '+375XXXXXXXXX'; иначе null.
 * Не бросает исключений.
 */
export function normalizeBelarusPhone(input: string): string | null {
  void input;
  throw new Error('not implemented');
}

/**
 * Допустимая запись → '+375 XX XXX-XX-XX'; недопустимая возвращается без изменений.
 */
export function formatBelarusPhone(input: string): string {
  void input;
  throw new Error('not implemented');
}
```

### Шаг 4: Использование параметра `input` в заглушке
Во всех заглушках добавлено `void input;` перед `throw`, чтобы линтер не ругался на неиспользуемую переменную.

### Шаг 5: Форматирование
Файл отформатирован с помощью `pnpm exec prettier --write src/lib/phone.ts`.

## Результаты проверки "Done when"

| Команда | Результат |
|---------|-----------|
| `pnpm typecheck` | ✅ Прошел успешно (типы сгенерированы) |
| `pnpm exec eslint src/lib/phone.ts --max-warnings 0` | ✅ Прошел успешно |

## Замечания
Замечания отсутствуют.

## Артефакты
- Создан: `src/lib/phone.ts`
