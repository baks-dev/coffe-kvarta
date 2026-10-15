# Tasks

## 1. Генерация каркаса Next.js

- [x] 1.1 Создать ветку `chore/project-setup` от `master`; проверить `git branch --show-current`
- [x] 1.2 Сгенерировать проект во временном каталоге вне репозитория: `pnpm create next-app@latest <tmp>/app --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --skip-install --disable-git --yes`; проверить, что в `<tmp>/app` есть `package.json`, `src/app/page.tsx`, `next.config.ts`, `eslint.config.mjs`
- [x] 1.3 Перенести сгенерированные файлы в корень репозитория, кроме `README.md` и `.gitignore`; дописать в существующий `.gitignore` недостающие строки (`next-env.d.ts`, `*.tsbuildinfo`, `.vercel`); проверить через `git diff .gitignore`, что исходные правила не потеряны
- [x] 1.4 Указать в `package.json` поле `"packageManager": "pnpm@12.4.1"`, выполнить `pnpm install`, разрешить сборку нативных зависимостей (`pnpm approve-builds` / `onlyBuiltDependencies`); проверить, что `pnpm install --frozen-lockfile` на повторном запуске завершается с кодом 0 без предупреждений об игнорируемых build-скриптах
- [x] 1.5 Проверить запуск: `pnpm dev` → `curl -sI http://localhost:3000/` возвращает `200`; закоммитить «Сгенерировать каркас Next.js 16 (App Router, TS, Tailwind)»

## 2. Строгий TypeScript и проверка типов

- [x] 2.1 В `tsconfig.json` подтвердить `"strict": true` и добавить `noUncheckedIndexedAccess`, `noImplicitReturns`, `noFallthroughCasesInSwitch`; проверить, что алиас `"@/*": ["./src/*"]` на месте
- [x] 2.2 Добавить скрипт `"typecheck": "next typegen && tsc --noEmit"`; проверить, что `pnpm typecheck` проходит с кодом 0 и `git status` не показывает новых отслеживаемых файлов
- [x] 2.3 Проверить негативный сценарий: временно добавить в `src/lib` функцию с нетипизированным параметром, убедиться, что `pnpm typecheck` падает с ошибкой `implicitly has an 'any' type`, затем удалить её; закоммитить «Включить strict-режим TypeScript и скрипт typecheck»

## 3. Линтер и форматирование

- [x] 3.1 Установить `prettier` и `eslint-config-prettier` (`pnpm add -D`); проверить, что они появились в `devDependencies`
- [x] 3.2 Настроить `eslint.config.mjs`: пресеты `next/core-web-vitals` и `next/typescript`, последним `eslint-config-prettier`; добавить в ignores `.next/`, `next-env.d.ts`, `openspec/`, `.agents/`; задать скрипт `"lint": "eslint ."`; проверить, что `pnpm lint` завершается с кодом 0
- [x] 3.3 Проверить негативный сценарий: временно вставить `<img src="/x.png" alt="" />` в `src/app/page.tsx`, убедиться, что `pnpm lint` сообщает `@next/next/no-img-element`, откатить изменение
- [x] 3.4 Создать `.prettierrc.json` (`singleQuote`, `semi`, `trailingComma: "all"`, `printWidth: 100`) и `.prettierignore` (`.next`, `pnpm-lock.yaml`, `openspec`, `tasks`, `sessions`, `.agents`, `.claude`); добавить скрипты `format` и `format:check`
- [x] 3.5 Выполнить `pnpm format`, затем проверить, что `pnpm format:check` и `pnpm lint` оба проходят с кодом 0; закоммитить «Добавить Prettier и настроить ESLint flat config»

## 4. Структура исходников и абсолютные импорты

- [x] 4.1 Создать `src/components/.gitkeep` и `src/data/.gitkeep`; проверить через `git ls-files src`, что после `git add` каталоги отслеживаются
- [x] 4.2 Создать `src/lib/site.ts` (название сайта и `siteUrl` из `NEXT_PUBLIC_SITE_URL` с fallback `http://localhost:3000`) и подключить его в `src/app/layout.tsx` через `import { ... } from '@/lib/site'` для `metadata` (`title`, `metadataBase`); удалить из `public/` неиспользуемые демо-SVG шаблона
- [x] 4.3 Проверить алиас и отсутствие обязательных env: без `.env*` файлов выполнить `pnpm typecheck && pnpm lint && pnpm build`, все с кодом 0; закоммитить «Создать структуру src/ и модуль site через алиас @/»

## 5. Метаданные репозитория

- [x] 5.1 Добавить `LICENSE` со стандартным текстом MIT и строкой `Copyright (c) 2026 MichelAngelo`; проверить `head -3 LICENSE`
- [x] 5.2 Добавить `.env.example` с пустыми переменными и комментариями о том, какой задаче они нужны: `NEXT_PUBLIC_SITE_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_YM_ID`
- [x] 5.3 Проверить игнорирование: создать пустой `.env.local`, убедиться, что `git check-ignore .env.local` его находит, а `git check-ignore .env.example` — нет; удалить `.env.local`; закоммитить «Добавить лицензию MIT и шаблон .env.example»

## 6. Dependabot

- [x] 6.1 Создать `.github/dependabot.yml`: `version: 2`, `package-ecosystem: npm`, `directory: "/"`, `schedule.interval: weekly`, `open-pull-requests-limit: 5`, группа `minor-and-patch` (`update-types: [minor, patch]`), без поля `reviewers`; проверить синтаксис командой `pnpm dlx yaml-lint .github/dependabot.yml` (или `python3 -c "import yaml,sys;yaml.safe_load(open(sys.argv[1]))" .github/dependabot.yml`); закоммитить «Настроить Dependabot для npm (еженедельно)»

## 7. Документация

- [x] 7.1 Дополнить `README.md` разделом «Разработка»: требования (Node 24+, pnpm 12 через `corepack enable`), установка, таблица команд (`dev`, `build`, `start`, `lint`, `typecheck`, `format`, `format:check`), структура `src/`, ссылка на `.env.example`; проверить, что команды из README выполняются как написано; закоммитить «Описать запуск и команды в README»

## 8. Итоговая проверка

- [x] 8.1 На чистом клоне ветки (`git clone -b chore/project-setup . <tmp>/verify`) выполнить `pnpm install --frozen-lockfile && pnpm lint && pnpm typecheck && pnpm format:check && pnpm build`; все команды завершаются с кодом 0
- [x] 8.2 В том же клоне выполнить `pnpm start` и проверить, что `curl -sI http://localhost:3000/` возвращает `200`; убедиться, что `git status` в рабочем репозитории чист и каждый коммит ветки проходит `pnpm lint && pnpm typecheck` (`git rebase --exec "pnpm lint && pnpm typecheck" master`)
- [x] 8.3 Отметить подзадачи и критерии приёмки в `tasks/01-project-setup.md` выполненными; открыть PR `chore/project-setup` → `master`
