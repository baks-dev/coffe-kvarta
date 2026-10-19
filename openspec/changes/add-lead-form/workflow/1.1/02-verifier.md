# Верификация задачи 1.1 [infra] Install the form and test dependencies

## Результаты проверки команд

| Команда | Ожидание | Код выхода | Результат |
|---------|----------|------------|-----------|
| `pnpm ls react-hook-form @hookform/resolvers --depth 0` | passes | 0 | ✅ Успешно |
| `pnpm ls -D jsdom @testing-library/react @testing-library/dom @testing-library/user-event vitest --depth 0` | passes | 0 | ✅ Успешно |

## Вывод команд

### Команда 1: `pnpm ls react-hook-form @hookform/resolvers --depth 0`

```
Legend: production dependency, optional only, dev only

app@0.1.0 /mnt/1TB/HTML/coffe-kvarta (PRIVATE)
│
│   dependencies:
├── @hookform/resolvers@5.9.2
└── react-hook-form@7.90.0

2 packages
```

**Проверка соответствия версиям:**
- `react-hook-form@7.90.0` ✅ соответствует ожиданию `react-hook-form 7.90.0`
- `@hookform/resolvers@5.9.2` ✅ соответствует ожиданию `@hookform/resolvers 5.9.2`

### Команда 2: `pnpm ls -D jsdom @testing-library/react @testing-library/dom @testing-library/user-event vitest --depth 0`

```
Legend: production dependency, optional only, dev only

app@0.1.0 /mnt/1TB/HTML/coffe-kvarta (PRIVATE)
│
│   devDependencies:
├── @testing-library/dom@10.4.2
├── @testing-library/react@16.3.3
├── @testing-library/user-event@14.6.8
├── jsdom@30.1.3
└── vitest@5.0.5

5 packages
```

**Проверка соответствия версиям:**
- `jsdom@30.1.3` ✅ соответствует ожиданию `jsdom 30.1.3`
- `@testing-library/react@16.3.3` ✅ соответствует ожиданию `@testing-library/react 16.3.3`
- `@testing-library/dom@10.4.2` ✅ соответствует ожиданию `@testing-library/dom 10.4.2`
- `@testing-library/user-event@14.6.8` ✅ соответствует ожиданию `@testing-library/user-event 14.6.8`
- `vitest@5.0.5` ✅ соответствует ожиданию `vitest 5.0.5`

## Ручная проверка

Manual: the first command lists `react-hook-form 7.90.0` and `@hookform/resolvers 5.9.2` under `dependencies`; the second lists `jsdom 30.1.3`, `@testing-library/react 16.3.3`, `@testing-library/dom 10.4.2`, `@testing-library/user-event 14.6.8`, `vitest 5.0.5` under `devDependencies`.

**Проверка выполнена успешно:**
- Все ожидаемые пакеты присутствуют в правильных секциях (`dependencies` или `devDependencies`)
- Все версии соответствуют требованиям

## Вывод

Обе команды из критерия "Done when" выполнились успешно, выходные данные содержат все ожидаемые пакеты с правильными версиями. Задача 1.1 выполнена корректно.

**Status:** ✅ PASS
