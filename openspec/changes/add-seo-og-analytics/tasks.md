# Tasks

Rules for every task below:

- Paths are relative to the repository root `/mnt/1TB/HTML/coffe-kvarta`; every command runs from the repository root. The package manager is pnpm (single package, no workspaces, no build flags).
- Requirements and scenarios: `openspec/changes/add-seo-og-analytics/specs/seo-metadata/spec.md` and `openspec/changes/add-seo-og-analytics/specs/analytics/spec.md`. Scenario names in tasks are quoted verbatim from these files; the exact input values and expected strings are in the scenario text.
- Contracts, algorithms, examples, conventions and prohibitions: `openspec/changes/add-seo-og-analytics/design.md`. A reference such as «Contracts / src/lib/site.ts», «Algorithms / resolveSiteUrl» or «D5» names a `###` heading of that file; «Conventions», «Don'ts», «Examples» and «Edge Cases» name `##` sections. Names, signatures, texts, colors and versions from design.md are copied verbatim.
- `[stub]` tasks create modules with their final exports, types and signatures; every function body is `throw new Error('not implemented');`. A stub lives only until the `[code]` task of the same group replaces it. After each group ends, no stub from that group remains. While a group has a stub, `pnpm build` and the tests of that group may fail; the other groups' tests must still pass.
- Tests written by `[test]` tasks are never changed by later tasks; a `[code]` task makes them pass. If a test looks wrong, stop and ask.
- Every test that checks a scenario has the line `// @scenario: <exact scenario name>` directly above its `it(...)` («Conventions»). `.skip`, `.only` and `.todo` are forbidden.
- Wiring a new file (imports in the files that use it) belongs to the task that lists the importing file in Files.
- Before finishing a task, run `pnpm exec prettier --write <files of the task>` on the files it created or modified (not on deleted files). Do not use `pnpm format:check` as a task check: it fails on the unrelated file `verification-report-add-landing-sections.md`.
- Lint is checked with zero warnings: `pnpm exec eslint <files> --max-warnings 0`. The only allowed `eslint-disable` comment is the one in «Contracts / src/components/site-analytics.tsx» (D12).
- The change `add-lead-form` is in progress on the same branch. Do not touch its files (see «Don'ts»). If `package.json` or `README.md` already contain its edits, keep them.
- Touch only the files listed in the task's Files. If a task, the design sections in its Refs and the code disagree, or something is not specified, stop and ask, quoting the place. Do not choose yourself.

## 1. Dependencies and texts

Installs the runtime packages for fonts and analytics and adds the SEO texts. No tests here.

- [ ] 1.1 [infra] Install the font and analytics packages
  - Files: `package.json` (modify), `pnpm-lock.yaml` (modify)
  - Steps:
    1. Run `pnpm add --save-exact @fontsource/lora@5.3.0 @fontsource/golos-text@5.3.0 @vercel/analytics@2.0.1 @vercel/speed-insights@2.0.0`.
    2. Run `git diff package.json` and check that the only changes are the four new lines in `dependencies` from «Contracts / package.json».
  - Refs: «Contracts / package.json», «D4», «D6», «D10», «Don'ts»
  - Depends on: none
  - Done when: `pnpm ls @fontsource/lora @fontsource/golos-text @vercel/analytics @vercel/speed-insights --depth 0` passes; `test -f node_modules/@fontsource/lora/files/lora-cyrillic-700-normal.woff && test -f node_modules/@fontsource/golos-text/files/golos-text-cyrillic-400-normal.woff` passes
    Manual: the first command lists `@fontsource/golos-text 5.3.0`, `@fontsource/lora 5.3.0`, `@vercel/analytics 2.0.1`, `@vercel/speed-insights 2.0.0` under `dependencies`, and `package.json` has these exact versions without `^`.

- [ ] 1.2 [code] Add the SEO texts module
  - Files: `src/data/seo.ts` (create)
  - Steps:
    1. Create `src/data/seo.ts` with exactly the code from «Contracts / src/data/seo.ts», including the JSDoc line and `as const`.
    2. Check that `·` is U+00B7, `—` is U+2014 and `–` is U+2013 in the strings (copy them from design.md, do not retype).
  - Refs: «Contracts / src/data/seo.ts», «D3»
  - Depends on: 1.1
  - Done when: `pnpm exec eslint src/data/seo.ts --max-warnings 0` passes; `pnpm typecheck` passes

## 2. Site URL

Replaces the silent `localhost` fallback with the resolution order from «D2». `src/lib/site.ts` keeps exporting `siteUrl` and `siteName`.

- [ ] 2.1 [stub] Add the `resolveSiteUrl` skeleton to `src/lib/site.ts`
  - Files: `src/lib/site.ts` (modify)
  - Steps:
    1. Add `export interface SiteUrlEnv`, `export const LOCAL_SITE_URL = 'http://localhost:3000';` and `export function resolveSiteUrl(env: SiteUrlEnv): string` with the JSDoc from «Contracts / src/lib/site.ts»; the body is `throw new Error('not implemented');`.
    2. Keep the existing line `const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';` unchanged in this task, so the site still builds.
    3. Keep `const siteName = siteData.name;` and `export { siteUrl, siteName };`.
  - Refs: «Contracts / src/lib/site.ts», «D2»
  - Depends on: 1.2
  - Done when: `pnpm typecheck` passes; `pnpm exec eslint src/lib/site.ts --max-warnings 0` passes

- [ ] 2.2 [test] Write tests for `resolveSiteUrl`
  - Files: `src/lib/site.test.ts` (create)
  - Steps:
    1. Import `{ describe, expect, it }` from `vitest` and `{ LOCAL_SITE_URL, resolveSiteUrl }` from `@/lib/site`. Call `resolveSiteUrl` with an explicit env object; never read or change `process.env` («Examples»).
    2. «Explicit site URL»: input `{ NEXT_PUBLIC_SITE_URL: '  https://kvarta.example/landing/  ', VERCEL_PROJECT_PRODUCTION_URL: 'kvarta.vercel.app' }` → `'https://kvarta.example'`.
    3. «Vercel production domain fallback»: inputs `{ VERCEL_PROJECT_PRODUCTION_URL: 'kvarta.vercel.app' }` and `{ NEXT_PUBLIC_SITE_URL: '   ', VERCEL_PROJECT_PRODUCTION_URL: 'kvarta.vercel.app' }` → both `'https://kvarta.vercel.app'`.
    4. «Local fallback»: input `{}` → `'http://localhost:3000'`, and `LOCAL_SITE_URL` equals `'http://localhost:3000'`.
    5. «Invalid explicit site URL»: input `{ NEXT_PUBLIC_SITE_URL: 'kvarta.example' }` throws `Error` with message `NEXT_PUBLIC_SITE_URL должен быть абсолютным URL с http:// или https://, получено: "kvarta.example"`; input `{ NEXT_PUBLIC_SITE_URL: 'ftp://kvarta.example' }` throws with message `NEXT_PUBLIC_SITE_URL должен быть абсолютным URL с http:// или https://, получено: "ftp://kvarta.example"`. Use `expect(() => ...).toThrow(new Error('<message>'))`.
  - Refs: «Contracts / src/lib/site.ts», «Algorithms / resolveSiteUrl», «Examples», «Conventions»; scenarios «Explicit site URL», «Vercel production domain fallback», «Local fallback», «Invalid explicit site URL»
  - Depends on: 2.1
  - Done when: `pnpm exec eslint src/lib/site.test.ts --max-warnings 0` passes; `pnpm test src/lib/site.test.ts` fails

- [ ] 2.3 [code] Implement `resolveSiteUrl` and use it for `siteUrl`
  - Files: `src/lib/site.ts` (modify)
  - Steps:
    1. Implement `resolveSiteUrl` by «Algorithms / resolveSiteUrl» with the exact error text from «Contracts / src/lib/site.ts».
    2. Replace the `siteUrl` line with the `resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL, VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL })` call from the contract.
    3. Replace the two header comment lines with the two lines from the contract.
  - Refs: «Contracts / src/lib/site.ts», «Algorithms / resolveSiteUrl», «D2»
  - Depends on: 2.2
  - Done when: `pnpm test src/lib/site.test.ts` passes; `pnpm exec eslint src/lib/site.ts --max-warnings 0` passes; `pnpm typecheck` passes

## 3. Page metadata, robots.txt and sitemap.xml

Pure builders in `src/lib/seo.ts`, wired into the root layout and two new metadata routes.

- [ ] 3.1 [stub] Create the `src/lib/seo.ts` skeleton
  - Files: `src/lib/seo.ts` (create)
  - Steps:
    1. Create the module with the imports, the three exported functions with JSDoc and signatures, and `export const siteMetadata: Metadata = buildSiteMetadata(siteUrl);`, all from «Contracts / src/lib/seo.ts».
    2. Each function body is `throw new Error('not implemented');`. Nothing imports this module yet.
  - Refs: «Contracts / src/lib/seo.ts», «D3»
  - Depends on: 2.3
  - Done when: `pnpm typecheck` passes; `pnpm exec eslint src/lib/seo.ts --max-warnings 0` passes

- [ ] 3.2 [test] Write tests for the metadata, robots and sitemap builders
  - Files: `src/lib/seo.test.ts` (create)
  - Steps:
    1. Import `{ describe, expect, it }` from `vitest`, `{ buildRobots, buildSiteMetadata, buildSitemap }` from `@/lib/seo` and `{ seoContent }` from `@/data/seo`. Use the base URL `'https://kvarta.example'` in every test.
    2. «Title, description and robots in HTML»: `buildSiteMetadata('https://kvarta.example')` has `metadataBase?.href === 'https://kvarta.example/'`, `title === 'Кварта — свежеобжаренный кофе с доставкой по Минску'`, `description === 'Обжариваем кофе по четвергам, в пятницу привозим по Минску — зерно приезжает на 1–3 день после обжарки. Подписка и разовые заказы.'`, `alternates` equal to `{ canonical: '/' }` and `robots` equal to `{ index: true, follow: true }`.
    3. «Description length»: `seoContent.description.length` is `130`, and it is `>= 70` and `<= 160`.
    4. «Open Graph tags in HTML»: `openGraph` equals `{ type: 'website', locale: 'ru_RU', url: '/', siteName: 'Кварта', title: 'Кварта — свежеобжаренный кофе с доставкой по Минску', description: <the description from step 2> }` (`toEqual`; this also proves there is no `images` key).
    5. «Twitter card in HTML»: `twitter` equals `{ card: 'summary_large_image', title: <the title>, description: <the description> }` (`toEqual`).
    6. «robots.txt content»: `buildRobots('https://kvarta.example')` equals `{ rules: { userAgent: '*', allow: '/' }, sitemap: 'https://kvarta.example/sitemap.xml' }`.
    7. «sitemap.xml content»: `buildSitemap('https://kvarta.example')` equals `[{ url: 'https://kvarta.example/', changeFrequency: 'monthly', priority: 1 }]` (`toEqual`; this also proves there is no `lastModified`).
  - Refs: «Contracts / src/lib/seo.ts», «Contracts / src/data/seo.ts», «Examples», «Conventions»; scenarios «Title, description and robots in HTML», «Description length», «Open Graph tags in HTML», «Twitter card in HTML», «robots.txt content», «sitemap.xml content»
  - Depends on: 3.1
  - Done when: `pnpm exec eslint src/lib/seo.test.ts --max-warnings 0` passes; `pnpm test src/lib/seo.test.ts` fails

- [ ] 3.3 [code] Implement the builders in `src/lib/seo.ts`
  - Files: `src/lib/seo.ts` (modify)
  - Steps:
    1. Make `buildSiteMetadata`, `buildRobots` and `buildSitemap` return exactly the literals from «Contracts / src/lib/seo.ts».
  - Refs: «Contracts / src/lib/seo.ts», «Algorithms» (trivial functions line), «Don'ts»
  - Depends on: 3.2
  - Done when: `pnpm test src/lib/seo.test.ts` passes; `pnpm exec eslint src/lib/seo.ts --max-warnings 0` passes; `pnpm typecheck` passes

- [ ] 3.4 [code] Wire the metadata into the layout and add the robots and sitemap routes
  - Files: `src/app/layout.tsx` (modify), `src/app/robots.ts` (create), `src/app/sitemap.ts` (create)
  - Steps:
    1. In `src/app/layout.tsx`, remove the import `import { siteUrl, siteName } from '@/lib/site';`, add `import { siteMetadata } from '@/lib/seo';` directly after `import './globals.css';`, and replace the `metadata` object with `export const metadata: Metadata = siteMetadata;`. Do not change the JSX in this task.
    2. Create `src/app/robots.ts` with exactly the code from «Contracts / src/app/robots.ts».
    3. Create `src/app/sitemap.ts` with exactly the code from «Contracts / src/app/sitemap.ts».
  - Refs: «Contracts / src/app/layout.tsx», «Contracts / src/app/robots.ts», «Contracts / src/app/sitemap.ts», «D3», «Don'ts»
  - Depends on: 3.3
  - Done when: `pnpm exec eslint src/app/layout.tsx src/app/robots.ts src/app/sitemap.ts --max-warnings 0` passes; `pnpm typecheck` passes; `pnpm test` passes; `pnpm build` passes
    Manual: the route table printed by `pnpm build` lists `○ /robots.txt` and `○ /sitemap.xml`.

## 4. Structured data

JSON-LD `LocalBusiness` derived from site data and rendered once in the root layout.

- [ ] 4.1 [stub] Create the `src/lib/structured-data.ts` skeleton
  - Files: `src/lib/structured-data.ts` (create)
  - Steps:
    1. Create the module with `OpeningHours`, `SplitAddress`, `JsonLd`, `WEEKDAYS`, `WEEKEND` and the four exported functions with JSDoc and signatures from «Contracts / src/lib/structured-data.ts».
    2. Each function body is `throw new Error('not implemented');`.
    3. Do not add the four data imports (`images`, `seoContent`, `siteData`, `siteName`) in this task: the stub does not use them, and unused imports fail lint. Task 4.3 adds them.
  - Refs: «Contracts / src/lib/structured-data.ts», «D9»
  - Depends on: 3.4
  - Done when: `pnpm typecheck` passes; `pnpm exec eslint src/lib/structured-data.ts --max-warnings 0` passes

- [ ] 4.2 [test] Write tests for the JSON-LD helpers
  - Files: `src/lib/structured-data.test.ts` (create)
  - Steps:
    1. Import `{ describe, expect, it }` from `vitest` and `{ buildLocalBusinessJsonLd, parseHoursRange, serializeJsonLd, splitAddress }` from `@/lib/structured-data`.
    2. «LocalBusiness fields»: `buildLocalBusinessJsonLd('https://kvarta.example')` `toEqual` the object from the scenario (the same object is in «Contracts / src/lib/structured-data.ts»; copy it as a TypeScript object literal).
    3. Test without a scenario line: `parseHoursRange('8:00–20:00')` equals `{ opens: '08:00', closes: '20:00' }` and `parseHoursRange('10:00-18:00')` (ASCII hyphen) equals `{ opens: '10:00', closes: '18:00' }`.
    4. «Escaping in JSON-LD»: `serializeJsonLd({ name: '</script><b>' })` is exactly the string `{"name":"\u003c/script>\u003cb>"}`; in TypeScript write it as `'{"name":"\\u003c/script>\\u003cb>"}'`.
    5. «Invalid opening hours in site data»: `parseHoursRange('с 8 до 20')` throws `new Error('Неверный формат часов работы: "с 8 до 20", ожидается "8:00–20:00"')`; also `parseHoursRange('25:00–20:00')` throws `new Error('Неверный формат часов работы: "25:00–20:00", ожидается "8:00–20:00"')`.
    6. «Address without the city prefix»: `splitAddress('ул. Короля, 9', 'Минск')` throws `new Error('Адрес "ул. Короля, 9" должен начинаться с "Минск, "')`.
    7. Test without a scenario line: `splitAddress('Минск, ул. Короля, 9', 'Минск')` equals `{ locality: 'Минск', streetAddress: 'ул. Короля, 9' }`.
  - Refs: «Contracts / src/lib/structured-data.ts», «Algorithms / parseHoursRange», «Algorithms / splitAddress», «Algorithms / buildLocalBusinessJsonLd», «Conventions»; scenarios «LocalBusiness fields», «Escaping in JSON-LD», «Invalid opening hours in site data», «Address without the city prefix»
  - Depends on: 4.1
  - Done when: `pnpm exec eslint src/lib/structured-data.test.ts --max-warnings 0` passes; `pnpm test src/lib/structured-data.test.ts` fails

- [ ] 4.3 [code] Implement the JSON-LD helpers
  - Files: `src/lib/structured-data.ts` (modify)
  - Steps:
    1. Implement `parseHoursRange`, `splitAddress` and `buildLocalBusinessJsonLd` by «Algorithms / parseHoursRange», «Algorithms / splitAddress» and «Algorithms / buildLocalBusinessJsonLd».
    2. Implement `serializeJsonLd` as `JSON.stringify(data).replace(/</g, '\\u003c')`.
    3. Add the four imports from «Contracts / src/lib/structured-data.ts» at the top of the file: `images` from `@/data/images`, `seoContent` from `@/data/seo`, `siteData` from `@/data/site`, `siteName` from `@/lib/site`.
  - Refs: «Contracts / src/lib/structured-data.ts», «Algorithms / parseHoursRange», «Algorithms / splitAddress», «Algorithms / buildLocalBusinessJsonLd», «D9»
  - Depends on: 4.2
  - Done when: `pnpm test src/lib/structured-data.test.ts` passes; `pnpm exec eslint src/lib/structured-data.ts --max-warnings 0` passes; `pnpm typecheck` passes

- [ ] 4.4 [code] Render the JSON-LD in the root layout
  - Files: `src/components/structured-data.tsx` (create), `src/app/layout.tsx` (modify)
  - Steps:
    1. Create `src/components/structured-data.tsx` with exactly the code from «Contracts / src/components/structured-data.tsx».
    2. In `src/app/layout.tsx`, add `import { StructuredData } from '@/components/structured-data';` after the `Toaster` import, and render `<StructuredData />` as the first child of `<body>`, before `{children}`.
  - Refs: «Contracts / src/components/structured-data.tsx», «Contracts / src/app/layout.tsx», «D9», «Don'ts»
  - Depends on: 4.3
  - Done when: `pnpm exec eslint src/components/structured-data.tsx src/app/layout.tsx --max-warnings 0` passes; `pnpm typecheck` passes; `pnpm test` passes; `pnpm build` passes

## 5. Preview image and icons

Font loading and the three generated image routes; the scaffold favicon is removed.

- [ ] 5.1 [code] Create the image font and color module
  - Files: `src/lib/og.ts` (create)
  - Steps:
    1. Create `src/lib/og.ts` with exactly the code from «Contracts / src/lib/og.ts»: `OG_COLORS`, `OG_HEADING_FONT`, `OG_TEXT_FONT`, `OgFont`, `ogFonts` (top-level `await`, four entries in the given order) and the non-exported function declaration `readFontsource` with the body given in the contract.
  - Refs: «Contracts / src/lib/og.ts», «D4», «D5», «D6», «D7»
  - Depends on: 4.4
  - Done when: `pnpm exec eslint src/lib/og.ts --max-warnings 0` passes; `pnpm typecheck` passes

- [ ] 5.2 [stub] Create the image route skeletons
  - Files: `src/app/opengraph-image.tsx` (create), `src/app/icon.tsx` (create), `src/app/apple-icon.tsx` (create)
  - Steps:
    1. In each file, add the final named exports from its contract: `alt`, `size`, `contentType` in `opengraph-image.tsx`; `size`, `contentType` in `icon.tsx` and `apple-icon.tsx`, with the exact sizes 1200×630, 32×32 and 180×180.
    2. Add the default export with its final name, JSDoc and return type (`Image(): ImageResponse`, `Icon(): ImageResponse`, `AppleIcon(): ImageResponse`); the body is `throw new Error('not implemented');`.
    3. Imports in the stubs: every file has `import type { ImageResponse } from 'next/og';` (type-only, because the stub uses it only as a return type); `opengraph-image.tsx` also imports `{ seoContent }` from `@/data/seo` for `alt`. No other imports. Tasks 5.4 and 5.5 replace the files with the full contracts, which import `ImageResponse` as a value.
  - Refs: «Contracts / src/app/opengraph-image.tsx», «Contracts / src/app/icon.tsx», «Contracts / src/app/apple-icon.tsx», «Don'ts»
  - Depends on: 5.1
  - Done when: `pnpm exec eslint src/app/opengraph-image.tsx src/app/icon.tsx src/app/apple-icon.tsx --max-warnings 0` passes; `pnpm typecheck` passes

- [ ] 5.3 [test] Write PNG format tests for the image routes
  - Files: `src/lib/og-images.test.ts` (create)
  - Steps:
    1. Import `{ describe, expect, it }` from `vitest`, `OpenGraphImage, { alt, contentType, size }` from `@/app/opengraph-image`, `Icon` from `@/app/icon` and `AppleIcon` from `@/app/apple-icon`.
    2. «Preview image format»: `const response = OpenGraphImage();` then `response.headers.get('content-type')` is `'image/png'`; read the body into a `Buffer` and check `readUInt32BE(16)` is `1200` and `readUInt32BE(20)` is `630` («Examples»). Also check `size` equals `{ width: 1200, height: 630 }`, `contentType` is `'image/png'` and `alt` is `'Кварта — кофе, который приезжает свежим'`.
    3. «Icon formats»: the same checks for `Icon()` with `32`/`32` and for `AppleIcon()` with `180`/`180`; both content types are `'image/png'`.
    4. Write three `it` blocks titled exactly `Preview image format`, `Icon formats: icon` and `Icon formats: apple-icon`. The first carries `// @scenario: Preview image format`, the other two `// @scenario: Icon formats`.
    5. Give each `it` a timeout of `30_000` ms as the third argument, because rendering loads the WASM renderer.
  - Refs: «Contracts / src/app/opengraph-image.tsx», «Contracts / src/app/icon.tsx», «Contracts / src/app/apple-icon.tsx», «Examples», «Conventions»; scenarios «Preview image format», «Icon formats»
  - Depends on: 5.2
  - Done when: `pnpm exec eslint src/lib/og-images.test.ts --max-warnings 0` passes; `pnpm test src/lib/og-images.test.ts` fails

- [ ] 5.4 [code] Implement the preview image
  - Files: `src/app/opengraph-image.tsx` (modify)
  - Steps:
    1. Replace the file with exactly the code from «Contracts / src/app/opengraph-image.tsx».
  - Refs: «Contracts / src/app/opengraph-image.tsx», «Contracts / src/lib/og.ts», «D4», «D5», «Don'ts»
  - Depends on: 5.3
  - Done when: `pnpm test src/lib/og-images.test.ts -t "Preview image format"` passes; `pnpm exec eslint src/app/opengraph-image.tsx --max-warnings 0` passes; `pnpm typecheck` passes

- [ ] 5.5 [code] Implement the icons and remove the scaffold favicon
  - Files: `src/app/icon.tsx` (modify), `src/app/apple-icon.tsx` (modify), `src/app/favicon.ico` (delete)
  - Steps:
    1. Replace `src/app/icon.tsx` with exactly the code from «Contracts / src/app/icon.tsx».
    2. Replace `src/app/apple-icon.tsx` with the code from «Contracts / src/app/apple-icon.tsx»: the `icon.tsx` code with size 180×180, function name `AppleIcon`, the given JSDoc, no `borderRadius` and `fontSize: 120`.
    3. Delete `src/app/favicon.ico` with `git rm src/app/favicon.ico`.
  - Refs: «Contracts / src/app/icon.tsx», «Contracts / src/app/apple-icon.tsx», «D8», «Don'ts»
  - Depends on: 5.4
  - Done when: `pnpm test src/lib/og-images.test.ts` passes; `test ! -e src/app/favicon.ico` passes; `pnpm exec eslint src/app/icon.tsx src/app/apple-icon.tsx --max-warnings 0` passes; `pnpm typecheck` passes; `pnpm build` passes
    Manual: the route table printed by `pnpm build` lists `○ /opengraph-image`, `○ /icon` and `○ /apple-icon` (scenario «Preview image is static»).

## 6. Analytics

Yandex Metrika helpers, the analytics component and the environment template.

- [ ] 6.1 [stub] Create the `src/lib/yandex-metrika.ts` skeleton
  - Files: `src/lib/yandex-metrika.ts` (create)
  - Steps:
    1. Create the module with `YANDEX_METRIKA_SCRIPT_ID`, `YANDEX_METRIKA_TAG_URL` (final values) and the three exported functions with JSDoc and signatures from «Contracts / src/lib/yandex-metrika.ts».
    2. Each function body is `throw new Error('not implemented');`.
  - Refs: «Contracts / src/lib/yandex-metrika.ts», «D10»
  - Depends on: 5.5
  - Done when: `pnpm typecheck` passes; `pnpm exec eslint src/lib/yandex-metrika.ts --max-warnings 0` passes

- [ ] 6.2 [test] Write tests for the Metrika helpers
  - Files: `src/lib/yandex-metrika.test.ts` (create)
  - Steps:
    1. Import `{ describe, expect, it }` from `vitest` and `{ buildYandexMetrikaSnippet, getYandexMetrikaPixelUrl, parseYandexMetrikaId }` from `@/lib/yandex-metrika`.
    2. «Valid counter ID»: `parseYandexMetrikaId('12345678')` and `parseYandexMetrikaId(' 12345678 ')` both return `12345678`.
    3. «Missing or invalid counter ID»: `parseYandexMetrikaId` returns `null` for each of `undefined`, `''`, `'   '`, `'abc'`, `'123-456'`, `'12345678; alert(1)'`, `'1234567890123'`, `'-5'`.
    4. «Counter code for an ID»: `buildYandexMetrikaSnippet(12345678)` equals exactly the one-line string from «Contracts / src/lib/yandex-metrika.ts» (write it in the test as a template literal in backticks: the line contains single quotes but no backticks and no `${`); additionally check it contains `'https://mc.yandex.ru/metrika/tag.js'` and `"ym(12345678,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});"`, and `.toLowerCase()` does not contain `'webvisor'`.
    5. Test without a scenario line: `getYandexMetrikaPixelUrl(12345678)` is `'https://mc.yandex.ru/watch/12345678'`.
  - Refs: «Contracts / src/lib/yandex-metrika.ts», «Algorithms / parseYandexMetrikaId», «Conventions»; scenarios «Valid counter ID», «Missing or invalid counter ID», «Counter code for an ID»
  - Depends on: 6.1
  - Done when: `pnpm exec eslint src/lib/yandex-metrika.test.ts --max-warnings 0` passes; `pnpm test src/lib/yandex-metrika.test.ts` fails

- [ ] 6.3 [code] Implement the Metrika helpers
  - Files: `src/lib/yandex-metrika.ts` (modify)
  - Steps:
    1. Implement `parseYandexMetrikaId` by «Algorithms / parseYandexMetrikaId».
    2. Implement `buildYandexMetrikaSnippet` as a template literal that produces exactly the line in «Contracts / src/lib/yandex-metrika.ts», using `${YANDEX_METRIKA_TAG_URL}` and `${id}`.
    3. Implement `getYandexMetrikaPixelUrl` as `` `https://mc.yandex.ru/watch/${id}` ``.
  - Refs: «Contracts / src/lib/yandex-metrika.ts», «Algorithms / parseYandexMetrikaId», «D11»
  - Depends on: 6.2
  - Done when: `pnpm test src/lib/yandex-metrika.test.ts` passes; `pnpm exec eslint src/lib/yandex-metrika.ts --max-warnings 0` passes; `pnpm typecheck` passes

- [ ] 6.4 [code] Add the analytics component to the root layout
  - Files: `src/components/site-analytics.tsx` (create), `src/app/layout.tsx` (modify)
  - Steps:
    1. Create `src/components/site-analytics.tsx` with exactly the code from «Contracts / src/components/site-analytics.tsx», including the single `eslint-disable-next-line` comment.
    2. In `src/app/layout.tsx`, add `import { SiteAnalytics } from '@/components/site-analytics';` between the `Toaster` import and the `StructuredData` import, and render `<SiteAnalytics />` as the last child of `<body>`, after `<Toaster />`.
    3. Compare `src/app/layout.tsx` with «Contracts / src/app/layout.tsx»; the file must match it exactly.
  - Refs: «Contracts / src/components/site-analytics.tsx», «Contracts / src/app/layout.tsx», «D10», «D11», «D12», «Don'ts»
  - Depends on: 6.3
  - Done when: `pnpm exec eslint src/components/site-analytics.tsx src/app/layout.tsx --max-warnings 0` passes; `pnpm typecheck` passes; `pnpm test` passes; `pnpm build` passes; `NEXT_PUBLIC_YM_ID=12345678 pnpm build` passes
    Manual: both builds list `○ /` in the route table (scenarios «Route stays static with analytics», «Missing or invalid counter ID»).

- [ ] 6.5 [infra] Update the environment template
  - Files: `.env.example` (modify)
  - Steps:
    1. Replace the whole file with the content from «Contracts / .env.example».
  - Refs: «Contracts / .env.example», «D2», «D10»; scenario «Environment template content»
  - Depends on: 6.4
  - Done when: `grep -c '^NEXT_PUBLIC_SITE_URL=$' .env.example` passes; `grep -c '^NEXT_PUBLIC_YM_ID=$' .env.example` passes; `grep -q NEXT_PUBLIC_GA_ID .env.example` fails

## 7. Documentation and final checks

- [ ] 7.1 [docs] Document the assumptions in README
  - Files: `README.md` (modify)
  - Steps:
    1. Insert the section from «Contracts / README.md» verbatim at the position described there (after `### Допущения для change "add-landing-sections"` and its list, or after `### Допущения для change "add-lead-form"` if that section exists, and before `## Development`).
    2. Do not change any other part of README.
  - Refs: «Contracts / README.md»; scenario «README assumptions»
  - Depends on: 6.5
  - Done when: `grep -q '### Допущения для change "add-seo-og-analytics"' README.md` passes; `pnpm exec prettier --check README.md` passes

- [ ] 7.2 [manual] Check the built site with curl and a browser
  - Files: none
  - Steps:
    1. Run `NEXT_PUBLIC_SITE_URL=https://kvarta.example NEXT_PUBLIC_YM_ID=12345678 pnpm build`, then `pnpm start`. Check that the route table marks `/`, `/opengraph-image`, `/icon`, `/apple-icon`, `/robots.txt`, `/sitemap.xml` with `○` («Build route table», «Preview image is static»).
    2. Run `curl -s http://localhost:3000/ > /tmp/kvarta-home.html` and check in that file every string from «Title, description and robots in HTML», «Open Graph tags in HTML», «Twitter card in HTML», «Icon links in HTML», «JSON-LD in HTML» and «Counter present in the built page».
    3. Run `curl -s http://localhost:3000/robots.txt` and `curl -s http://localhost:3000/sitemap.xml` and compare them with «robots.txt content» and «sitemap.xml content». Run `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/favicon.ico` and expect `404` («Scaffold favicon removed»).
    4. Open `http://localhost:3000/opengraph-image` in Chrome and check «Preview image content».
    5. Open `http://localhost:3000/` in Chrome with DevTools: check «Counter loads in the browser»; then block `mc.yandex.ru` with Network request blocking, reload and check «Metrika blocked by the browser». 404 responses for `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` are expected locally («Edge Cases»).
    6. Stop the server, run `pnpm build` without `NEXT_PUBLIC_YM_ID` and `NEXT_PUBLIC_SITE_URL`, run `pnpm start`, fetch `/` with `curl` and check «Counter disabled» and «Local fallback» (build exit code 0).
    7. Run `NEXT_PUBLIC_SITE_URL=kvarta.example pnpm build` and check that it exits with a non-zero code and prints the error message from «Invalid explicit site URL».
    8. «Preview in a messenger» and «Vercel scripts on the deployed site» need a public deployment (task 12). If the site is deployed, check both on the production URL. If it is not, write «not checked: no public deployment» for these two scenarios in the task report.
  - Refs: «Edge Cases»; scenarios «Build route table», «Preview image is static», «Title, description and robots in HTML», «Open Graph tags in HTML», «Twitter card in HTML», «Icon links in HTML», «JSON-LD in HTML», «Counter present in the built page», «robots.txt content», «sitemap.xml content», «Scaffold favicon removed», «Preview image content», «Counter loads in the browser», «Metrika blocked by the browser», «Counter disabled», «Local fallback», «Invalid explicit site URL», «Preview in a messenger», «Vercel scripts on the deployed site»
  - Depends on: 7.1
  - Done when: Manual: every check in steps 1–7 matches its scenario; step 8 is either checked or reported as «not checked: no public deployment».

- [ ] 7.3 [verify] Run formatting, lint, type check, all tests and the production build
  - Files: none
  - Steps:
    1. Run `pnpm exec prettier --check package.json .env.example README.md src/data/seo.ts src/lib/site.ts src/lib/site.test.ts src/lib/seo.ts src/lib/seo.test.ts src/lib/structured-data.ts src/lib/structured-data.test.ts src/lib/og.ts src/lib/og-images.test.ts src/lib/yandex-metrika.ts src/lib/yandex-metrika.test.ts src/components/structured-data.tsx src/components/site-analytics.tsx src/app/opengraph-image.tsx src/app/icon.tsx src/app/apple-icon.tsx src/app/robots.ts src/app/sitemap.ts src/app/layout.tsx`.
    2. Run `pnpm lint --max-warnings 0`.
    3. Run `pnpm typecheck`.
    4. Run `pnpm test`.
    5. Run `pnpm build`.
  - Refs: «Conventions», «Don'ts»
  - Depends on: 7.2
  - Done when: `pnpm exec prettier --check package.json .env.example README.md src/data/seo.ts src/lib/site.ts src/lib/site.test.ts src/lib/seo.ts src/lib/seo.test.ts src/lib/structured-data.ts src/lib/structured-data.test.ts src/lib/og.ts src/lib/og-images.test.ts src/lib/yandex-metrika.ts src/lib/yandex-metrika.test.ts src/components/structured-data.tsx src/components/site-analytics.tsx src/app/opengraph-image.tsx src/app/icon.tsx src/app/apple-icon.tsx src/app/robots.ts src/app/sitemap.ts src/app/layout.tsx` passes; `pnpm lint --max-warnings 0` passes; `pnpm typecheck` passes; `pnpm test` passes; `pnpm build` passes
