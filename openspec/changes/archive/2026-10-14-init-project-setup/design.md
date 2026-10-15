# Design

## Context

Мотивация описана в proposal.md (раздел Why), требования — в `specs/dev-workflow/spec.md`. Здесь только ограничения, которые влияют на способ реализации.

- Репозиторий **не пустой**: в нём уже есть `README.md`, `.gitignore`, `openspec/`, `tasks/`, `images/`, `sessions/`, `.agents/`, `.claude/`. `create-next-app` откажется генерировать проект в каталоге с посторонними файлами, а его `README.md` и `.gitignore` затёрли бы существующие.
- Окружение на 2026-10-14: Node 24.20, pnpm 12.4, последняя стабильная версия `next` — 16.4.0.
- В Next.js 16 команда `next lint` удалена. ESLint работает через flat config (`eslint.config.mjs`), Turbopack используется по умолчанию в `dev` и `build`, Tailwind CSS v4 настраивается в CSS (`@import "tailwindcss"`) без `tailwind.config.js`.
- `tasks/plans/01-project-setup-plan.md` написан под более старый стек (`.eslintrc.json`, `next lint`, `next.config.js`). Там, где план расходится с текущими версиями, этот дизайн имеет приоритет.
- В текущем `.gitignore` уже есть шаблоны `.env`, `.env.local`, `.env.*.local`, `node_modules/` и `.next/`; `.env.example` под них не попадает.

## Goals / Non-Goals

**Goals:**
- Каркас на текущих стабильных версиях без устаревших API: позже не придётся мигрировать.
- Генерация проекта не трогает существующие файлы репозитория.
- Скрипты `package.json` — единственная точка входа, которую позже вызовет CI (задача 12).

**Non-Goals:**
- Удаление стартовой страницы create-next-app: её заменит задача 04. Здесь чистим только демо-ассеты, которые мешают линтеру или не нужны.
- Шрифты, цвета и токены (задача 02), тестовый раннер (задача 11), GitHub Actions и Vercel (задача 12).
- Husky, lint-staged и прочие pre-commit-хуки.

## Decisions

### D1. Генерация во временный каталог с последующим переносом
`pnpm create next-app@latest` запускается во временном каталоге вне репозитория с флагами `--ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --skip-install --disable-git --yes`. Затем в корень репозитория переносятся всё, кроме `README.md` и `.gitignore`. Строки из сгенерированного `.gitignore`, которых нет в существующем (`next-env.d.ts`, `*.tsbuildinfo`, `.vercel`), дописываются вручную.
- *Альтернатива:* генерация прямо в корень — `create-next-app` прервётся на непустом каталоге.
- *Альтернатива:* ручная сборка `package.json` — дольше, и легко пропустить детали конфигурации (`next-env.d.ts`, плагин TS в `tsconfig`).

### D2. Next.js 16 с конфигурацией по умолчанию: Turbopack, `next.config.ts`
Оставляем то, что генерирует актуальный шаблон, включая Turbopack. Версия `next` фиксируется lock-файлом, а `packageManager` закрепляет pnpm (`pnpm@12.4.1`).
- *Альтернатива:* отключить Turbopack «для стабильности», как в плане. В Next 16 это уже основной сборщик, а переход на webpack потребует флагов в каждой команде без явной пользы.

### D3. Линт через ESLint CLI с flat config
`"lint": "eslint ."` и `eslint.config.mjs` с пресетами `eslint-config-next` (`core-web-vitals`, `typescript`) плюс `eslint-config-prettier` последним. Он отключает стилистические правила, которые конфликтуют с Prettier. Игнорируются `.next/`, `node_modules/`, `next-env.d.ts`, `openspec/`, `.agents/`.
- *Альтернатива:* `next lint` — в Next 16 его нет.
- *Альтернатива:* `eslint-plugin-prettier` (Prettier как правило ESLint) — линт медленнее, а ошибки форматирования смешиваются с логическими. Проверку формата выносим в `format:check`.

### D4. Строгий TypeScript и отдельная проверка типов
`tsconfig.json`: `strict: true` (включает `noImplicitAny`) плюс `noUncheckedIndexedAccess`, `noFallthroughCasesInSwitch` и `noImplicitReturns`. На этапе каркаса это бесплатно, а включать их позже уже дорого.
`"typecheck": "next typegen && tsc --noEmit"`: `next typegen` создаёт типы маршрутов (`.next/types`), на которые ссылается `tsconfig`. Без этого `tsc` на чистом клоне выдаёт ложные ошибки.
- *Альтернатива:* полагаться только на проверку типов внутри `next build`. Это медленно, и CI не сможет запускать линт, типы и сборку как отдельные шаги.

### D5. Prettier с минимальной конфигурацией
`.prettierrc.json`: `singleQuote: true`, `semi: true`, `trailingComma: "all"`, `printWidth: 100`. В `.prettierignore` попадают `.next`, `pnpm-lock.yaml`, `openspec`, `tasks`, `sessions` и `.agents`: документацию и сгенерированные файлы не переформатируем. Скрипты: `"format": "prettier --write ."` и `"format:check": "prettier --check ."`. Плагин сортировки классов Tailwind откладываем до задачи 02.

### D6. Структура каталогов
`src/app` создаёт генератор, а `src/components`, `src/lib` и `src/data` создаём с файлом `.gitkeep`: git не хранит пустые каталоги. Когда в каталоге появится первый модуль, `.gitkeep` удаляется. Для проверки алиаса в `src/lib` сразу кладём реальный модуль: `src/lib/site.ts` с названием и базовым URL сайта (на чтении `NEXT_PUBLIC_SITE_URL` с fallback на `http://localhost:3000`). Его использует `metadata` в `layout.tsx`. Тестовый компонент, который потом пришлось бы удалять, не нужен.

### D7. `.env.example`: только объявленные заранее переменные
Включаем переменные, которые уже известны из декомпозиции, с пустыми значениями и комментарием о задаче, где они понадобятся: `NEXT_PUBLIC_SITE_URL` (01/09), `KV_REST_API_URL` и `KV_REST_API_TOKEN` (06, Upstash), `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` (08), `NEXT_PUBLIC_GA_ID` и `NEXT_PUBLIC_YM_ID` (09). Каркас не требует ни одной из них: требование «работает без `.env`».

### D8. Dependabot
`version: 2`, один блок `npm` для `/` с `interval: weekly`, `open-pull-requests-limit: 5` и группировкой minor/patch-обновлений в один PR. Поле `reviewers` из плана не используем: GitHub объявил его устаревшим в пользу `CODEOWNERS`. Блок для `github-actions` добавит задача 12, когда появятся workflow.

### D9. Лицензия
Стандартный текст MIT, `Copyright (c) 2026 MichelAngelo` (имя автора из `git config user.name`). Правообладателя можно поменять одной строкой, требования это не затрагивает.

### D10. Коммиты по шагам в отдельной ветке
По GitHub Flow работа идёт в ветке `chore/project-setup` и сливается в `master`. Минимальная нарезка коммитов: (1) генерация Next.js, (2) strict TS и скрипты, (3) Prettier и ESLint, (4) структура `src/` и алиас, (5) LICENSE и `.env.example`, (6) Dependabot, (7) README. Каждый коммит должен проходить `pnpm lint && pnpm typecheck`, чтобы история оставалась рабочей на любом шаге.

## Risks / Trade-offs

- **[Риск] pnpm ≥10 по умолчанию блокирует postinstall-скрипты зависимостей (`sharp`, `unrs-resolver`)**, и сборка падает или пишет предупреждения. → Явно разрешить их через `pnpm approve-builds` или `onlyBuiltDependencies` в `pnpm-workspace.yaml` и проверить на чистой установке.
- **[Риск] Предупреждения о совместимости peer-зависимостей `eslint-config-next` и ESLint 9/10.** → Брать версию `eslint-config-next`, совпадающую с `next`, и версию `eslint` из шаблона, без ручного повышения.
- **[Риск] `prettier --check .` упадёт на сгенерированных файлах шаблона, которые не соответствуют нашим правилам.** → Один раз выполнить `pnpm format` в коммите (3) — дальше проверка проходит.
- **[Компромисс] `noUncheckedIndexedAccess` добавляет проверки `undefined` при доступе к массивам из `src/data`.** → Это осознанная плата за безопасность. Если флаг заметно замедлит задачи 03–04, его можно отключить без изменения спецификации.
- **[Риск] Порт 3000 занят при проверке `pnpm dev`/`pnpm start`.** → Проверять с `PORT=3100` или освободить порт; на требование это не влияет.

## Migration Plan

Проект новый, миграции данных нет. Откат: ветка `chore/project-setup` не сливается или откатывается `git revert` merge-коммита. Изменения ограничены новыми файлами и правкой `.gitignore`/`README.md`.
