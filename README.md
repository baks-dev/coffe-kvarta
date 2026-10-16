This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Дизайн-система

### Токены

Все фирменные цвета, радиусы, тени и типографическая шкала объявлены в одном месте: `src/app/globals.css`. Токены задаются как CSS-переменные в `:root` и публикуются как утилиты Tailwind через `@theme inline`.

#### Цвета

| Токен                              | Значение              | Назначение                |
| ---------------------------------- | --------------------- | ------------------------- |
| `background`                       | `#f1ede3`             | фон страницы              |
| `surface`                          | `#e9e2d5`             | полосы-секции             |
| `card`                             | `#f8f5ee`             | карточки, поля ввода      |
| `foreground`                       | `#1a1814`             | заголовки, основной текст |
| `muted-foreground`                 | `#625d52`             | вторичный текст           |
| `primary` / `primary-foreground`   | `#1a1814` / `#f8f5ee` | тёмные кнопки             |
| `espresso` / `espresso-foreground` | `#1f1a14` / `#f1ede3` | тёмный баннер             |
| `accent` / `accent-foreground`     | `#cae18a` / `#1a1814` | CTA подписки              |
| `border`                           | `#ddd6c8`             | границы                   |
| `input`                            | `#8c8574`             | граница полей             |
| `ring`                             | `#1a1814`             | фокус на светлых          |
| `ring-inverse`                     | `#f1ede3`             | фокус на тёмных           |
| `destructive`                      | `#a3341f`             | ошибки                    |
| `success`                          | `#3d6b2c`             | успех                     |

#### Типографика

| Токен          | Размер                                   | Межстрочный | Шрифт           |
| -------------- | ---------------------------------------- | ----------- | --------------- |
| `display` (H1) | `clamp(2.5rem, 1.6rem + 3.6vw, 3.75rem)` | 1.05        | Lora            |
| `h2`           | `clamp(1.75rem, 1.3rem + 1.8vw, 2.5rem)` | 1.15        | Lora            |
| `h3`           | `1.25rem`                                | 1.3         | Golos Text, 600 |
| `body`         | `1rem`                                   | 1.6         | Golos Text      |
| `small`        | `0.875rem`                               | 1.5         | Golos Text      |

### Шрифты

- **Lora** (заголовки): контрастная книжная антиква с полноценной кириллицей, близка к заголовкам макета
- **Golos Text** (текст): гротеск, изначально спроектированный под кириллицу, хорошо читается на телефоне

Оба шрифта подключаются через `next/font/google` с `subsets: ['latin', 'cyrillic']` и `display: 'swap'`. Шрифты хостятся локально, без запросов к сторонним серверам.

### Допущения

- **Радиогруппа вместо select**: ТЗ разрешает «Select/Radio». Для трёх вариантов (подписка / разовый заказ / вопрос) радиогруппа лучше подходит для мобильной аудитории — одно касание вместо двух.
- **Затемнённый вторичный текст**: Серый текст из макета (`#727067`, 4,25:1 на кремовом) не проходит порог 4.5:1 по WCAG. `muted-foreground` затемнён до `#625d52` для соответствия требованиям доступности.
- **Нет тёмной темы**: Переключение тем (`next-themes`) вынесено в бэклог. Сайт отображается в одной фирменной светлой палитре.

### Допущения для change "content-and-data"

- **Заглушки контактов**: Телефон `+375 (29) 123-45-67` и email `hello@example.com` — фиктивные данные для MVP.
- **Обжарка сортов**: Обжарка Колумбии medium и Бразилии medium-dark не указана в ТЗ, выбраны по умолчанию.
- **Самовывоз**: Доступен в любое рабочее время (часы берутся из `hours` в `site.ts`).
- **Источники изображений**: стоковые фото с Unsplash (не фото самой «Кварты»), Unsplash License; ссылки на каждое фото — в `public/images/README.md`.

### Допущения для change "add-landing-sections"

- **Доставка дешевле порога**: стоимость доставки заказа меньше 50 BYN называет менеджер.
- **Сорта в подписке**: сорта в подписке выбирает клиент при звонке.
- **Навигация на телефоне**: навигация скрыта меньше 1024 px без бургер-меню; на телефоне доступна кнопка «Оставить заявку» и подвал.
- **Корзина**: иконки корзины из макета нет, потому что корзина не нужна.
- **Рукописные надписи**: контуры шрифта Caveat (SIL OFL) в SVG, без подключения шрифта.
- **Координаты мастерской**: взяты из OpenStreetMap.

## Development

### Requirements

- Node.js 24+
- pnpm 12 (`corepack enable`)

### Installation

```bash
pnpm install
```

### Commands

| Command             | Description                                               |
| ------------------- | --------------------------------------------------------- |
| `dev`               | Запустить dev-сервер                                      |
| `build`             | Создать продакшен-сборку                                  |
| `start`             | Запустить продакшен-сборку                                |
| `lint`              | Запустить ESLint                                          |
| `typecheck`         | Проверить типы TypeScript                                 |
| `format`            | Отформатировать код с Prettier                            |
| `format:check`      | Проверить форматирование без изменений                    |
| `build:handwriting` | Перегенерировать SVG рукописных надписей из шрифта Caveat |

### Project Structure

```
src/
├── app/          # Маршруты (Next.js App Router)
├── components/   # UI-компоненты
├── lib/          # Утилиты и серверная логика
└── data/         # Статический контент
```

See `.env.example` for environment variables.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
