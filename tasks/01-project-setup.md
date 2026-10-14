# 01. Инициализация проекта

**Приоритет:** P0 · **Оценка:** 30 мин

## Цель
Рабочий каркас Next.js, который деплоится и проходит линтеры.

## Решения из исследования
Next.js App Router, TypeScript strict, Tailwind CSS, pnpm, absolute imports `@/`, MIT License, GitHub Flow.

## Подзадачи
- [x] `pnpm create next-app` (App Router, TS, Tailwind, ESLint, `src/`, alias `@/*`)
- [x] `tsconfig`: `strict: true`
- [x] Prettier + `eslint-config-next`, скрипты `lint`, `typecheck`
- [x] Структура: `src/app`, `src/components`, `src/lib`, `src/data`
- [x] `LICENSE` (MIT), `.env.example`
- [x] `.github/dependabot.yml` (npm, weekly)
- [x] Первый коммит каркаса (коммиты по шагам — требование ТЗ)

## Критерии приёмки
- [x] `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck` проходят без ошибок.
