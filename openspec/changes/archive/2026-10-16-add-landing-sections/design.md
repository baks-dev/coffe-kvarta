# Design

## Контекст

Мотивация и scope описаны в `proposal.md`, требования — в `specs/landing-page/spec.md` и `specs/content-and-data/spec.md`. Ниже текущее состояние кода, на которое опирается решение.

- **Next.js 16.4, React 19.3, App Router.** В `next.config.ts` включены `cacheComponents: true` и `partialPrefetching: true`. При Cache Components старые `export const dynamic = 'force-static'` не работают. Статичность маршрута задаёт `export const ensureStatic = 'navigation'` (см. `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/ensureStatic.md`): Next проверяет весь маршрут в `next dev` и `next build`. Синхронный IO (`new Date()`, `Date.now()`, `Math.random()`) в пререндере ломает сборку (`docs/01-app/02-guides/migrating-to-cache-components.md`, п. 3).
- **next/image в 16.x:** проп `priority` устарел, вместо него `preload` (`docs/01-app/03-api-reference/02-components/image.md`, раздел `preload`). По умолчанию `loading="lazy"`. В `images.qualities` по умолчанию `[75]`, поэтому проп `quality` не задаём.
- `src/app/page.tsx` — заглушка `create-next-app` с классами `zinc-*`/`dark:` и картинками `/next.svg`, `/vercel.svg`.
- `src/app/layout.tsx`: `<html lang="ru">` с переменными шрифтов, `<body className="min-h-full flex flex-col">`, `<Toaster />`. Этот change его не меняет.
- `src/app/globals.css` — токены дизайн-системы (см. `openspec/specs/design-system/spec.md`). Утилиты: `bg-background|surface|card|espresso|accent|primary`, `text-foreground|muted-foreground|espresso-foreground|primary-foreground|accent-foreground`, `border-border`, `rounded-card`, `shadow-card`, `max-w-page` (72rem), `py-section` (64 → 96 px от `md`), `text-display|h2|h3|body|small|eyebrow`, `font-heading`. Правило `:is(.bg-espresso, .bg-primary) :focus-visible` переключает кольцо фокуса на `ring-inverse` у потомков тёмных поверхностей.
- `src/components/ui/button.tsx` экспортирует `Button` и `buttonVariants` (cva). Варианты: `primary | accent | ghost | outline`, размеры: `default | sm | lg | icon`. `Button asChild` использует `@radix-ui/react-slot`, а тот вызывает хук `useComposedRefs`, поэтому в Server Component его использовать нельзя.
- `src/components/logo.tsx` — серверный `<Link href="#top" aria-label="Кварта, на главную">`, размеры `header | footer`.
- `src/data/products.json` + `src/lib/product-schema.ts` (Zod discriminatedUnion `coffee | drip-pack | subscription`) + `src/lib/get-products.ts` (`getProducts`, `getProductById`). `scripts/validate-data.ts` валидирует JSON в `pnpm build`.
- `src/data/site.ts` (`siteData`) и `src/data/content.ts` (`content`) — минимальные объекты без явных типов.
- `public/images/*.webp`: `hero` 2000×1325, `about` 1000×1500, `product-{ethiopia,colombia,brazil}` 800×800. Alt-тексты лежат в `public/images/README.md`.
- Тестового стека нет: Vitest/Playwright появятся в задаче 11. Проверка идёт через `pnpm typecheck`, `pnpm lint`, `pnpm build`, `tsx`-однострочники и ручные сценарии.
- Референс внешнего вида: `images/design/design.png` (порядок «товары сразу после hero», нумерованные блоки «01 / 02 / 03», тёмный баннер подписки с лаймовой кнопкой, рукописные надписи).
- Черновой план `tasks/plans/04-landing-sections-plan.md` устарел: в нём `useState` и scroll-listener в шапке, `bg-gray-50`, `font-serif`, `container` и `© 2024`. Его заменяет этот design.

## Решения

### 1. Статичность: `ensureStatic = 'navigation'` в `src/app/page.tsx`

Выбрано: `export const ensureStatic = 'navigation';` в `page.tsx`. Все секции — синхронные Server Components, которые читают только импортированные модули данных.

Отвергнуто:
- `export const dynamic = 'force-static'` — API для режима без Cache Components. В нашей конфигурации он не проверяет статичность.
- Ничего не экспортировать — страница и так получилась бы статичной, но защиты от будущей регрессии (например, если в 07 кто-то вызовет `headers()` на странице) не было бы.
- `output: 'export'` — сломает `POST /api/lead` (06).

### 2. Порядок секций: по макету, ассортимент сразу после hero

Выбрано: Header → Hero → Products → About → Subscription → Delivery → LeadSection → Contacts → Footer. Трафик идёт из рекламы, и человек хочет сразу увидеть, что и почём. История и свежесть объясняют цену после витрины, а не до неё. Форма стоит перед контактами, чтобы прокручивающий страницу сначала дошёл до формы.

Отвергнуто: порядок из `tasks/04-landing-sections.md` (О нас → Ассортимент): он противоречит макету и отодвигает цены на второй-третий экран.

### 3. Шапка: CSS `sticky`, без клиентского JS, без бургер-меню

Выбрано: серверный `<header className="sticky top-0 z-40 h-16 ...">` со сплошным фоном `bg-background` и нижней границей `border-border`. Навигация `hidden lg:flex`, CTA видна всегда. Секции получают `scroll-mt-16`, чтобы якорь не прятал заголовок под шапкой.

Отвергнуто:
- Scroll-listener с `useState` для тени (черновой план): клиентский JS, лишние перерисовки, утечка обработчика в рендере.
- Бургер-меню: нужен клиентский компонент с фокус-ловушкой, а пять якорей на телефоне менее важны, чем всегда видимая CTA. Навигация есть в подвале.
- Отдельная нижняя sticky-панель на телефоне: дублирует CTA шапки и перекрывает контент и toast.
- `backdrop-blur`: стоит производительности на слабых телефонах, а выигрыша почти не даёт.

### 4. Якоря: обычные `<a href="#…">`

Выбрано: все внутристраничные ссылки (навигация, CTA, «Хочу», «О подписке») — нативные `<a>`. Плавность прокрутки задаёт `scroll-behavior: smooth` в `globals.css`, и только при `prefers-reduced-motion: no-preference`. `Logo` остаётся как есть (`next/link`). Для него в начало страницы ставится `<div id="top" />`, чтобы прокрутка к `#top` гарантированно давала `scrollY = 0` и не зависела от поведения роутера при несуществующем `id`.

Отвергнуто: `next/link` для якорей (лишний клиентский роутинг, без JS работает так же, как `<a>`) и `scrollIntoView` в обработчиках (нужен клиентский JS).

### 5. Кнопки-ссылки: `buttonVariants()` на `<a>`, а не `<Button asChild>`

Выбрано: в Server Components ссылка-кнопка пишется как `<a href="#lead-form" className={buttonVariants({ variant: 'primary' })}>`. В клиентском `LeadIntentLink` — то же самое.

Отвергнуто: `<Button asChild><a/></Button>`, потому что Radix Slot вызывает хук и падает в Server Component. Добавить в `button.tsx` `'use client'` тоже нельзя: все кнопки станут клиентскими.

### 6. Намерение заявки: модуль-шина `src/lib/lead-intent.ts` + один клиентский компонент

Выбрано: модуль без React и DOM-зависимостей хранит в замыкании множество подписчиков и одно отложенное намерение (контракт ниже). `LeadIntentLink` (`'use client'`) рендерит `<a href="#lead-form">` и в `onClick` вызывает `requestLeadIntent(intent)`, не вызывая `preventDefault`: дальше браузер сам прокручивает к якорю. Форма из задачи 05 при монтировании забирает `takePendingLeadIntent()` и подписывается через `subscribeLeadIntent()`.

Отвергнуто:
- Query-параметр (`?interest=order#lead-form`): чтение `useSearchParams` требует `<Suspense>` под `ensureStatic`, URL засоряется, а при повторном клике по той же карточке ничего не происходит.
- Кодировать намерение в хеше (`#lead-form/order/ethiopia`): ломает нативную прокрутку к `id` без JS.
- React Context: пришлось бы делать клиентским провайдер вокруг всей страницы.
- `window.dispatchEvent(new CustomEvent(...))`: не решает случай «кликнули до монтирования формы» без отдельного хранилища. Модульное состояние проще и типизировано.

`LeadInterest` объявляется здесь (`'subscription' | 'order' | 'question'`). Задача 05 MUST переиспользовать `LEAD_INTERESTS` в Zod-схеме (`z.enum(LEAD_INTERESTS)`), а не объявлять значения заново.

### 7. Секции: `Section` + `SectionHeading` вместо монолитного враппера

Выбрано: `Section` отвечает только за `<section id aria-labelledby>`, фон, `scroll-mt-16`, `py-section` и контейнер. `SectionHeading` рисует надзаголовок, `<h2 id="{sectionId}-title">` и вводный абзац. Поэтому подписка может поставить заголовок внутрь тёмного баннера, а остальные секции — над содержимым.

Отвергнуто: один `Section` с обязательным `title` (подписке пришлось бы обходить его стороной) и копирование разметки контейнера в каждую секцию (контейнер разъедется).

### 8. Витрина и подписка через новые функции `get-products.ts`

Выбрано: добавить в `src/lib/get-products.ts` функции `getShowcaseProducts()` (товары `coffee` и `drip-pack` в порядке JSON) и `getSubscriptionProduct()`. Вторая бросает `Error` с текстом, в котором есть `subscription`, если товара нет: сборка падает на пререндере. Витрина при пустом списке показывает текст с телефоном (см. «Граничные случаи»).

Отвергнуто:
- Фильтровать в компоненте: тип сужается вручную и дублируется.
- Тихо не рендерить подписку: главный продукт исчез бы незаметно.

### 9. Тексты в `content.ts`, собранные из `siteData`

Выбрано: все строки секций лежат в `src/data/content.ts` с явным типом `SiteContent`. Строки с адресом, часами, телефоном и порогом доставки собираются шаблонными строками из `siteData` (контракт ниже). Компоненты не содержат русских строк, кроме форматирования (`formatPrice` и т. п.). H1 меняется на «Кофе, который приезжает свежим» (как в макете и в сценарии спеки design-system).

Отвергнуто: строки прямо в JSX (правка текста = поиск по компонентам, дубли адреса и часов) и JSON-файл (нельзя собирать строки из `siteData`, нет типов).

### 10. Реестр изображений `src/data/images.ts`

Выбрано: явные `src/width/height/alt` для каждого фото, ключи товаров совпадают с `product.id`. Отсутствие ключа означает «фото нет», и тогда карточка рисует плашку.

Отвергнуто:
- Поле `image` в `products.json`: меняет `ProductSchema` и валидацию из задачи 03 ради данных, которые нужны только UI.
- Статический `import hero from '../../public/images/hero.webp'`: нестандартный импорт из `public/`, а alt всё равно хранить отдельно.
- Вычислять путь `/images/product-${id}.webp`: для дрип-пакетов получится битая картинка.

### 11. Карта: `iframe` виджета Яндекс.Карт с `loading="lazy"`

Выбрано: `https://yandex.ru/map-widget/v1/?ll=<lon>%2C<lat>&z=16&pt=<lon>%2C<lat>%2Cpm2rdm` в `<iframe loading="lazy" title=…>` высотой 320 px (`h-80`), от `lg` — 384 px (`lg:h-96`). Под картой ссылка на `https://yandex.ru/maps/?ll=…&z=17&pt=…` в новой вкладке. Координаты `53.902189, 27.542084` взяты из OpenStreetMap (здание way 25388496, «9, вуліца Караля») и хранятся в `siteData.geo`.

Отвергнуто:
- JS API Яндекс.Карт / `react-yandex-maps`: сотни КБ JS и API-ключ.
- Static API (картинка): нужен API-ключ.
- Фасад «нажмите, чтобы загрузить карту»: лишний клик и клиентский JS. Lazy-`iframe` в самом низу страницы и так не грузится на первом экране.
- Поиск по тексту адреса (`mode=search&text=…`): метка зависит от геокодера Яндекса, и в виджете появляется панель поиска.

### 12. Рукописные надписи: SVG-контуры Caveat + CSS-маска

Выбрано: одноразовый скрипт `scripts/build-handwriting.ts` (запуск: `pnpm build:handwriting <путь к Caveat.ttf>`) с помощью `opentype.js` превращает строки из `content.hero.handwriting` и `content.about.handwriting` в контуры. Он пишет `public/handwriting/fresh-weekly.svg`, `public/handwriting/with-love.svg` и сгенерированный реестр `src/data/handwriting.ts` (src и размеры viewBox). Компонент `Handwriting` рисует `<span aria-hidden="true">` с `background-color: currentColor` и `mask-image: url(...)`. Цвет задаётся токеном через `text-*`, файл кешируется браузером, у элементов с `display: none` (до 768 px) маска не загружается. Шрифт (Caveat, SIL OFL 1.1) в репозиторий и на сайт не попадает.

Отвергнуто:
- Inline `<svg><path d=…>` прямо в HTML: замер на этапе планирования показал ≈75 КБ путей (≈25 КБ gzip) на две надписи. Они попадут в HTML каждой загрузки, в том числе на телефоне, где надписи скрыты. Это ухудшит LCP.
- Третий шрифт через `next/font`: нарушает требование design-system «ровно два семейства».
- Рисовать пути вручную: результат непредсказуем.
- `<img src="…svg">`: цвет зашит в файл и не следует токенам.

`opentype.js` фиксируется на `1.3.4` (API `opentype.parse(ArrayBuffer)`, `font.getPath(text, x, y, size)`, `path.getBoundingBox()`, `path.toPathData(1)` проверены при планировании на `Caveat[wght].ttf`). Версия 2.x не проверялась.

### 13. Мелкие решения

- **Цена:** `formatPrice(32)` → `"32 BYN"`, без «от» (у каждого товара одна цена). Подписка: `${formatPrice(price)} / ${period}` → `"54 BYN / месяц"`.
- **Вес:** в данных `"250г"`. Для показа `formatWeight("250г")` → `"250 г"` (неразрывный пробел не нужен).
- **Ноты:** `notes.join(' · ')` → `"цветочный · бергамот"`.
- **Обжарка:** подпись берётся из `content.products.roastLabels[roastLevel]`.
- **Год в подвале:** строка `"© 2026 Кварта"` в `content.footer.copyright`. `new Date()` запрещён (п. 1).
- **Телефон:** `toTelHref("+375 (29) 123-45-67")` → `"tel:+375291234567"`.

## Структура файлов

| Путь | Действие | Назначение |
|---|---|---|
| `src/app/page.tsx` | заменить | `ensureStatic`, `<div id="top" />`, Header, `<main>` с секциями, Footer |
| `src/components/section.tsx` | создать | `Section`, `SectionHeading` |
| `src/components/lead-intent-link.tsx` | создать | `'use client'`, ссылка на `#lead-form`, передающая намерение |
| `src/components/product-card.tsx` | создать | карточка товара витрины (сорт или дрип-пакеты) |
| `src/components/handwriting.tsx` | создать | декоративная надпись через CSS-маску |
| `src/components/sections/header.tsx` | создать | sticky-шапка: логотип, навигация (`lg+`), CTA |
| `src/components/sections/hero.tsx` | создать | H1, подзаголовок, CTA, фото с `preload`, надпись |
| `src/components/sections/products.tsx` | создать | `#products`: заголовок и сетка карточек или текст для пустой витрины |
| `src/components/sections/about.tsx` | создать | `#about`: история, фото, надпись, таймлайн «Почему свежесть важна» |
| `src/components/sections/subscription.tsx` | создать | `#subscription`: баннер `espresso`, цена, пункты, CTA `accent` |
| `src/components/sections/delivery.tsx` | создать | `#delivery`: два блока условий |
| `src/components/sections/lead-section.tsx` | создать | `#lead-form`: заголовок, шаги, слот `children`, строка с телефоном |
| `src/components/sections/contacts.tsx` | создать | `#contacts`: `<dl>` контактов, iframe карты, ссылка на карту |
| `src/components/sections/footer.tsx` | создать | подвал |
| `src/components/sections/site-nav.tsx` | создать | список якорных ссылок из `content.nav` (используют header и footer) |
| `src/lib/lead-intent.ts` | создать | контракт намерения заявки |
| `src/lib/format.ts` | создать | `formatPrice`, `formatWeight`, `toTelHref` |
| `src/lib/yandex-map.ts` | создать | `getYandexMapWidgetUrl`, `getYandexMapsUrl` |
| `src/lib/get-products.ts` | изменить | добавить `getShowcaseProducts`, `getSubscriptionProduct` и типы |
| `src/data/content.ts` | заменить | все тексты лендинга, тип `SiteContent` |
| `src/data/site.ts` | изменить | добавить `geo` |
| `src/data/images.ts` | создать | реестр фото |
| `src/data/handwriting.ts` | создать (генерируется) | реестр SVG-надписей |
| `scripts/build-handwriting.ts` | создать | генератор SVG-надписей |
| `public/handwriting/fresh-weekly.svg` | создать (генерируется) | «Свежая обжарка / каждую неделю» |
| `public/handwriting/with-love.svg` | создать (генерируется) | «С любовью / к хорошему кофе» |
| `package.json`, `pnpm-lock.yaml` | изменить | devDependencies `opentype.js@1.3.4`, `@types/opentype.js@1.3.10`; скрипт `"build:handwriting": "tsx scripts/build-handwriting.ts"` |
| `public/next.svg`, `public/vercel.svg` | удалить | остатки заглушки |
| `README.md` | изменить | раздел допущений, строка `build:handwriting` в таблице команд |
| `public/images/README.md` | изменить | раздел «Рукописные надписи» (источник: Caveat, SIL OFL 1.1, способ генерации) |
| `tasks/plans/04-landing-sections-plan.md` | изменить | первой строкой пометка «Заменён change `add-landing-sections`» |
| `tasks/04-landing-sections.md` | изменить | отметить выполненные пункты |

Других файлов не создавать. `src/app/layout.tsx`, `globals.css`, `products.json`, `product-schema.ts` и `src/components/ui/*` не менять.

## Контракты

### `src/lib/lead-intent.ts`

```ts
export const LEAD_INTERESTS = ['subscription', 'order', 'question'] as const;
export type LeadInterest = (typeof LEAD_INTERESTS)[number];

export interface LeadIntent {
  interest: LeadInterest;
  /** id товара из products.json; отсутствует, если намерение без товара */
  productId?: string;
}

export type LeadIntentListener = (intent: LeadIntent) => void;

/**
 * Передаёт намерение. Если есть подписчики — вызывает каждого ровно один раз
 * и НЕ сохраняет намерение как отложенное. Если подписчиков нет — сохраняет
 * его как отложенное, перезаписывая предыдущее.
 */
export function requestLeadIntent(intent: LeadIntent): void;

/** Подписывает слушателя. Возвращает функцию отписки (идемпотентна). */
export function subscribeLeadIntent(listener: LeadIntentListener): () => void;

/** Возвращает отложенное намерение и очищает его; если его нет — null. */
export function takePendingLeadIntent(): LeadIntent | null;
```

В модуле нет `'use client'`, импортов React и обращений к `window` и `document`: его можно проверить в Node через `tsx`.

### Компоненты

```ts
// src/components/section.tsx (Server)
type SectionTone = 'default' | 'surface';
interface SectionProps {
  id: string; // также база для id заголовка: `${id}-title`
  tone?: SectionTone; // default → без фона (bg-background от body), surface → bg-surface
  className?: string; // классы внутреннего контейнера
  children: React.ReactNode;
}
export function Section(props: SectionProps): React.JSX.Element;
// <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-16 py-section [bg-surface]">
//   <div className={cn('mx-auto max-w-page px-4 md:px-8', className)}>{children}</div>
// </section>

interface SectionHeadingProps {
  sectionId: string; // h2 получает id `${sectionId}-title`
  eyebrow?: string;
  title: string;
  lead?: string;
  inverse?: boolean; // true на bg-espresso: все тексты text-espresso-foreground
  className?: string;
}
export function SectionHeading(props: SectionHeadingProps): React.JSX.Element;
// eyebrow → <p className="text-eyebrow text-muted-foreground">, title → <h2 className="text-h2">,
// lead → <p className="text-body text-muted-foreground max-w-2xl">

// src/components/lead-intent-link.tsx ('use client')
interface LeadIntentLinkProps {
  intent: LeadIntent;
  variant?: 'primary' | 'accent' | 'outline' | 'ghost'; // по умолчанию 'primary'
  size?: 'default' | 'sm' | 'lg'; // по умолчанию 'default'
  className?: string;
  children: React.ReactNode;
}
export function LeadIntentLink(props: LeadIntentLinkProps): React.JSX.Element;
// <a href="#lead-form" className={buttonVariants({variant,size,className})}
//    onClick={() => requestLeadIntent(intent)}>{children}</a>

// src/components/product-card.tsx (Server)
interface ProductCardProps {
  product: ShowcaseProduct;
}
export function ProductCard(props: ProductCardProps): React.JSX.Element;

// src/components/handwriting.tsx (Server)
interface HandwritingProps {
  id: HandwritingId;
  className?: string; // ширина (w-*), поворот, цвет (text-*), позиционирование
}
export function Handwriting(props: HandwritingProps): React.JSX.Element;

// src/components/sections/lead-section.tsx (Server)
interface LeadSectionProps {
  children?: React.ReactNode; // форма из задачи 05; в этом change не передаётся
}
export function LeadSection(props: LeadSectionProps): React.JSX.Element;

// src/components/sections/site-nav.tsx (Server)
interface SiteNavProps {
  label: string; // aria-label для <nav>: 'Основная навигация' | 'Навигация в подвале'
  className?: string; // классы <nav>; видимость задаёт вызывающий
  linkClassName?: string;
}
export function SiteNav(props: SiteNavProps): React.JSX.Element;

// Остальные секции — без пропсов:
export function Header(): React.JSX.Element;
export function Hero(): React.JSX.Element;
export function Products(): React.JSX.Element;
export function About(): React.JSX.Element;
export function Subscription(): React.JSX.Element;
export function Delivery(): React.JSX.Element;
export function Contacts(): React.JSX.Element;
export function Footer(): React.JSX.Element;
```

### `src/lib/get-products.ts` (дополнения)

```ts
export type CoffeeProduct = Extract<Product, { type: 'coffee' }>;
export type DripPackProduct = Extract<Product, { type: 'drip-pack' }>;
export type SubscriptionProduct = Extract<Product, { type: 'subscription' }>;
export type ShowcaseProduct = CoffeeProduct | DripPackProduct;

/** Товары типов coffee и drip-pack в порядке products.json. */
export function getShowcaseProducts(): ShowcaseProduct[];

/** Товар id 'subscription'. Бросает Error('В src/data/products.json нет товара subscription'), если его нет или тип не subscription. */
export function getSubscriptionProduct(): SubscriptionProduct;
```

### `src/lib/format.ts`

```ts
export function formatPrice(price: number): string; // 32 → '32 BYN'
export function formatWeight(weight: string): string; // '250г' → '250 г'; '250 г' → '250 г'
export function toTelHref(phone: string): string; // '+375 (29) 123-45-67' → 'tel:+375291234567'
```

### `src/lib/yandex-map.ts`

```ts
export interface GeoPoint {
  lat: number;
  lon: number;
}
/** https://yandex.ru/map-widget/v1/?ll=27.542084%2C53.902189&z=16&pt=27.542084%2C53.902189%2Cpm2rdm */
export function getYandexMapWidgetUrl(geo: GeoPoint, zoom?: number): string; // zoom по умолчанию 16
/** https://yandex.ru/maps/?ll=27.542084%2C53.902189&z=17&pt=27.542084%2C53.902189%2Cpm2rdm */
export function getYandexMapsUrl(geo: GeoPoint, zoom?: number): string; // zoom по умолчанию 17
```

Параметры собираются через `URLSearchParams` в порядке `ll`, `z`, `pt` (запятые кодируются в `%2C`).

### `src/data/site.ts`

К существующему объекту добавляется поле, остальное не меняется:

```ts
geo: { lat: 53.902189, lon: 27.542084 },
```

### `src/data/images.ts`

```ts
export interface SiteImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

/** Ключ — product.id; отсутствие ключа означает «у товара нет фото». */
const products: Partial<Record<string, SiteImage>> = {
  ethiopia: { src: '/images/product-ethiopia.webp', width: 800, height: 800, alt: 'Зёрна кофе Эфиопия Иргачеффе' },
  colombia: { src: '/images/product-colombia.webp', width: 800, height: 800, alt: 'Зёрна кофе Колумбия Уила' },
  brazil: { src: '/images/product-brazil.webp', width: 800, height: 800, alt: 'Зёрна кофе Бразилия Серрадо' },
};

export const images: { hero: SiteImage; about: SiteImage; products: Partial<Record<string, SiteImage>> } = {
  hero: { src: '/images/hero.webp', width: 2000, height: 1325, alt: 'Зёрна кофе крупным планом' },
  about: { src: '/images/about.webp', width: 1000, height: 1500, alt: 'Кофейные зёрна в барабане ростера' },
  products,
};
```

### `src/data/handwriting.ts` (генерируется скриптом, вручную не править)

```ts
// Сгенерировано scripts/build-handwriting.ts — не редактировать вручную.
export const handwriting = {
  'fresh-weekly': { src: '/handwriting/fresh-weekly.svg', width: 0, height: 0 }, // ширина/высота viewBox, целые
  'with-love': { src: '/handwriting/with-love.svg', width: 0, height: 0 },
} as const;
export type HandwritingId = keyof typeof handwriting;
```

### `src/data/content.ts` (полный текст, переносится дословно)

```ts
import { siteData } from '@/data/site';
import type { CoffeeProduct } from '@/lib/get-products';

const freeThreshold = `${siteData.delivery.freeThreshold} BYN`;

const hours = {
  weekday: `Пн–пт ${siteData.hours.weekday}`,
  weekend: `Сб–вс ${siteData.hours.weekend}`,
};

export const content = {
  nav: [
    { href: '#products', label: 'Кофе' },
    { href: '#about', label: 'О нас' },
    { href: '#subscription', label: 'Подписка' },
    { href: '#delivery', label: 'Доставка' },
    { href: '#contacts', label: 'Контакты' },
  ],
  hours,
  header: {
    cta: 'Оставить заявку',
  },
  hero: {
    eyebrow: 'Мастерская обжарки · Минск',
    headline: 'Кофе, который приезжает свежим',
    subheading:
      'Обжариваем небольшими партиями по четвергам, а в пятницу привозим по Минску. Зерно приходит к вам на 1–3 день после обжарки.',
    cta: 'Оставить заявку',
    secondaryCta: 'О подписке',
    handwriting: ['Свежая обжарка', 'каждую неделю'],
  },
  products: {
    eyebrow: 'Ассортимент',
    title: 'Наши сорта',
    lead: 'Три сорта в зёрнах и дрип-пакеты. Выберите, что нравится, — менеджер перезвонит и уточнит детали.',
    cta: 'Хочу',
    dripPackEyebrow: 'Для офиса и дороги',
    dripPackCaption: 'дрип-пакетов в наборе',
    quantityUnit: 'шт.',
    roastLabels: {
      light: 'Светлая обжарка',
      medium: 'Средняя обжарка',
      'medium-dark': 'Средне-тёмная обжарка',
      dark: 'Тёмная обжарка',
    } satisfies Record<CoffeeProduct['roastLevel'], string>,
    empty: 'Ассортимент обновляется — позвоните нам:',
  },
  about: {
    eyebrow: 'Кто мы',
    title: 'Мы — Аня и Дмитрий',
    story: [
      'Раньше мы работали бариста и каждый день видели, как по-разному раскрывается одно и то же зерно — свежее и пролежавшее месяц на складе.',
      'В 2019 году открыли свою мастерскую в Минске. Обжариваем партиями по 5 кг: так каждую партию успеваем попробовать сами и не держим запасов.',
    ],
    handwriting: ['С любовью', 'к хорошему кофе'],
    whyFresh: {
      title: 'Почему свежесть важна',
      description:
        'Самый яркий вкус у зерна — в первые недели после обжарки, потом аромат постепенно уходит. Поэтому путь от ростера до вашей чашки у нас короткий.',
      steps: [
        { label: 'Четверг', title: 'Обжариваем', text: 'Партию 5 кг — под заказы этой недели.' },
        { label: 'Пятница', title: 'Привозим', text: 'Развозим по Минску или ждём вас в мастерской.' },
        { label: '1–3 день', title: 'Варите', text: 'Зерно у вас на 1–3 день после обжарки — в самый вкус.' },
      ],
    },
  },
  subscription: {
    eyebrow: 'Подписка на кофе',
    title: 'Две пачки по 250 г каждый месяц',
    description: 'Свежая обжарка приезжает сама — не нужно помнить, что кофе заканчивается.',
    points: [
      '2 пачки по 250 г — сорта выбираете вы',
      'Привозим в пятницу после обжарки',
      'Доставка бесплатная',
    ],
    cta: 'Оформить подписку',
    note: 'Менеджер перезвонит, поможет выбрать сорта и удобную пятницу.',
  },
  delivery: {
    eyebrow: 'Как получить',
    title: 'Доставка и самовывоз',
    delivery: {
      title: 'Доставка по Минску',
      items: [
        'Привозим по пятницам — на следующий день после обжарки',
        `Бесплатно при заказе от ${freeThreshold} и для подписки`,
        `Для заказа меньше ${freeThreshold} стоимость доставки назовёт менеджер`,
      ],
    },
    pickup: {
      title: 'Самовывоз из мастерской',
      items: [
        siteData.pickup.address,
        hours.weekday,
        hours.weekend,
        'Забрать можно в любое время работы мастерской',
      ],
    },
  },
  lead: {
    eyebrow: 'Заявка',
    title: 'Оставьте заявку',
    lead: 'Корзины и оплаты на сайте нет. Оставьте телефон — менеджер перезвонит, уточнит заказ и день доставки.',
    steps: [
      'Вы оставляете заявку',
      'Мы перезваниваем и уточняем детали',
      'Привозим в пятницу или ждём в мастерской',
    ],
    callPrompt: 'Удобнее позвонить?',
  },
  contacts: {
    eyebrow: 'Контакты',
    title: 'Приходите в мастерскую',
    labels: {
      address: 'Адрес',
      phone: 'Телефон',
      email: 'Почта',
      hours: 'Часы работы',
    },
    mapTitle: `Мастерская «Кварта» на карте: ${siteData.address}`,
    mapLink: 'Открыть в Яндекс Картах',
  },
  footer: {
    tagline: 'Мастерская обжарки в Минске с 2019 года',
    navLabel: 'Навигация в подвале',
    copyright: '© 2026 Кварта',
    photoCredit: 'Фото: Unsplash',
  },
} as const;

export type SiteContent = typeof content;
```

`import type` из `get-products.ts` не создаёт цикла во время выполнения. Если `as const` мешает `satisfies` у `roastLabels`, `satisfies` можно убрать и типизировать через `Record<CoffeeProduct['roastLevel'], string>`, но строки MUST остаться дословными.

### `scripts/build-handwriting.ts`

```
pnpm build:handwriting <fontPath>
  fontPath — путь к Caveat[wght].ttf (скачивается во временный каталог, в репозиторий не коммитится)
Выход:
  public/handwriting/fresh-weekly.svg  ← content.hero.handwriting (2 строки)
  public/handwriting/with-love.svg     ← content.about.handwriting (2 строки)
  src/data/handwriting.ts              ← реестр (формат выше)
Ошибки:
  нет аргумента → stderr 'Укажите путь к Caveat.ttf: pnpm build:handwriting <path>', exit 1
  файл не читается → stderr с путём, exit 1
```

Параметры: кегль 48, межстрочный шаг 52, вторая строка смещена вправо на 24 (живой рукописный ритм, как в макете), поле 4 по каждой стороне viewBox, точность пути `toPathData(1)`. Все строки сливаются в один `<path>`. Атрибут `fill` не указывается: маска берёт альфа-канал.

## Образцы

**Страница** (`src/app/page.tsx`):

```tsx
import { Header } from '@/components/sections/header';
// ...импорты остальных секций

export const ensureStatic = 'navigation';

export default function HomePage() {
  return (
    <>
      <div id="top" />
      <Header />
      <main className="flex-1">
        <Hero />
        <Products />
        <About />
        <Subscription />
        <Delivery />
        <LeadSection />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
```

**Ссылка-кнопка в Server Component:**

```tsx
import { buttonVariants } from '@/components/ui/button';

<a href="#lead-form" className={buttonVariants({ variant: 'primary' })}>
  {content.header.cta}
</a>
<a href="#subscription" className={buttonVariants({ variant: 'ghost' })}>
  {content.hero.secondaryCta}
</a>
```

**«Хочу» с доступным именем** (в `ProductCard`):

```tsx
<LeadIntentLink intent={{ interest: 'order', productId: product.id }}>
  {content.products.cta}
  <span className="sr-only"> — {product.name}</span>
</LeadIntentLink>
```

**Фото в hero** (единственное с `preload`):

```tsx
<div className="relative aspect-[4/3] overflow-hidden rounded-card lg:aspect-auto lg:min-h-[32rem]">
  <Image
    src={images.hero.src}
    alt={images.hero.alt}
    fill
    preload
    sizes="(min-width: 1024px) 50vw, 100vw"
    className="object-cover"
  />
  <Handwriting
    id="fresh-weekly"
    className="absolute right-6 top-6 w-44 -rotate-6 text-espresso-foreground lg:w-56"
  />
</div>
```

**Остальные `sizes`:** карточка товара — `"(min-width: 1024px) 18rem, (min-width: 640px) 50vw, 100vw"` (контейнер `relative aspect-[4/3]`, `fill`, `object-cover`). Фото «Кто мы» — `"(min-width: 1024px) 40vw, 100vw"` (контейнер `relative aspect-[4/5]`).

**Handwriting:**

```tsx
const item = handwriting[id];
<span
  aria-hidden="true"
  className={cn('hidden bg-current md:block', className)}
  style={{
    aspectRatio: `${item.width} / ${item.height}`,
    maskImage: `url(${item.src})`,
    WebkitMaskImage: `url(${item.src})`,
    maskSize: 'contain',
    WebkitMaskSize: 'contain',
    maskRepeat: 'no-repeat',
    WebkitMaskRepeat: 'no-repeat',
    maskPosition: 'center',
    WebkitMaskPosition: 'center',
  }}
/>
```

**Генерация пути** (проверено при планировании):

```ts
import opentype from 'opentype.js';
const buf = readFileSync(fontPath);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const path = font.getPath(line, x, baseline, 48);
const box = path.getBoundingBox(); // { x1, y1, x2, y2 }
const d = path.toPathData(1);
```

**Раскладки (классы сетки):**

| Секция | Классы |
|---|---|
| Hero | `grid gap-8 lg:grid-cols-2 lg:items-center`, отступы `pt-8 pb-section lg:pt-12` |
| Products | `grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4` |
| About | история + фото: `grid gap-8 lg:grid-cols-5` (фото `lg:col-span-2`, текст `lg:col-span-3`); таймлайн: `<ol className="grid gap-6 lg:grid-cols-3">` |
| Subscription | баннер `rounded-card bg-espresso p-6 text-espresso-foreground md:p-10 lg:p-12` |
| Delivery | `grid gap-6 md:grid-cols-2`, блоки `rounded-card border border-border bg-card p-6` |
| LeadSection | шаги `<ol className="grid gap-4 md:grid-cols-3">` |
| Contacts | `grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]`, iframe `h-80 w-full rounded-card border border-border lg:h-96` |

Карточка товара: `<article className="flex flex-col overflow-hidden rounded-card border border-border bg-card shadow-card">`. Сверху фото или плашка, ниже `p-5 flex flex-1 flex-col gap-2`: надзаголовок (метка обжарки или `dripPackEyebrow`), `<h3 className="text-h3">`, ноты (`text-small text-muted-foreground`, только у сортов), описание (`text-small`), низ `mt-auto flex items-end justify-between gap-4 pt-4`: слева вес или «10 шт.» и цена (`font-heading text-h3`), справа «Хочу».

Шаг таймлайна: номер `01` (`font-heading text-display text-muted-foreground`), метка дня (`text-eyebrow`), `<h3 className="text-h3">`, текст (`text-body`). Обёртка `rounded-card border border-border bg-card p-6` — нумерованные блоки, как в макете.

Эталоны в проекте: `src/components/logo.tsx` (серверный компонент с `cn`), `src/components/ui/button.tsx` (`buttonVariants`), `src/lib/get-products.ts` (модуль данных).

## Конвенции

- **Файлы:** kebab-case (`lead-intent-link.tsx`), именованные экспорты (`export function Hero()`), без `default` (кроме `page.tsx`).
- **Импорты:** только через `@/` (см. `tsconfig.json` `paths`), порядок: внешние пакеты → `@/components` → `@/lib` → `@/data`.
- **Server/Client:** по умолчанию Server Component. `'use client'` есть только в `src/components/lead-intent-link.tsx`.
- **Стили:** только утилиты токенов из `globals.css` (см. «Контекст»). Классы склеиваются через `cn` из `@/lib/utils`. Произвольные значения разрешены только для размеров и пропорций (`aspect-[4/3]`, `min-h-[32rem]`, `grid-cols-[…]`), не для цвета.
- **Тексты:** только из `content`, `siteData` и данных товаров. В JSX нет русских строковых литералов, кроме разделителей (`' · '`, `' — '`).
- **Заголовки:** `h2` — `text-h2`, `h3` — `text-h3`, надзаголовки — `<p className="text-eyebrow">`.
- **Списки:** перечни условий и пунктов — `<ul>`, шаги — `<ol>`, контакты — `<dl>` (`<dt>` — подпись из `content.contacts.labels`, `<dd>` — значение).
- **Внешние ссылки:** `target="_blank" rel="noopener noreferrer"`.
- **Ошибки:** единственная ожидаемая ошибка — отсутствие подписки (`getSubscriptionProduct` бросает `Error`). Её не перехватывать: падение сборки и есть нужное поведение.
- **Комментарии:** на русском, коротко и только для неочевидного (как в `src/lib/site.ts`).
- **Форматирование:** Prettier (`.prettierrc.json`: одинарные кавычки, `printWidth` 100). Сгенерированный `src/data/handwriting.ts` после генерации прогоняется через `pnpm prettier --write src/data/handwriting.ts`.

## Не делать

- Не добавлять runtime-зависимости. `framer-motion`, `react-yandex-maps`, `@pbe/react-yandex-maps`, `embla`, `swiper` и аналоги запрещены. Разрешены только devDependencies `opentype.js@1.3.4` и `@types/opentype.js@1.3.10`.
- Не использовать `<Button asChild>` в Server Components (см. решение 5) и не добавлять `'use client'` в `button.tsx`.
- Не ставить `'use client'` ни в один файл, кроме `lead-intent-link.tsx`. Не использовать `useState`, `useEffect` и scroll/resize-обработчики в секциях.
- Не использовать `export const dynamic`, `revalidate`, `generateStaticParams`, `cookies()`, `headers()`, `searchParams`, `connection()`, `new Date()`, `Date.now()`, `Math.random()` в странице и секциях.
- Не использовать проп `priority` у `next/image` (устарел). `preload` есть только у фото hero.
- Не подключать Caveat или другой третий шрифт через `next/font` или `<link>`. Не коммитить `.ttf`.
- Не вставлять SVG-пути надписей inline в JSX/HTML.
- Не использовать JS API Яндекс.Карт (`api-maps.yandex.ru`) и Static API.
- Не вписывать в JSX цены, названия товаров, адрес, часы и телефон: только из данных.
- Не использовать литералы цвета, `bg-[#…]`, палитры `zinc|gray|neutral|stone|slate-*`, `dark:` (требование design-system), а также `font-serif`, `container`, `bg-gradient-*` из чернового плана.
- Не добавлять `overflow-x-hidden`/`overflow-x-clip` на `html`/`body` и не использовать `w-screen`/`100vw` для ширины блоков.
- Не создавать поля формы, Zod-схему заявки и обработку отправки: это задача 05.
- Не менять `src/app/layout.tsx` (metadata — задача 09), `globals.css`, `products.json`, `product-schema.ts`, `src/components/ui/*`.
- Не добавлять иконку корзины, ссылку «Весь ассортимент», бургер-меню, анимации появления и skip-link.
- Не следовать `tasks/plans/04-landing-sections-plan.md`: его заменяет этот design.

## Граничные случаи

| Случай (спека) | Обработка |
|---|---|
| Нет товаров `coffee`/`drip-pack` | `Products` показывает вместо сетки `<p>`: `content.products.empty` + `<a href={toTelHref(siteData.phone)}>{siteData.phone}</a>` |
| Нет товара `subscription` | `getSubscriptionProduct()` бросает `Error('В src/data/products.json нет товара subscription')`, пререндер и `pnpm build` падают |
| Товар без фото (дрип-пакеты) | `images.products[product.id]` равно `undefined` → плашка `bg-surface aspect-[4/3]` с `product.quantity` (`font-heading text-display`) и `content.products.dripPackCaption` |
| Сорт без фото (новый сорт в JSON) | Та же ветка: плашка с первой нотой вместо количества — `notes[0]` (`font-heading text-h2`) и меткой обжарки |
| Клик «Хочу» до монтирования формы | `requestLeadIntent` сохраняет отложенное намерение, `takePendingLeadIntent` отдаёт его один раз |
| Несколько кликов до монтирования | Сохраняется последнее намерение |
| Клик при подписанной форме | Подписчики вызываются один раз, отложенное намерение не сохраняется |
| JS отключён | Все ссылки — нативные `<a href="#…">`, секции серверные; намерение просто не передаётся |
| Якорь под sticky-шапкой | `scroll-mt-16` на каждой `<section id>`; шапка `h-16` |
| `#top` | `<div id="top" />` первым элементом страницы |
| Узкий экран 360 px | Навигация `hidden lg:flex`; CTA шапки — `buttonVariants()` размера `default`; длинные слова в заголовках переносятся (у `h1`/`h2` `text-balance`, без фиксированных ширин) |
| Переполнение по ширине | Контейнер `max-w-page px-4 md:px-8`; у колонок сетки `min-w-0` / `minmax(0, …)`; iframe `w-full` |
| Рукописные надписи < 768 px | `hidden md:block` → маска не загружается |
| Фокус на тёмном баннере | Баннер `bg-espresso` → глобальное правило `:is(.bg-espresso, .bg-primary) :focus-visible` включает `ring-inverse` |
| Карта на первом экране | `loading="lazy"`; секция внизу страницы, браузер не грузит iframe до приближения |
| Отсутствие года в рантайме | Год — строка в `content.footer.copyright` |
| Сгенерированные надписи не созданы | `src/data/handwriting.ts` импортируется статически: без него `pnpm typecheck` и `pnpm build` падают, поэтому задача генерации идёт до компонента `Handwriting` |

## Риски / компромиссы

- [`opentype.js@1.3.4` читает только базовое начертание вариативного `Caveat[wght].ttf` (wght 400)] → для декоративной надписи этого достаточно. Если нужен жирнее, увеличить кегль, а не начертание.
- [CSS `mask-image` без префикса не поддерживается в старых Safari] → задаём и `-webkit-` свойства. В худшем случае надпись не видна, а она декоративная.
- [Виджет Яндекс.Карт может блокироваться расширениями] → под картой всегда есть ссылка «Открыть в Яндекс Картах» и адрес текстом.
- [Строка «© 2026 Кварта» устареет в 2027] → допустимо для тестового задания. Год меняется в одном месте `content.ts`.
- [Модульное состояние `lead-intent` теоретически дублируется, если модуль попадёт в два клиентских чанка] → Next дедуплицирует модули клиентского графа. Задача 05 импортирует его тем же путём `@/lib/lead-intent`.

## План миграции

Изменение затрагивает только главную страницу и данные. Откат — `git revert` коммитов change. Задача 05 после этого change: `<LeadSection><LeadForm /></LeadSection>` в `page.tsx` + `takePendingLeadIntent()`/`subscribeLeadIntent()` в форме.
