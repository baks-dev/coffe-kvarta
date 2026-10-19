# Proposal

## Why

Most visitors arrive from Instagram and Yandex ads, and the link to the site is shared in Telegram and WhatsApp. Today such a link shows no preview: `src/app/layout.tsx` sets only `title: 'Кварта'` and `description: 'Лендинг кофейни Кварта'`, with no Open Graph or Twitter tags and no preview image. The browser tab shows the default Next.js icon (`src/app/favicon.ico` from the scaffold). `/robots.txt` and `/sitemap.xml` return 404. Search engines get no structured data about the workshop: address, hours and phone. The site also records no visits, so it is impossible to tell which ads bring traffic. The brief lists the link preview (image, title, description) as a plus. Task 09 covers SEO, previews and analytics and depends only on the finished landing sections.

## What Changes

- Replace the page metadata with a Russian title «Кварта — свежеобжаренный кофе с доставкой по Минску», a description, a canonical URL, `robots: index, follow`, Open Graph tags (`website`, `ru_RU`, site name, URL) and a Twitter `summary_large_image` card.
- Generate a 1200×630 PNG preview image at build time: dark espresso background, the «КВАРТА» wordmark, the hero headline «Кофе, который приезжает свежим», a caption and an accent badge, set in Lora and Golos Text with Cyrillic glyphs. It is used for both `og:image` and `twitter:image`.
- Replace the scaffold favicon with generated brand icons: a 32×32 PNG `icon` and a 180×180 PNG `apple-icon` with the letter «К» on espresso.
- Serve `/robots.txt` that allows all crawlers and points to the sitemap, and `/sitemap.xml` with the home page URL.
- Embed JSON-LD `LocalBusiness` data in the page: name, description, URL, image, phone, email, address, coordinates, opening hours, founding year, area served. All of it comes from `src/data/site.ts`.
- Resolve the absolute site URL in this order: `NEXT_PUBLIC_SITE_URL`, then the Vercel production domain `VERCEL_PROJECT_PRODUCTION_URL`, then `http://localhost:3000`. An invalid `NEXT_PUBLIC_SITE_URL` fails the build with a clear message.
- Add Yandex Metrika, loaded only when `NEXT_PUBLIC_YM_ID` contains digits only. It loads during browser idle time and adds a `<noscript>` pixel.
- Add Vercel Web Analytics and Speed Insights.
- Update `.env.example`: remove the unused `NEXT_PUBLIC_GA_ID` and describe `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_YM_ID`.
- Add the README section «Допущения для change "add-seo-og-analytics"».

## Capabilities

### New Capabilities

- `seo-metadata`: how the site describes itself to search engines and link previews: page metadata, site URL resolution, the generated preview image and icons, `robots.txt`, `sitemap.xml` and JSON-LD structured data.
- `analytics`: visit and performance measurement: Yandex Metrika (opt-in by environment variable), Vercel Web Analytics and Speed Insights, and their loading constraints.

### Modified Capabilities

None. The page structure, sections and existing requirements in `landing-page`, `design-system`, `content-and-data` and `dev-workflow` keep their behavior. The route `/` stays fully static, and `<html lang="ru">` is unchanged.

## Out of Scope

- The analytics goal for a submitted lead (Metrika `reachGoal`). It needs the lead form from the in-progress change `add-lead-form` and will be added after it.
- Google Analytics 4 (user decision: Metrika plus Vercel only).
- Metrika Webvisor and session replay.
- A cookie consent banner.
- `noindex` for Vercel preview deployments.
- Pages other than `/`, i18n and `hreflang`.
- A web app manifest and PWA icons.
- Scroll animations, accessibility and Lighthouse tuning (task 10). Deployment and setting env variables in Vercel (task 12).
- Any change to section components in `src/components/sections/`, `src/app/page.tsx`, `src/data/content.ts` and the lead form files.

## Impact

- Capabilities: `seo-metadata` (new), `analytics` (new).
- New files: `src/data/seo.ts`, `src/lib/seo.ts`, `src/lib/seo.test.ts`, `src/lib/site.test.ts`, `src/lib/structured-data.ts`, `src/lib/structured-data.test.ts`, `src/lib/og.ts`, `src/lib/og-images.test.ts`, `src/lib/yandex-metrika.ts`, `src/lib/yandex-metrika.test.ts`, `src/components/structured-data.tsx`, `src/components/site-analytics.tsx`, `src/app/opengraph-image.tsx`, `src/app/icon.tsx`, `src/app/apple-icon.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`.
- Modified files: `src/lib/site.ts`, `src/app/layout.tsx`, `.env.example`, `README.md`, `package.json`, `pnpm-lock.yaml`.
- Deleted files: `src/app/favicon.ico`.
- Dependencies (runtime, exact versions): `@vercel/analytics` 2.0.1, `@vercel/speed-insights` 2.0.0, `@fontsource/lora` 5.3.0, `@fontsource/golos-text` 5.3.0.
- New routes, all prerendered at build time: `/opengraph-image`, `/icon`, `/apple-icon`, `/robots.txt`, `/sitemap.xml`. `/favicon.ico` is no longer served.
- Environment variables: `NEXT_PUBLIC_SITE_URL` (existing, now validated), `NEXT_PUBLIC_YM_ID` (existing in `.env.example`, now used), `VERCEL_PROJECT_PRODUCTION_URL` (read-only, set by Vercel). `NEXT_PUBLIC_GA_ID` is removed from `.env.example`.
- Single package (no workspaces), no build flags. `next.config.ts` is not changed (`cacheComponents: true` stays).
- Coordination with `add-lead-form`: both changes edit `package.json`, `pnpm-lock.yaml` and `README.md` (each adds its own dependencies and its own assumptions section). Neither touches the other's source files.
