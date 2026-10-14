# План выполнения задачи 01: Инициализация проекта

**Задача:** Рабочий каркас Next.js, который деплоится и проходит линтеры  
**Приоритет:** P0 · **Оценка:** 30 мин  
**Дата создания:** 2026-10-14

---

## Фаза 1: Создание базового проекта (5-7 мин)

### Шаг 1.1 — Инициализация Next.js приложения
```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --src-dir --import-alias '@/*' --no-git --app
```

**Параметры выбора в интерактивном режиме:**
- ✅ Would you like to use TypeScript? → **Yes**
- ✅ Would you like to use ESLint? → **Yes**
- ✅ Would you like to use Tailwind CSS? → **Yes**
- ✅ Would you like to use `src/` directory? → **Yes**
- ✅ Would you like to use App Router? → **Yes**
- ✅ Would you like to use Turbopack for `next dev`? → **No** (для стабильности)
- ✅ Import alias for `@/*`? → **Yes** (по умолчанию)
- ✅ Skip Git? → **Yes** (уже инициализирован)

**Проверка:**
```bash
ls -la src/
# Должны быть: app/, components/ (пусто)
pnpm list next typescript
```

**Чек-лист:**
- [ ] Структура создана: `src/app`, `src/components`
- [ ] `tsconfig.json` присутствует
- [ ] `next.config.js` присутствует
- [ ] `package.json` с версией Next.js и зависимостями

---

## Фаза 2: Настройка TypeScript (2-3 мин)

### Шаг 2.1 — Включить strict mode в tsconfig.json

**Открыть:** `tsconfig.json`

**Найти раздел `compilerOptions` и установить:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

**Проверка:**
```bash
pnpm typecheck
# Должна быть команда, которая запускается без ошибок (даже если выведет предупреждения)
```

**Чек-лист:**
- [ ] `"strict": true` установлен в `tsconfig.json`
- [ ] `pnpm typecheck` выполняется без критических ошибок

---

## Фаза 3: Установка Prettier и настройка линтеров (4-5 мин)

### Шаг 3.1 — Установить Prettier

```bash
pnpm add --save-dev prettier eslint-config-prettier
```

### Шаг 3.2 — Создать конфиг Prettier

**Создать файл:** `.prettierrc.json`
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Шаг 3.3 — Обновить ESLint конфиг

**Открыть:** `.eslintrc.json`

**Убедиться, что есть (или добавить):**
```json
{
  "extends": [
    "next/core-web-vitals",
    "prettier"
  ]
}
```

### Шаг 3.4 — Добавить скрипты в package.json

**Открыть:** `package.json`

**Добавить в раздел `"scripts"`:**
```json
"lint": "next lint",
"typecheck": "tsc --noEmit",
"format": "prettier --write ."
```

**Проверка:**
```bash
pnpm lint
pnpm typecheck
pnpm format
# Все должны выполниться без критических ошибок
```

**Чек-лист:**
- [ ] Prettier установлен
- [ ] `.prettierrc.json` создан и настроен
- [ ] ESLint расширен с `prettier` конфигом
- [ ] Скрипты `lint` и `typecheck` добавлены в `package.json`
- [ ] `pnpm lint` проходит успешно
- [ ] `pnpm typecheck` проходит успешно

---

## Фаза 4: Создание структуры директорий (2-3 мин)

### Шаг 4.1 — Создать необходимые директории

```bash
mkdir -p src/lib
mkdir -p src/data
```

**Структура после этого шага:**
```
src/
├── app/
├── components/
├── data/
├── lib/
```

### Шаг 4.2 — Добавить базовые файлы в компоненты

**Создать:** `src/components/.gitkeep` (для отслеживания пустой директории)
**Создать:** `src/lib/.gitkeep`
**Создать:** `src/data/.gitkeep`

**Проверка:**
```bash
tree src/
# или
find src -type f -o -type d | sort
```

**Чек-лист:**
- [ ] Директория `src/lib/` создана
- [ ] Директория `src/data/` создана
- [ ] Все директории видны в структуре проекта

---

## Фаза 5: Лицензия и переменные окружения (2 мин)

### Шаг 5.1 — Добавить MIT License

**Создать файл:** `LICENSE`
```
MIT License

Copyright (c) 2024-2026 Coffee Kvarta

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### Шаг 5.2 — Создать .env.example

**Создать файл:** `.env.example`
```
# Пример переменных окружения
# Скопируйте в .env.local и заполните значения

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=

# API endpoints (если потребуются)
# NEXT_PUBLIC_API_URL=

# Database (если потребуется)
# DATABASE_URL=
```

**Проверка:**
```bash
ls -la | grep -E "LICENSE|.env"
```

**Чек-лист:**
- [ ] Файл `LICENSE` создан с MIT лицензией
- [ ] Файл `.env.example` создан с примерами переменных

---

## Фаза 6: GitHub конфигурация (1-2 мин)

### Шаг 6.1 — Создать Dependabot конфиг

**Создать файл:** `.github/dependabot.yml`
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule:
      interval: weekly
      day: monday
      time: "03:00"
    open-pull-requests-limit: 10
    reviewers:
      - MichelAngelo
    labels:
      - dependencies
      - automation
```

**Проверка:**
```bash
cat .github/dependabot.yml
```

**Чек-лист:**
- [ ] Директория `.github/` создана
- [ ] Файл `dependabot.yml` создан и валиден

---

## Фаза 7: Финальная проверка и коммиты (3-4 мин)

### Шаг 7.1 — Полная проверка всех критериев

```bash
# Проверка dev сервера
pnpm dev &
# Открыть http://localhost:3000 в браузере
# Должна загружиться стартовая страница Next.js
# Закрыть: Ctrl+C

# Проверка сборки
pnpm build
# Должна пройти успешно без ошибок

# Проверка lint
pnpm lint
# Должна пройти без критических ошибок

# Проверка typecheck
pnpm typecheck
# Должна пройти успешно
```

**Чек-лист:**
- [ ] `pnpm dev` запускается и стартовая страница доступна
- [ ] `pnpm build` проходит успешно
- [ ] `pnpm lint` проходит без ошибок
- [ ] `pnpm typecheck` проходит без ошибок

### Шаг 7.2 — Коммиты по шагам (как требует ТЗ)

**Коммит 1: Базовая инициализация Next.js**
```bash
git add .
git commit -m "init: создать Next.js приложение с App Router, TypeScript и Tailwind CSS

- Инициализирована новая Next.js сборка с App Router
- Включена поддержка TypeScript со strict mode
- Настроен Tailwind CSS для стилизации
- Сконфигурирован ESLint и Prettier
- Добавлены скрипты для lint и typecheck
- Создана структура директорий (src/app, src/components, src/lib, src/data)
- Добавлена MIT лицензия
- Настроены переменные окружения в .env.example
- Сконфигурирован GitHub Dependabot для автоматического обновления зависимостей"
```

### Шаг 7.3 — Проверить git статус

```bash
git status
# Должна быть пустая рабочая директория
git log --oneline -5
# Должна отобразиться история коммитов
```

**Чек-лист:**
- [ ] Все файлы закоммичены
- [ ] Git статус чист (рабочая директория пуста)
- [ ] Коммит содержит детальное описание

---

## Критерии завершения задачи

✅ **Все нижеперечисленные пункты должны быть выполнены:**

1. ✅ `pnpm dev` запускается без ошибок, стартовая страница доступна на http://localhost:3000
2. ✅ `pnpm build` проходит успешно, артефакты в `.next/`
3. ✅ `pnpm lint` выполняется без критических ошибок
4. ✅ `pnpm typecheck` выполняется успешно
5. ✅ Структура директорий соответствует требованиям: `src/app`, `src/components`, `src/lib`, `src/data`
6. ✅ Файлы конфигурации присутствуют: `tsconfig.json`, `.eslintrc.json`, `.prettierrc.json`, `next.config.js`
7. ✅ Лицензия `LICENSE` добавлена (MIT)
8. ✅ `.env.example` создан с примерами переменных
9. ✅ `.github/dependabot.yml` сконфигурирован
10. ✅ Все изменения закоммичены с описанием

---

## Вспомогательные команды

```bash
# Список зависимостей
pnpm list

# Проверить версии основных пакетов
pnpm list next react react-dom typescript

# Проверить размер сборки
du -sh .next/

# Очистить node_modules и кэш (если понадобится)
pnpm clean
pnpm install

# Проверить скрипты в package.json
cat package.json | grep -A 10 '"scripts"'
```

---

## Возможные проблемы и решения

| Проблема | Решение |
|----------|---------|
| `pnpm create next-app` не найдена | Установить `pnpm` глобально: `npm install -g pnpm` |
| ESLint ошибки при `pnpm lint` | Запустить `pnpm format` для автоисправления |
| TypeScript ошибки | Проверить `tsconfig.json`, убедиться что `strict: true` |
| `pnpm build` fails | Проверить консоль на TypeScript ошибки, запустить `pnpm typecheck` |
| Port 3000 занят | Убить процесс: `lsof -ti:3000 \| xargs kill -9` или использовать другой port |

---

## Примечания

- **Коммиты по шагам** — требование ТЗ, поэтому выполнять коммит после каждого логического блока
- **Strict mode** — включен для максимальной надежности типизации
- **Prettier** — для консистентного кода стиля, интегрирован с ESLint
- **Dependabot** — будет автоматически проверять обновления каждый понедельник
- Все скрипты должны быть добавлены в `package.json` для облегченного доступа

---

**Ожидаемое время выполнения:** 30 мин  
**Статус:** ⏳ Ожидает выполнения
