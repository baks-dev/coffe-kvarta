# 01. Инициализация проекта

**Приоритет:** P0 · **Оценка:** 30 мин

## Цель
Рабочий каркас Next.js, который деплоится и проходит линтеры.

## Решения из исследования
Next.js App Router, TypeScript strict, Tailwind CSS, pnpm, absolute imports `@/`, MIT License, GitHub Flow.

## Подзадачи
- [ ] `pnpm create next-app` (App Router, TS, Tailwind, ESLint, `src/`, alias `@/*`)
- [ ] `tsconfig`: `strict: true`
- [ ] Prettier + `eslint-config-next`, скрипты `lint`, `typecheck`
- [ ] Структура: `src/app`, `src/components`, `src/lib`, `src/data`
- [ ] `LICENSE` (MIT), `.env.example`
- [ ] `.github/dependabot.yml` (npm, weekly)
- [ ] Первый коммит каркаса (коммиты по шагам — требование ТЗ)

## Критерии приёмки
- `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck` проходят без ошибок.
