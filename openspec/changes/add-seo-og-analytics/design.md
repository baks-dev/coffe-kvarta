# Design

## Context

Motivation and scope: see `proposal.md`. Requirements: `specs/seo-metadata/spec.md`, `specs/analytics/spec.md`.

- **Stack** (from `package.json`): Next.js 16.4.0 (App Router, Turbopack, `src/`), React 19.3.0, TypeScript 6 in `strict` with `noUncheckedIndexedAccess`, `jsx: "react-jsx"`, Tailwind CSS 4, Vitest 5.0.5, pnpm 12.4.1. Single package, no workspaces, no build flags. Path alias `@/*` → `src/*`.
- **Static rendering**: `next.config.ts` sets `cacheComponents: true`; `src/app/page.tsx` exports `ensureStatic = 'navigation'`. Request-time work in a route fails the build or turns the route into `ƒ` (dynamic).
- **Current metadata**: `src/app/layout.tsx:7-11` exports `metadata = { title: siteName, description: 'Лендинг кофейни Кварта', metadataBase: new URL(siteUrl) }`. The layout renders `<html lang="ru" className={...}>` and `<body className="min-h-full flex flex-col">{children}<Toaster /></body>`. `src/app/favicon.ico` (15086 bytes) is the create-next-app icon from commit `d917f23`.
- **Site URL**: `src/lib/site.ts` exports `siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'` and `siteName = siteData.name`. Only `src/app/layout.tsx` imports `siteUrl`.
- **Site data**: `src/data/site.ts` exports `siteData` with `name: 'Кварта'`, `address: 'Минск, ул. Короля, 9'`, `phone: '+375 (29) 123-45-67'`, `email: 'hello@example.com'`, `hours: { weekday: '8:00–20:00', weekend: '10:00–18:00' }` (en dash U+2013), `delivery.city: 'Минск'`, `geo: { lat: 53.902189, lon: 27.542084 }`. `src/data/images.ts` exports `images.hero.src = '/images/hero.webp'`. `src/data/content.ts` exports `content.hero.headline = 'Кофе, который приезжает свежим'`; `content.ts` imports only a type from `@/lib/get-products`.
- **Brand tokens** (`src/app/globals.css:6-16`): `--espresso: #1f1a14`, `--espresso-foreground: #f1ede3`, `--accent: #cae18a`, `--accent-foreground: #1a1814`. Fonts: `src/lib/fonts.ts` loads Lora and Golos Text via `next/font/google`. Those fonts are bundled into CSS and are not readable as files.
- **Environment**: `.env.example` lists `NEXT_PUBLIC_SITE_URL=`, `KV_REST_API_URL=`, `KV_REST_API_TOKEN=`, `TELEGRAM_BOT_TOKEN=`, `TELEGRAM_CHAT_ID=`, `NEXT_PUBLIC_GA_ID=`, `NEXT_PUBLIC_YM_ID=` with Russian comments. `.env.local` is git-ignored.
- **Commands**: `pnpm test` = `vitest run` (config `vitest.config.mts`: `environment: 'node'`, `include: ['src/**/*.test.ts', 'src/**/*.test.tsx']`, alias `@`). `pnpm lint` = `eslint .`, `pnpm typecheck` = `next typegen && tsc --noEmit`, `pnpm build` = `pnpm validate-data && next build`. `pnpm format:check` currently fails only on the unrelated `verification-report-add-landing-sections.md`; checks here are scoped to touched files. Today `pnpm lint --max-warnings=0`, `pnpm typecheck` and `pnpm test` pass.
- **Lint**: `eslint-config-next` 16.4.0 core-web-vitals + typescript + prettier. `@next/next/no-img-element` warns on `<img>`.
- **Parallel change**: `openspec/changes/add-lead-form` is in progress on the same branch. It edits `package.json`, `pnpm-lock.yaml`, `README.md`, `src/data/content.ts`, `src/app/page.tsx` and `src/components/sections/lead-section.tsx`. This change does not edit the last three files.
- **Verified on a prototype** (a scratch git worktree with the same versions, removed afterwards):
  1. `ImageResponse` from `next/og` with `@fontsource` WOFF files renders Cyrillic in Lora and Golos Text only when the latin and cyrillic subsets are registered under **different** family names and `fontFamily` lists both (`'Lora, Lora Cyrillic'`). With the same name registered twice, Satori falls back to another family.
  2. Under `cacheComponents: true`, an image route that awaits `readFile` **inside** the default export is built as `ƒ` (dynamic). Fonts read with module-level top-level `await` produce `○` (static) for `/opengraph-image` and `/icon`.
  3. With `opengraph-image.tsx` present, Next 16.4.0 emits both `og:image*` and `twitter:image*` tags from it. With `metadataBase` `https://kvarta.example` and `alternates.canonical: '/'` it emits `<link rel="canonical" href="https://kvarta.example"/>` and `og:url` `https://kvarta.example` (no trailing slash).
  4. An inline `next/script` with `strategy="lazyOnload"` is not a `<script>` tag in the server HTML. Its `id` and code appear in the RSC payload inside the HTML (`"id":"yandex-metrika"`), and the `<noscript>` pixel is rendered verbatim.
  5. `@vercel/analytics/next` 2.0.1 and `@vercel/speed-insights/next` 2.0.0 are `"use client"` components that wrap themselves in `<Suspense fallback={null}>`, so `/` stays `○`.
  6. Vitest 5.0.5 in the `node` environment imports `src/app/opengraph-image.tsx` (with top-level `await` in its imported font module) and the returned response gives a PNG whose IHDR width/height are 1200/630. `pnpm typecheck` accepts `Buffer` as font `data`.
  7. `<img>` in `<noscript>` triggers `@next/next/no-img-element`, which fails `--max-warnings=0`.

## Decisions

### D1. Two new capabilities, no modified ones
- **Decision**: new specs `seo-metadata` and `analytics`; no delta for existing capabilities.
- **Why**: no existing requirement changes. `lang="ru"` (design-system), static `/` (landing-page) and the env template rule (dev-workflow) stay true. Keeping deltas out of `landing-page` and `dev-workflow` avoids colliding with `add-lead-form`, which modifies both.
- **Rejected**: modifying `dev-workflow` «Шаблон переменных окружения» to list variables (that requirement does not enumerate variables, and the env template content is specified in `analytics`).
- **Affects**: `specs/`.

### D2. Site URL: explicit env, then Vercel production domain, then localhost (Assumed)
- **Decision**: `resolveSiteUrl` uses the origin of `NEXT_PUBLIC_SITE_URL`, then `https://${VERCEL_PROJECT_PRODUCTION_URL}`, then `http://localhost:3000`. An invalid explicit value throws.
- **Why**: link previews need absolute URLs. If `NEXT_PUBLIC_SITE_URL` is forgotten in Vercel (task 12), the system variable still gives the production domain instead of `localhost`. A typo must fail the build instead of shipping broken previews.
- **Rejected**: `VERCEL_URL` (a per-deployment URL, wrong for canonical); keeping the silent `localhost` fallback only (breaks previews on Vercel).
- **Affects**: `src/lib/site.ts`.

### D3. Metadata built by pure functions in `src/lib/seo.ts`, texts in `src/data/seo.ts`
- **Decision**: `buildSiteMetadata(baseUrl)`, `buildRobots(baseUrl)` and `buildSitemap(baseUrl)` are pure functions. `layout.tsx`, `robots.ts` and `sitemap.ts` call them with `siteUrl`. Texts live in a new `src/data/seo.ts`.
- **Why**: pure builders are unit-testable in Node without importing `layout.tsx`, which imports `next/font/google` and does not load in Vitest. A separate data file avoids editing `src/data/content.ts`, which `add-lead-form` is changing.
- **Rejected**: metadata inline in `layout.tsx` (untestable); adding an `seo` key to `content.ts` (merge conflict with `add-lead-form`).
- **Affects**: `src/data/seo.ts`, `src/lib/seo.ts`, `src/app/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`.

### D4. Preview image generated with `ImageResponse` and `@fontsource` WOFF fonts (user decision)
- **Decision**: `src/app/opengraph-image.tsx` renders a typographic card with `ImageResponse` from `next/og`. Fonts come from `@fontsource/lora` 5.3.0 (`lora-latin-700-normal.woff`, `lora-cyrillic-700-normal.woff`) and `@fontsource/golos-text` 5.3.0 (`golos-text-latin-400-normal.woff`, `golos-text-cyrillic-400-normal.woff`). Each subset has its own family name (Context, prototype 1).
- **Why**: the same families as the site (design-system: exactly two families). `ImageResponse` accepts only ttf/otf/woff, not woff2, and `next/font` files are not readable. Fontsource ships static WOFF per subset under SIL OFL, versioned through the lockfile.
- **Rejected**: a static JPG cropped from the hero (user chose generation); a hero photo inside the card (Satori does not decode WebP); committing font files to the repo (unversioned binary blobs); variable TTF from Google Fonts GitHub (Satori renders only the default instance).
- **Affects**: `src/app/opengraph-image.tsx`, `src/lib/og.ts`, `package.json`.

### D5. Fonts are read at module level with top-level `await`
- **Decision**: `src/lib/og.ts` exports `ogFonts` computed with top-level `await readFile(join(process.cwd(), 'node_modules', ...))`. Image routes pass `ogFonts` synchronously.
- **Why**: reading inside the route function makes the route dynamic under `cacheComponents` (Context, prototype 2). Module-level reads happen once at build and keep all image routes `○`. The pattern matches the Next docs example for `opengraph-image`.
- **Rejected**: `'use cache'` on a font loader (serializes `Buffer` to `Uint8Array`, which needs an extra conversion and adds a cache layer for constant data); `require.resolve` of font paths (depends on package `exports` maps).
- **Affects**: `src/lib/og.ts`, `src/app/opengraph-image.tsx`, `src/app/icon.tsx`, `src/app/apple-icon.tsx`.

### D6. Fontsource packages are runtime dependencies (Assumed)
- **Decision**: `@fontsource/lora` and `@fontsource/golos-text` go to `dependencies` with exact versions `5.3.0`.
- **Why**: the image route modules read them. If a route is ever re-generated on the server, the files must be present in production installs.
- **Rejected**: `devDependencies` (works only while every image route stays prerendered).
- **Affects**: `package.json`.

### D7. Brand colors for images are duplicated in `OG_COLORS`
- **Decision**: `src/lib/og.ts` exports `OG_COLORS` with hex values that mirror `--espresso`, `--espresso-foreground`, `--accent` and `--accent-foreground` from `src/app/globals.css`, with a comment naming the source tokens.
- **Why**: `ImageResponse` renders outside the browser and cannot read CSS variables. The design-system ban on color literals covers `src/components/**` only, and these files live in `src/lib` and `src/app`.
- **Rejected**: parsing `globals.css` at build (fragile, and adds a CSS parser for four values).
- **Affects**: `src/lib/og.ts`.

### D8. Generated PNG icons replace the scaffold favicon
- **Decision**: delete `src/app/favicon.ico`; add `src/app/icon.tsx` (32×32) and `src/app/apple-icon.tsx` (180×180) with the letter «К».
- **Why**: the scaffold icon is the Next.js logo, not the brand. Generating icons reuses the font and color setup from D4–D7 and avoids binary `.ico` tooling. Browsers use the `<link rel="icon">` tag, so they do not request `/favicon.ico`.
- **Rejected**: a hand-made `favicon.ico` (needs an external editor, and the executor cannot produce it); an SVG icon with `<text>` (renders with the visitor's system font).
- **Affects**: `src/app/favicon.ico`, `src/app/icon.tsx`, `src/app/apple-icon.tsx`.

### D9. JSON-LD type `LocalBusiness`, derived from site data (Assumed)
- **Decision**: one `LocalBusiness` object built by `buildLocalBusinessJsonLd(baseUrl)` from `siteData`, `images.hero` and `seoContent`. Hours and address are parsed from the existing strings. A format mismatch throws, so the build fails.
- **Why**: the workshop sells beans with pickup and delivery and has no seating, so `CafeOrCoffeeShop` would mislead. Deriving values keeps a single source of truth; a throw catches data edits that would silently emit wrong hours.
- **Rejected**: `CafeOrCoffeeShop`/`Store` (see above); hard-coding hours and address in the JSON-LD (drift from `site.ts`); the `schema-dts` package (types only, one object).
- **Affects**: `src/lib/structured-data.ts`, `src/components/structured-data.tsx`, `src/app/layout.tsx`.

### D10. Analytics: Yandex Metrika (opt-in) plus Vercel Web Analytics and Speed Insights (user decision)
- **Decision**: `src/components/site-analytics.tsx` always renders `<Analytics />` from `@vercel/analytics/next` 2.0.1 and `<SpeedInsights />` from `@vercel/speed-insights/next` 2.0.0. It renders the Metrika inline `next/script` and the `<noscript>` pixel only when `parseYandexMetrikaId(process.env.NEXT_PUBLIC_YM_ID)` returns a number.
- **Why**: the audience comes from Belarus and Yandex ads, so Metrika is the useful counter. Vercel tools cost nothing on the hosting the project targets. Strict digit validation keeps arbitrary env text out of an inline script.
- **Rejected**: GA4 (user decision; adds another heavy script); `@next/third-parties` (has no Metrika component).
- **Affects**: `src/components/site-analytics.tsx`, `src/lib/yandex-metrika.ts`, `package.json`, `.env.example`.

### D11. Metrika loads with `lazyOnload`, without Webvisor (Assumed)
- **Decision**: `strategy="lazyOnload"` and init options `{clickmap:true,trackLinks:true,accurateTrackBounce:true}`.
- **Why**: the Lighthouse mobile score is a deliverable, and `tag.js` is a large script. `lazyOnload` moves it after the `load` event. Webvisor records sessions, which costs CPU and raises privacy questions the brief does not ask for.
- **Rejected**: `afterInteractive` (competes with hydration on slow phones); Webvisor on.
- **Affects**: `src/components/site-analytics.tsx`, `src/lib/yandex-metrika.ts`.

### D12. One justified `eslint-disable-next-line` for the Metrika pixel
- **Decision**: the `<img>` inside `<noscript>` gets `{/* eslint-disable-next-line @next/next/no-img-element -- пиксель Метрики для посетителей без JavaScript: next/image здесь не нужен */}`. This is the only disable comment in the change.
- **Why**: a tracking pixel must be a plain 1×1 request without the image optimizer. `next/image` would add attributes and inline styles and route the request through `/_next/image`.
- **Rejected**: `next/image` with `unoptimized` (changes the markup required by the spec and still adds lazy loading); dropping the pixel (spec requires it).
- **Affects**: `src/components/site-analytics.tsx`.

## File Structure

| Path | Action | Purpose | Wired in |
|---|---|---|---|
| `package.json` | modify | add four runtime dependencies | — |
| `pnpm-lock.yaml` | modify | lockfile update by `pnpm add` | — |
| `src/data/seo.ts` | create | SEO, preview and icon texts | imported by `src/lib/seo.ts`, `src/lib/structured-data.ts`, `src/app/opengraph-image.tsx`, `src/app/icon.tsx`, `src/app/apple-icon.tsx` |
| `src/lib/site.ts` | modify | add `resolveSiteUrl`, `SiteUrlEnv`, `LOCAL_SITE_URL`; `siteUrl` uses it | existing imports keep working |
| `src/lib/site.test.ts` | create | tests for `resolveSiteUrl` | Vitest include `src/**/*.test.ts` |
| `src/lib/seo.ts` | create | `buildSiteMetadata`, `buildRobots`, `buildSitemap`, `siteMetadata` | imported by `src/app/layout.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts` |
| `src/lib/seo.test.ts` | create | tests for the builders | Vitest |
| `src/lib/structured-data.ts` | create | `parseHoursRange`, `splitAddress`, `buildLocalBusinessJsonLd`, `serializeJsonLd` | imported by `src/components/structured-data.tsx` |
| `src/lib/structured-data.test.ts` | create | tests for the JSON-LD helpers | Vitest |
| `src/lib/og.ts` | create | `OG_COLORS`, `OG_HEADING_FONT`, `OG_TEXT_FONT`, `OgFont`, `ogFonts` | imported by the three image routes |
| `src/lib/og-images.test.ts` | create | PNG format tests for the three image routes | Vitest |
| `src/lib/yandex-metrika.ts` | create | `YANDEX_METRIKA_SCRIPT_ID`, `YANDEX_METRIKA_TAG_URL`, `parseYandexMetrikaId`, `buildYandexMetrikaSnippet`, `getYandexMetrikaPixelUrl` | imported by `src/components/site-analytics.tsx` |
| `src/lib/yandex-metrika.test.ts` | create | tests for Metrika helpers | Vitest |
| `src/components/structured-data.tsx` | create | `StructuredData` server component with the JSON-LD script | rendered in `src/app/layout.tsx` |
| `src/components/site-analytics.tsx` | create | `SiteAnalytics` server component: Vercel + Metrika | rendered in `src/app/layout.tsx` |
| `src/app/opengraph-image.tsx` | create | 1200×630 preview image route | Next file convention (route `/opengraph-image`) |
| `src/app/icon.tsx` | create | 32×32 icon route | Next file convention (route `/icon`) |
| `src/app/apple-icon.tsx` | create | 180×180 Apple touch icon route | Next file convention (route `/apple-icon`) |
| `src/app/robots.ts` | create | `/robots.txt` | Next file convention |
| `src/app/sitemap.ts` | create | `/sitemap.xml` | Next file convention |
| `src/app/favicon.ico` | delete | scaffold icon removed | — |
| `src/app/layout.tsx` | modify | `metadata = siteMetadata`; render `StructuredData` and `SiteAnalytics` | root layout |
| `.env.example` | modify | remove `NEXT_PUBLIC_GA_ID`, rewrite comments for `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_YM_ID` | — |
| `README.md` | modify | add the section «Допущения для change "add-seo-og-analytics"» | — |

The change touches no other files.

## Contracts

### package.json

`pnpm add` writes these exact entries into `dependencies` (alphabetical order is kept by pnpm). No other key changes.

```json
{
  "dependencies": {
    "@fontsource/golos-text": "5.3.0",
    "@fontsource/lora": "5.3.0",
    "@vercel/analytics": "2.0.1",
    "@vercel/speed-insights": "2.0.0"
  }
}
```

Command: `pnpm add --save-exact @fontsource/lora@5.3.0 @fontsource/golos-text@5.3.0 @vercel/analytics@2.0.1 @vercel/speed-insights@2.0.0`.

### src/data/seo.ts

```ts
/** Тексты для метаданных страницы, превью ссылки, иконок и структурированных данных. */
export const seoContent = {
  title: 'Кварта — свежеобжаренный кофе с доставкой по Минску',
  description:
    'Обжариваем кофе по четвергам, в пятницу привозим по Минску — зерно приезжает на 1–3 день после обжарки. Подписка и разовые заказы.',
  foundingDate: '2019',
  ogImage: {
    alt: 'Кварта — кофе, который приезжает свежим',
    wordmark: 'КВАРТА',
    caption: 'Обжарка по четвергам, доставка по Минску в пятницу',
    badge: 'Минск · с 2019 года',
  },
  iconLetter: 'К',
} as const;
```

Invariants: `description.length === 130`; `·` is U+00B7, `—` is U+2014, `–` is U+2013. Strings are copied verbatim.

### src/lib/site.ts

```ts
// Модуль с адресом и названием сайта.
// siteUrl: NEXT_PUBLIC_SITE_URL → домен продакшена Vercel → localhost.

import { siteData } from '@/data/site';

export interface SiteUrlEnv {
  NEXT_PUBLIC_SITE_URL?: string;
  VERCEL_PROJECT_PRODUCTION_URL?: string;
}

export const LOCAL_SITE_URL = 'http://localhost:3000';

/** Абсолютный адрес сайта без завершающего слеша; см. Algorithms / resolveSiteUrl. */
export function resolveSiteUrl(env: SiteUrlEnv): string;

const siteUrl = resolveSiteUrl({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
});
const siteName = siteData.name;

export { siteUrl, siteName };
```

Errors (verbatim): `new Error(\`NEXT_PUBLIC_SITE_URL должен быть абсолютным URL с http:// или https://, получено: "${raw}"\`)`, where `raw` is the trimmed value.

Invariants: the result never ends with `/` and always starts with `http://` or `https://`. `process.env` is read with literal property names (each `process.env.NAME` written out), not by passing `process.env` as an object.

### src/lib/seo.ts

```ts
import type { Metadata, MetadataRoute } from 'next';
import { seoContent } from '@/data/seo';
import { siteName, siteUrl } from '@/lib/site';

/** Метаданные корневого layout: title, description, canonical, robots, Open Graph, Twitter. */
export function buildSiteMetadata(baseUrl: string): Metadata;

/** Содержимое /robots.txt. */
export function buildRobots(baseUrl: string): MetadataRoute.Robots;

/** Содержимое /sitemap.xml: одна главная страница. */
export function buildSitemap(baseUrl: string): MetadataRoute.Sitemap;

export const siteMetadata: Metadata = buildSiteMetadata(siteUrl);
```

Exact return values (`baseUrl` = `https://kvarta.example` in the examples):

```ts
// buildSiteMetadata
{
  metadataBase: new URL(baseUrl),
  title: seoContent.title,
  description: seoContent.description,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: '/',
    siteName,
    title: seoContent.title,
    description: seoContent.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: seoContent.title,
    description: seoContent.description,
  },
}

// buildRobots
{ rules: { userAgent: '*', allow: '/' }, sitemap: `${baseUrl}/sitemap.xml` }

// buildSitemap
[{ url: `${baseUrl}/`, changeFrequency: 'monthly', priority: 1 }]
```

Invariants: no `images` key in `openGraph` or `twitter` (they come from `opengraph-image.tsx`); no `lastModified` in the sitemap (time-dependent values break static prerendering).

### src/lib/structured-data.ts

```ts
import { images } from '@/data/images';
import { seoContent } from '@/data/seo';
import { siteData } from '@/data/site';
import { siteName } from '@/lib/site';

export interface OpeningHours {
  /** 'HH:MM', часы дополнены нулём до двух цифр */
  opens: string;
  closes: string;
}

export interface SplitAddress {
  locality: string;
  streetAddress: string;
}

/** Объект schema.org для <script type="application/ld+json">. */
export type JsonLd = Record<string, unknown>;

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
export const WEEKEND = ['Saturday', 'Sunday'] as const;

/** '8:00–20:00' → { opens: '08:00', closes: '20:00' } */
export function parseHoursRange(value: string): OpeningHours;

/** ('Минск, ул. Короля, 9', 'Минск') → { locality: 'Минск', streetAddress: 'ул. Короля, 9' } */
export function splitAddress(address: string, city: string): SplitAddress;

/** LocalBusiness мастерской; все значения — из siteData, images, seoContent. */
export function buildLocalBusinessJsonLd(baseUrl: string): JsonLd;

/** JSON.stringify с заменой каждого '<' на '<'. */
export function serializeJsonLd(data: unknown): string;
```

Errors (verbatim):
- `parseHoursRange`: `new Error(\`Неверный формат часов работы: "${value}", ожидается "8:00–20:00"\`)`, where `value` is the argument as passed (not trimmed).
- `splitAddress`: `new Error(\`Адрес "${address}" должен начинаться с "${city}, "\`)`.

Result of `buildLocalBusinessJsonLd('https://kvarta.example')` with the current data. This is the exact object; the test compares with `toEqual`:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://kvarta.example/#business",
  "name": "Кварта",
  "description": "Обжариваем кофе по четвергам, в пятницу привозим по Минску — зерно приезжает на 1–3 день после обжарки. Подписка и разовые заказы.",
  "url": "https://kvarta.example/",
  "image": "https://kvarta.example/images/hero.webp",
  "telephone": "+375291234567",
  "email": "hello@example.com",
  "foundingDate": "2019",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ул. Короля, 9",
    "addressLocality": "Минск",
    "addressCountry": "BY"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 53.902189, "longitude": 27.542084 },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "20:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday", "Sunday"],
      "opens": "10:00",
      "closes": "18:00"
    }
  ],
  "areaServed": { "@type": "City", "name": "Минск" }
}
```

Invariants: `dayOfWeek` arrays are fresh copies (`[...WEEKDAYS]`), not the readonly constants; `addressCountry` is the literal `'BY'`.

### src/lib/og.ts

```ts
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Копия токенов из src/app/globals.css: --espresso, --espresso-foreground, --accent, --accent-foreground. */
export const OG_COLORS = {
  background: '#1f1a14',
  foreground: '#f1ede3',
  accent: '#cae18a',
  accentForeground: '#1a1814',
} as const;

/** Латиница и кириллица — разные семейства: Satori берёт один шрифт на имя семейства. */
export const OG_HEADING_FONT = 'Lora, Lora Cyrillic';
export const OG_TEXT_FONT = 'Golos Text, Golos Text Cyrillic';

export interface OgFont {
  name: 'Lora' | 'Lora Cyrillic' | 'Golos Text' | 'Golos Text Cyrillic';
  data: Buffer;
  weight: 400 | 700;
  style: 'normal';
}

/** Шрифты для ImageResponse; читаются один раз при загрузке модуля (top-level await). */
export const ogFonts: OgFont[] = [
  { name: 'Lora', data: await readFontsource('lora', 'lora-latin-700-normal.woff'), weight: 700, style: 'normal' },
  { name: 'Lora Cyrillic', data: await readFontsource('lora', 'lora-cyrillic-700-normal.woff'), weight: 700, style: 'normal' },
  { name: 'Golos Text', data: await readFontsource('golos-text', 'golos-text-latin-400-normal.woff'), weight: 400, style: 'normal' },
  { name: 'Golos Text Cyrillic', data: await readFontsource('golos-text', 'golos-text-cyrillic-400-normal.woff'), weight: 400, style: 'normal' },
];

/** node_modules/@fontsource/<pkg>/files/<file> относительно корня проекта. */
function readFontsource(pkg: string, file: string): Promise<Buffer>;
```

`readFontsource` is a non-exported function declaration (hoisted, so the top-level `await` lines may call it before its text position). Body: `return readFile(join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', file));`.

Invariants: exactly four entries in this order; a missing file rejects with the Node `ENOENT` error and fails the build or the test import.

### src/app/opengraph-image.tsx

```tsx
import { ImageResponse } from 'next/og';
import { content } from '@/data/content';
import { seoContent } from '@/data/seo';
import { OG_COLORS, OG_HEADING_FONT, OG_TEXT_FONT, ogFonts } from '@/lib/og';

export const alt = seoContent.ogImage.alt;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Картинка превью ссылки 1200×630: логотип, заголовок hero, подпись и плашка. */
export default function Image(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: OG_COLORS.background,
          color: OG_COLORS.foreground,
        }}
      >
        <div style={{ fontFamily: OG_HEADING_FONT, fontWeight: 700, fontSize: 40, letterSpacing: 6 }}>
          {seoContent.ogImage.wordmark}
        </div>
        <div
          style={{
            fontFamily: OG_HEADING_FONT,
            fontWeight: 700,
            fontSize: 80,
            lineHeight: 1.05,
            maxWidth: 900,
          }}
        >
          {content.hero.headline}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 32,
            fontFamily: OG_TEXT_FONT,
            fontWeight: 400,
            fontSize: 32,
          }}
        >
          <div>{seoContent.ogImage.caption}</div>
          <div
            style={{
              flexShrink: 0,
              padding: '12px 24px',
              borderRadius: 999,
              background: OG_COLORS.accent,
              color: OG_COLORS.accentForeground,
            }}
          >
            {seoContent.ogImage.badge}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: ogFonts },
  );
}
```

Invariants: no `async`, no `readFile`, no request-time API in this file (static route, D5). `display: 'flex'` on every `div` with more than one child (Satori requirement).

### src/app/icon.tsx

```tsx
import { ImageResponse } from 'next/og';
import { seoContent } from '@/data/seo';
import { OG_COLORS, OG_HEADING_FONT, ogFonts } from '@/lib/og';

export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

/** Иконка вкладки 32×32: буква «К» на тёмном фоне. */
export default function Icon(): ImageResponse {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 6,
          background: OG_COLORS.background,
          color: OG_COLORS.foreground,
          fontFamily: OG_HEADING_FONT,
          fontWeight: 700,
          fontSize: 24,
        }}
      >
        {seoContent.iconLetter}
      </div>
    ),
    { ...size, fonts: ogFonts },
  );
}
```

### src/app/apple-icon.tsx

Same code as `src/app/icon.tsx` with these differences only: `size = { width: 180, height: 180 }`; function name `AppleIcon`; JSDoc `/** Иконка для iOS 180×180: буква «К» на тёмном фоне; углы скругляет система. */`; no `borderRadius` key; `fontSize: 120`.

### src/app/robots.ts

```ts
import type { MetadataRoute } from 'next';
import { buildRobots } from '@/lib/seo';
import { siteUrl } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return buildRobots(siteUrl);
}
```

Served body for `siteUrl` `https://kvarta.example`:

```txt
User-Agent: *
Allow: /

Sitemap: https://kvarta.example/sitemap.xml
```

### src/app/sitemap.ts

```ts
import type { MetadataRoute } from 'next';
import { buildSitemap } from '@/lib/seo';
import { siteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap(siteUrl);
}
```

### src/lib/yandex-metrika.ts

```ts
export const YANDEX_METRIKA_SCRIPT_ID = 'yandex-metrika';
export const YANDEX_METRIKA_TAG_URL = 'https://mc.yandex.ru/metrika/tag.js';

/** ' 12345678 ' → 12345678; всё, кроме 1–12 цифр после trim, → null (счётчик выключен). */
export function parseYandexMetrikaId(raw: string | undefined): number | null;

/** Код счётчика Метрики для inline-скрипта; без Webvisor. */
export function buildYandexMetrikaSnippet(id: number): string;

/** 12345678 → 'https://mc.yandex.ru/watch/12345678' */
export function getYandexMetrikaPixelUrl(id: number): string;
```

`buildYandexMetrikaSnippet(12345678)` returns exactly this single line (no line breaks, no leading or trailing whitespace):

```js
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(12345678,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});
```

It is built as a template literal in which `https://mc.yandex.ru/metrika/tag.js` is `${YANDEX_METRIKA_TAG_URL}` and `12345678` is `${id}`.

### src/components/structured-data.tsx

```tsx
import { siteUrl } from '@/lib/site';
import { buildLocalBusinessJsonLd, serializeJsonLd } from '@/lib/structured-data';

/** JSON-LD мастерской для поисковиков; обычный <script>, а не next/script — это данные, не код. */
export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(buildLocalBusinessJsonLd(siteUrl)) }}
    />
  );
}
```

### src/components/site-analytics.tsx

```tsx
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import {
  YANDEX_METRIKA_SCRIPT_ID,
  buildYandexMetrikaSnippet,
  getYandexMetrikaPixelUrl,
  parseYandexMetrikaId,
} from '@/lib/yandex-metrika';

/** Счётчики: Vercel Analytics и Speed Insights всегда, Яндекс.Метрика — только при валидном NEXT_PUBLIC_YM_ID. */
export function SiteAnalytics() {
  const ymId = parseYandexMetrikaId(process.env.NEXT_PUBLIC_YM_ID);

  return (
    <>
      <Analytics />
      <SpeedInsights />
      {ymId !== null && (
        <>
          <Script id={YANDEX_METRIKA_SCRIPT_ID} strategy="lazyOnload">
            {buildYandexMetrikaSnippet(ymId)}
          </Script>
          <noscript>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element -- пиксель Метрики для посетителей без JavaScript: next/image здесь не нужен */}
              <img
                src={getYandexMetrikaPixelUrl(ymId)}
                style={{ position: 'absolute', left: '-9999px' }}
                alt=""
              />
            </div>
          </noscript>
        </>
      )}
    </>
  );
}
```

Rendered pixel markup (verified on the prototype): `<noscript><div><img src="https://mc.yandex.ru/watch/12345678" style="position:absolute;left:-9999px" alt=""/></div></noscript>`.

Invariants: server component (no `'use client'`); reads only `process.env.NEXT_PUBLIC_YM_ID`; no color literals.

### src/app/layout.tsx

Full file after the change:

```tsx
import type { Metadata } from 'next';
import { lora, golosText } from '@/lib/fonts';
import './globals.css';
import { siteMetadata } from '@/lib/seo';
import { Toaster } from '@/components/ui/sonner';
import { SiteAnalytics } from '@/components/site-analytics';
import { StructuredData } from '@/components/structured-data';

export const metadata: Metadata = siteMetadata;

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="ru" className={`${lora.variable} ${golosText.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StructuredData />
        {children}
        <Toaster />
        <SiteAnalytics />
      </body>
    </html>
  );
}
```

### .env.example

Replace the first block and the two analytics blocks; keep the Upstash and Telegram blocks unchanged. The resulting file:

```dotenv
# Адрес сайта для canonical, превью ссылок, robots.txt и sitemap.xml, например https://kvarta.vercel.app
# Пусто: на Vercel берётся домен продакшена, локально — http://localhost:3000
NEXT_PUBLIC_SITE_URL=

# Upstash Redis (задача 06)
KV_REST_API_URL=
KV_REST_API_TOKEN=

# Telegram уведомления (задача 08)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Яндекс.Метрика: номер счётчика, только цифры. Пусто — счётчик не подключается
NEXT_PUBLIC_YM_ID=
```

The line `# Управление проектом (задача 01/09)` and the `NEXT_PUBLIC_GA_ID` block are removed.

### README.md

Insert this section directly after the section `### Допущения для change "add-landing-sections"` and its list, before `## Development`. If `add-lead-form` has already added its own `### Допущения для change "add-lead-form"` section there, insert after that section instead. Text verbatim:

```markdown
### Допущения для change "add-seo-og-analytics"

- **Адрес сайта**: canonical, превью ссылок, `robots.txt` и `sitemap.xml` берут адрес из `NEXT_PUBLIC_SITE_URL`; на Vercel без этой переменной — из домена продакшена (`VERCEL_PROJECT_PRODUCTION_URL`).
- **Картинка превью**: генерируется кодом при сборке из фирменных цветов и шрифтов Lora и Golos Text (пакеты `@fontsource`, SIL OFL), без фото.
- **Тип в schema.org**: `LocalBusiness`, а не кафе — в мастерской нет посадки.
- **Яндекс.Метрика**: без Вебвизора и без цели на отправку заявки; подключается, только если задан `NEXT_PUBLIC_YM_ID`.
- **GA4**: не подключён — аудитория из Беларуси, реклама в Яндексе и Instagram.
- **Preview-деплои Vercel**: не закрыты от индексации; canonical указывает на продакшен.
```

## Algorithms

### resolveSiteUrl
Input: `env: SiteUrlEnv`. Output: `string`.
1. Let `raw = (env.NEXT_PUBLIC_SITE_URL ?? '').trim()`.
2. If `raw !== ''`:
   1. Try `const url = new URL(raw)`. If the constructor throws, throw the error from «Contracts / src/lib/site.ts» with `raw`.
   2. If `url.protocol` is neither `'http:'` nor `'https:'`, throw the same error with `raw`.
   3. Return `url.origin`.
3. Let `host = (env.VERCEL_PROJECT_PRODUCTION_URL ?? '').trim()`.
4. If `host !== ''`, return `` `https://${host}` ``.
5. Return `LOCAL_SITE_URL`.

### parseHoursRange
Input: `value: string`. Output: `OpeningHours`.
1. Match `value.trim()` against `/^(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})$/u`.
2. If there is no match, throw the error from «Contracts / src/lib/structured-data.ts» with the original `value`.
3. Convert the four groups to numbers `oh`, `om`, `ch`, `cm`.
4. If `oh > 23` or `ch > 23` or `om > 59` or `cm > 59`, throw the same error.
5. Return `{ opens: `${String(oh).padStart(2, '0')}:${String(om).padStart(2, '0')}`, closes: <same for ch, cm> }`.

### splitAddress
Input: `address: string`, `city: string`. Output: `SplitAddress`.
1. Let `prefix = `${city}, ``.
2. If `!address.startsWith(prefix)`, throw the error from «Contracts / src/lib/structured-data.ts».
3. Let `streetAddress = address.slice(prefix.length).trim()`.
4. If `streetAddress === ''`, throw the same error.
5. Return `{ locality: city, streetAddress }`.

### buildLocalBusinessJsonLd
Input: `baseUrl: string`. Output: `JsonLd`.
1. `const { locality, streetAddress } = splitAddress(siteData.address, siteData.delivery.city)`.
2. `const weekday = parseHoursRange(siteData.hours.weekday)`; `const weekend = parseHoursRange(siteData.hours.weekend)`.
3. `const telephone = siteData.phone.replace(/[^\d+]/g, '')`.
4. Return the object from «Contracts / src/lib/structured-data.ts» with: `'@id': `${baseUrl}/#business``, `name: siteName`, `description: seoContent.description`, `url: `${baseUrl}/``, `image: `${baseUrl}${images.hero.src}``, `telephone`, `email: siteData.email`, `foundingDate: seoContent.foundingDate`, address with `streetAddress`, `addressLocality: locality`, `addressCountry: 'BY'`, geo with `latitude: siteData.geo.lat`, `longitude: siteData.geo.lon`, two opening-hours entries (`dayOfWeek: [...WEEKDAYS]` with `weekday`, `dayOfWeek: [...WEEKEND]` with `weekend`), `areaServed: { '@type': 'City', name: siteData.delivery.city }`.

### parseYandexMetrikaId
Input: `raw: string | undefined`. Output: `number | null`.
1. If `raw === undefined`, return `null`.
2. Let `value = raw.trim()`.
3. If `!/^\d{1,12}$/.test(value)`, return `null`.
4. Return `Number(value)`.

Trivial, free implementation: `serializeJsonLd` (`JSON.stringify(data).replace(/</g, '\\u003c')`), `getYandexMetrikaPixelUrl`, `buildYandexMetrikaSnippet` (template literal from the contract), `buildSiteMetadata`, `buildRobots`, `buildSitemap` (return the literals from the contract).

## Examples

- Pure helper with a one-line JSDoc example in Russian: `src/lib/format.ts:11-14` (`toTelHref`); follow this style for every exported function.
- Test style: `src/lib/phone.test.ts:1-8` — `import { describe, expect, it } from 'vitest'`, a `// @scenario: <name>` line above each `it`.
- Image routes and font handling: «Contracts / src/app/opengraph-image.tsx» and «Contracts / src/lib/og.ts» (shape verified on the prototype).
- Reading a PNG size in a test (IHDR chunk: width at byte 16, height at byte 20, big-endian):

```ts
const response = await OpenGraphImage();
expect(response.headers.get('content-type')).toBe('image/png');
const png = Buffer.from(await response.arrayBuffer());
expect(png.readUInt32BE(16)).toBe(1200);
expect(png.readUInt32BE(20)).toBe(630);
```

- Testing `resolveSiteUrl` without touching `process.env`: pass the env object directly, e.g. `resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: '  https://kvarta.example/landing/  ', VERCEL_PROJECT_PRODUCTION_URL: 'kvarta.vercel.app' })`.
- Comparing metadata: `metadataBase` is a `URL`; check `metadata.metadataBase?.href` equals `'https://kvarta.example/'` and compare the rest with `expect(metadata).toMatchObject({ ...without metadataBase })`.

## Conventions

- Code comments and JSDoc in Russian, short, as in `src/lib/format.ts` and `src/lib/yandex-map.ts`. Identifiers in English.
- Named exports for modules in `src/lib`, `src/data` and `src/components`. Default exports only where Next file conventions require them (`opengraph-image.tsx`, `icon.tsx`, `apple-icon.tsx`, `robots.ts`, `sitemap.ts`).
- Imports use the `@/` alias.
- Tests live next to the module as `src/lib/<name>.test.ts`, use `describe`/`it`/`expect` from `vitest`, and put `// @scenario: <exact scenario name>` directly above every `it` that checks a spec scenario. `.skip`, `.only` and `.todo` are forbidden.
- Errors: plain `Error` with the exact Russian message from Contracts; no custom error classes; no `console.*` in this change.
- Formatting: Prettier config `.prettierrc.json` (single quotes, semicolons, trailing commas, width 100). Run `pnpm exec prettier --write <files>` on touched files.

## Don'ts

- Do not edit `src/app/page.tsx`, `src/data/content.ts`, `src/data/site.ts`, `src/data/images.ts`, `src/lib/fonts.ts`, `src/app/globals.css`, `next.config.ts`, any file in `src/components/sections/`, or any file listed in `openspec/changes/add-lead-form/proposal.md` «Impact» except `package.json`, `pnpm-lock.yaml` and `README.md`.
- Do not add dependencies other than the four in «Contracts / package.json». In particular: no `@next/third-parties`, `schema-dts`, `next-seo`, `react-yandex-metrika`, `serialize-javascript`.
- Do not connect Google Analytics / GA4 and do not keep `NEXT_PUBLIC_GA_ID`.
- Do not read files or call `fetch` inside the default export of an image route; do not mark image routes `async`; do not add `export const dynamic`, `revalidate` or `runtime` to any new route file.
- Do not use `new Date()`, `Date.now()` or `lastModified` in the sitemap or anywhere in the new modules.
- Do not use `next/script` for JSON-LD; do not use a raw `<script>` for Metrika.
- Do not enable Webvisor (`webvisor`) in the Metrika init.
- Do not add `'use client'` to `site-analytics.tsx` or `structured-data.tsx`.
- Do not use color literals in `src/components/**` (design-system rule). Hex colors are allowed only in `src/lib/og.ts`.
- The only allowed `eslint-disable` comment is the one in «Contracts / src/components/site-analytics.tsx» (D12).
- Do not put `openGraph.images` or `twitter.images` in metadata; they come from `opengraph-image.tsx`.
- Do not add `twitter-image.*` files; Next emits `twitter:image` from `opengraph-image` (Context, prototype 3).

## Edge Cases

| Scenario (spec) | Handled in | Result |
|---|---|---|
| «Explicit site URL» | `src/lib/site.ts` `resolveSiteUrl` | origin `https://kvarta.example` |
| «Vercel production domain fallback» | `resolveSiteUrl` | `https://kvarta.vercel.app` |
| «Local fallback» | `resolveSiteUrl` | `http://localhost:3000`; build passes |
| «Invalid explicit site URL» | `resolveSiteUrl` | throws the exact error; build fails at module import |
| «Title, description and robots in HTML» | `src/lib/seo.ts` `buildSiteMetadata` via `layout.tsx` | tags in HTML |
| «Description length» | `src/data/seo.ts` | 130 characters |
| «Open Graph tags in HTML» | `buildSiteMetadata` + `src/app/opengraph-image.tsx` | `og:*` tags with image size and alt |
| «Twitter card in HTML» | `buildSiteMetadata` + `opengraph-image.tsx` | `twitter:*` tags |
| «Preview in a messenger» | `opengraph-image.tsx`, `buildSiteMetadata` | Telegram preview (manual) |
| «Preview image format» | `opengraph-image.tsx` `Image` | PNG 1200×630 |
| «Preview image is static» | `src/lib/og.ts` top-level `await` (D5) | `○ /opengraph-image` |
| «Preview image content» | `opengraph-image.tsx`, `src/lib/og.ts` font names | Cyrillic in Lora/Golos (manual) |
| «Icon links in HTML» | `src/app/icon.tsx`, `src/app/apple-icon.tsx` | `<link rel="icon">`, `<link rel="apple-touch-icon">` |
| «Icon formats» | `Icon`, `AppleIcon` | PNG 32×32 and 180×180 |
| «Scaffold favicon removed» | deletion of `src/app/favicon.ico` | 404 |
| «robots.txt content» | `buildRobots` via `src/app/robots.ts` | exact body |
| «sitemap.xml content» | `buildSitemap` via `src/app/sitemap.ts` | one `<url>`, no `<lastmod>` |
| «LocalBusiness fields» | `buildLocalBusinessJsonLd` | exact object |
| «JSON-LD in HTML» | `src/components/structured-data.tsx` in `layout.tsx` | one `ld+json` script |
| «Escaping in JSON-LD» | `serializeJsonLd` | `<` instead of `<` |
| «Invalid opening hours in site data» | `parseHoursRange` | throws exact error |
| «Address without the city prefix» | `splitAddress` | throws exact error |
| «Build route table» | D5, no request-time APIs | all six routes `○` |
| «README assumptions» | `README.md` | section with six items |
| «Valid counter ID» | `parseYandexMetrikaId` | `12345678` |
| «Missing or invalid counter ID» | `parseYandexMetrikaId`, `SiteAnalytics` | `null`, nothing rendered, build passes |
| «Counter code for an ID» | `buildYandexMetrikaSnippet` | exact snippet, no `webvisor` |
| «Counter present in the built page» | `SiteAnalytics` | `yandex-metrika`, `ym(12345678,'init'`, noscript pixel in HTML |
| «Counter loads in the browser» | `SiteAnalytics` (`lazyOnload`) | `tag.js` after `load`, `window.ym` defined (manual) |
| «Counter disabled» | `SiteAnalytics` | no Metrika markup, no `mc.yandex.ru` requests |
| «Metrika blocked by the browser» | no site code depends on `window.ym` | page works (manual) |
| «Vercel scripts on the deployed site» | `SiteAnalytics` | `/_vercel/*` scripts 200 (manual, after task 12) |
| «Route stays static with analytics» | Vercel components self-wrap in `Suspense` (Context, prototype 5) | `○ /` |
| «Environment template content» | `.env.example` | two documented variables, no GA |

Outside the specs: running `pnpm start` locally (not on Vercel) makes `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` return 404 in the console. That is expected and harmless; the scripts exist only on Vercel deployments.
