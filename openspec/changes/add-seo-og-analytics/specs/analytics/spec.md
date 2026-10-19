# Spec Delta

## Purpose

Measures visits and real-user performance of the landing page so the owners can see which ads bring visitors: Yandex Metrika, enabled by an environment variable, plus Vercel Web Analytics and Speed Insights. Analytics must not block rendering or break the page.

## ADDED Requirements

### Requirement: Yandex Metrika counter ID
The Yandex Metrika counter SHALL be enabled only when `NEXT_PUBLIC_YM_ID`, after trimming, consists of 1 to 12 ASCII digits. Any other value, including an empty or unset variable, MUST disable the counter without failing the build.

#### Scenario: Valid counter ID
- **WHEN** `NEXT_PUBLIC_YM_ID` is `12345678` or ` 12345678 `
- **THEN** the counter ID is the number `12345678`

#### Scenario: Missing or invalid counter ID
- **WHEN** `NEXT_PUBLIC_YM_ID` is unset, an empty string, `   `, `abc`, `123-456`, `12345678; alert(1)`, `1234567890123` or `-5`
- **THEN** the counter is disabled and `pnpm build` exits with code 0

### Requirement: Yandex Metrika loading
When the counter is enabled, the page `/` SHALL load the Metrika tag `https://mc.yandex.ru/metrika/tag.js` during browser idle time, after the page becomes interactive, and initialize it with `ym(<id>,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true})`. It MUST NOT enable Webvisor. The page MUST also contain a `<noscript>` pixel `https://mc.yandex.ru/watch/<id>` placed off-screen with an empty `alt`.

#### Scenario: Counter code for an ID
- **WHEN** the inline counter code is built for the ID `12345678`
- **THEN** it contains `https://mc.yandex.ru/metrika/tag.js` and `ym(12345678,'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});`, and does not contain `webvisor`

#### Scenario: Counter present in the built page
- **WHEN** `NEXT_PUBLIC_YM_ID=12345678 pnpm build` and `pnpm start` are run and the HTML of `/` is fetched with `curl`
- **THEN** the HTML contains `yandex-metrika`, `ym(12345678,'init'` and `<noscript><div><img src="https://mc.yandex.ru/watch/12345678" style="position:absolute;left:-9999px" alt=""/></div></noscript>`

#### Scenario: Counter loads in the browser
- **WHEN** the site built with `NEXT_PUBLIC_YM_ID=12345678` is opened in Chrome with the Network panel open, and the page finishes loading
- **THEN** a request to `https://mc.yandex.ru/metrika/tag.js` appears after the `load` event, and `typeof window.ym` in the console is `"function"`

#### Scenario: Counter disabled
- **WHEN** the site is built with `NEXT_PUBLIC_YM_ID` unset and the HTML of `/` is fetched with `curl`
- **THEN** the HTML contains neither `yandex-metrika` nor `mc.yandex.ru/watch`, and the browser makes no requests to `mc.yandex.ru` while loading `/`

#### Scenario: Metrika blocked by the browser
- **WHEN** requests to `mc.yandex.ru` are blocked (Network request blocking in Chrome DevTools) and `/` is opened
- **THEN** all sections render, anchor links scroll to their sections, and the console shows no uncaught exception from site code

### Requirement: Vercel Web Analytics and Speed Insights
Every page SHALL include Vercel Web Analytics and Vercel Speed Insights. They MUST NOT make the route `/` request-time rendered.

#### Scenario: Vercel scripts on the deployed site
- **WHEN** the site deployed on Vercel with Web Analytics and Speed Insights enabled in the project is opened in a browser
- **THEN** the Network panel shows requests to `/_vercel/insights/script.js` and `/_vercel/speed-insights/script.js` with status 200

#### Scenario: Route stays static with analytics
- **WHEN** `NEXT_PUBLIC_YM_ID=12345678 pnpm build` finishes
- **THEN** it exits with code 0 and the route table marks `/` with `○` (static)

### Requirement: Analytics environment template
`.env.example` SHALL describe `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_YM_ID` with comments and empty values. It MUST NOT list `NEXT_PUBLIC_GA_ID`.

#### Scenario: Environment template content
- **WHEN** the developer opens `.env.example`
- **THEN** it contains the lines `NEXT_PUBLIC_SITE_URL=` and `NEXT_PUBLIC_YM_ID=` with a comment above each, and no line contains `NEXT_PUBLIC_GA_ID`
