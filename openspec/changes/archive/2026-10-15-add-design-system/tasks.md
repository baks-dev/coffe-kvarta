# Tasks

## 1. Подготовка shadcn/ui и зависимостей

- [x] 1.1 Выполнить `pnpm dlx shadcn@latest init` (Tailwind v4, `src/app/globals.css`, алиасы `@/components`, `@/lib/utils`). Если CLI не распознаёт Tailwind из-за Turbopack-loader, создать `components.json` вручную. Проверка: в корне есть `components.json`, `src/lib/utils.ts` экспортирует `cn`, файл `tailwind.config.*` не создан
- [x] 1.2 Добавить компоненты `pnpm dlx shadcn@latest add button input textarea radio-group label sonner`. Проверка: файлы есть в `src/components/ui/`, зависимости в `package.json`, `pnpm install --frozen-lockfile` проходит

## 2. Токены и глобальные стили

- [x] 2.1 Переписать `src/app/globals.css`: палитра из design.md в `:root`, `@theme inline` с цветами (включая `success` и `ring-inverse`), `--radius-*`, `--shadow-card`, `--container-page`, `--spacing-section`, `--font-heading`/`--font-body` и типографической шкалой `--text-*` из design.md (п. 1a). Удалить сгенерированные shadcn `oklch`-значения, блок `@media (prefers-color-scheme: dark)` и `.dark`, добавить `color-scheme: light`, базовые стили `body` (`bg-background text-foreground font-body`) и заголовков (`font-heading`), глобальный `:focus-visible` с `--focus-ring` и его переопределение на тёмных поверхностях, `scroll-behavior: smooth` внутри `prefers-reduced-motion: no-preference`. Проверка: `pnpm build` проходит, классы `bg-background`, `text-muted-foreground`, `rounded-card`, `text-display`, `text-h2` работают на странице
- [x] 2.2 Проверить контраст всех текстовых пар палитры и границ полей/фокуса скриптом или WebAIM. Проверка: `muted-foreground` на `background`/`card`/`surface`, `primary-foreground`/`primary`, `accent-foreground`/`accent`, `espresso-foreground`/`espresso`, `destructive` и `success` на `card` и `background` дают ≥ 4.5:1, а `input` и `ring` к светлому фону, `ring-inverse` к `espresso` и `primary` дают ≥ 3:1
- [x] 2.3 Проверить, что системная тёмная тема не меняет вид. Проверка: в DevTools → Rendering → `prefers-color-scheme: dark` цвета страницы не меняются
- [x] 2.4 Проверить типографику на узком экране. Проверка: в DevTools на ширине 360 px вычисленный `font-size` абзаца ≥ 16 px, H1 со строкой «Кофе, который приезжает свежим» не даёт горизонтальной прокрутки

## 3. Шрифты и корневой макет

- [x] 3.1 Создать `src/lib/fonts.ts`: Lora и Golos Text из `next/font/google`, `subsets: ['latin', 'cyrillic']`, `display: 'swap'`, переменные `--font-heading`/`--font-body` (сверить API с `node_modules/next/dist/docs/01-app/**/13-fonts.md`). Проверка: `pnpm typecheck` проходит
- [x] 3.2 Обновить `src/app/layout.tsx`: убрать Geist, повесить переменные шрифтов на `<html>`, `lang="ru"`, смонтировать `Toaster` один раз. Проверка: в HTML страницы `<html lang="ru">`, в Network шрифты идут с `localhost`, без запросов к `fonts.googleapis.com`/`fonts.gstatic.com`, кириллица в заголовке отрисована Lora (DevTools → Computed → Rendered Fonts)

## 4. Базовые компоненты

- [x] 4.1 Доработать `src/components/ui/button.tsx`: варианты `primary` (по умолчанию), `accent`, `ghost`, `outline`, удалить лишние, оставить `asChild`, заменить shadcn-ринг на общий `--focus-ring`, стиль `disabled`. Проверка: Tab показывает кольцо фокуса, клик мышью его не показывает, `disabled` не вызывает `onClick`, `<Button asChild><a href="#lead-form">` рендерит `<a>` со стилями
- [x] 4.2 Доработать `input.tsx` и `textarea.tsx`: фон `card`, граница `input`, `aria-invalid:border-destructive`, фокус `ring`, радиус токеном. Проверка: при `aria-invalid="true"` граница красная, клик по `<Label htmlFor>` фокусирует поле
- [x] 4.3 Доработать `radio-group.tsx` и `label.tsx` под токены. Проверка: стрелки ↑/↓ переключают выбор, фокус виден
- [x] 4.4 Доработать `sonner.tsx`: убрать зависимость от `next-themes`, зафиксировать `theme="light"` и `position="top-center"`, цвета из токенов. Проверка: `toast.error('Не удалось отправить заявку')` показывает уведомление в фирменных цветах, контейнер содержит `aria-live`
- [x] 4.5 Создать `src/components/logo.tsx`: ссылка `#top` с `aria-label="Кварта, на главную"`, текст «Кварта» шрифтом заголовков, `uppercase` через CSS, размеры `header`/`footer`. Проверка: текст выделяется мышью, Tab показывает на логотипе кольцо фокуса, Enter прокручивает к началу
- [x] 4.6 Проверить фокус на тёмной поверхности: временно отрисовать `<Button variant="accent">` и ссылку внутри блока `bg-espresso`. Проверка: при Tab кольцо светлое и хорошо видно; временную разметку удалить
- [x] 4.7 Проверить отсутствие хардкода в компонентах: `rg -n '#[0-9a-fA-F]{3,8}\b|rgb\(|hsl\(|oklch\(|-(zinc|gray|neutral|stone|slate)-[0-9]|dark:' src/components`. Проверка: совпадений нет

## 5. Документация и итоговая проверка

- [x] 5.1 Добавить в `README.md` раздел «Дизайн-система»: где лежат токены, выбор шрифтов (Lora + Golos Text) и почему, допущения (радиогруппа вместо select из макета, затемнённый вторичный текст ради контраста, нет тёмной темы). Проверка: раздел есть, пути в нём существуют
- [x] 5.2 Итоговая проверка: `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm format:check` завершаются с кодом 0, `pnpm dev` открывает страницу без ошибок в консоли
