# Spec Delta

## Purpose

Describes how the site presents itself to search engines and to link previews in messengers: page metadata, the absolute site URL, the generated preview image and icons, `robots.txt`, `sitemap.xml` and JSON-LD structured data about the workshop.

## ADDED Requirements

### Requirement: Absolute site URL
The site SHALL derive its absolute URL from `NEXT_PUBLIC_SITE_URL` when it is non-empty after trimming, using only its origin. Otherwise it SHALL use `https://` plus `VERCEL_PROJECT_PRODUCTION_URL` when that is non-empty after trimming, and otherwise `http://localhost:3000`. A non-empty `NEXT_PUBLIC_SITE_URL` that is not an absolute `http` or `https` URL MUST stop the build with an error.

#### Scenario: Explicit site URL
- **WHEN** `NEXT_PUBLIC_SITE_URL` is `  https://kvarta.example/landing/  ` and `VERCEL_PROJECT_PRODUCTION_URL` is `kvarta.vercel.app`
- **THEN** the site URL is `https://kvarta.example`

#### Scenario: Vercel production domain fallback
- **WHEN** `NEXT_PUBLIC_SITE_URL` is unset or `   `, and `VERCEL_PROJECT_PRODUCTION_URL` is `kvarta.vercel.app`
- **THEN** the site URL is `https://kvarta.vercel.app`

#### Scenario: Local fallback
- **WHEN** neither `NEXT_PUBLIC_SITE_URL` nor `VERCEL_PROJECT_PRODUCTION_URL` is set
- **THEN** the site URL is `http://localhost:3000` and `pnpm build` exits with code 0

#### Scenario: Invalid explicit site URL
- **WHEN** `NEXT_PUBLIC_SITE_URL` is `kvarta.example` or `ftp://kvarta.example`
- **THEN** resolving the site URL throws `Error` with the message `NEXT_PUBLIC_SITE_URL должен быть абсолютным URL с http:// или https://, получено: "kvarta.example"` (respectively `"ftp://kvarta.example"`), and `pnpm build` exits with a non-zero code

### Requirement: Page title and description
The page `/` SHALL have the title «Кварта — свежеобжаренный кофе с доставкой по Минску». Its meta description MUST be «Обжариваем кофе по четвергам, в пятницу привозим по Минску — зерно приезжает на 1–3 день после обжарки. Подписка и разовые заказы.», which is 130 characters, within the 160-character limit of search snippets. The page MUST declare `robots` `index, follow` and a canonical link to the site URL.

#### Scenario: Title, description and robots in HTML
- **WHEN** `NEXT_PUBLIC_SITE_URL=https://kvarta.example pnpm build` and `pnpm start` are run, and the HTML of `/` is fetched with `curl`
- **THEN** the HTML contains `<title>Кварта — свежеобжаренный кофе с доставкой по Минску</title>`, `<meta name="description" content="Обжариваем кофе по четвергам, в пятницу привозим по Минску — зерно приезжает на 1–3 день после обжарки. Подписка и разовые заказы."/>`, `<meta name="robots" content="index, follow"/>` and `<link rel="canonical" href="https://kvarta.example"/>`

#### Scenario: Description length
- **WHEN** the description text is measured
- **THEN** its length in characters is 130, between 70 and 160

### Requirement: Link preview tags
The page `/` SHALL declare Open Graph tags `og:type` `website`, `og:locale` `ru_RU`, `og:site_name` `Кварта`, `og:url` equal to the site URL, and `og:title` and `og:description` equal to the page title and description. It SHALL declare a Twitter card `summary_large_image` with the same title and description. Both `og:image` and `twitter:image` MUST point to the generated preview image with width 1200, height 630, type `image/png` and the alt text «Кварта — кофе, который приезжает свежим».

#### Scenario: Open Graph tags in HTML
- **WHEN** the HTML of `/` built with `NEXT_PUBLIC_SITE_URL=https://kvarta.example` is fetched with `curl`
- **THEN** it contains `<meta property="og:type" content="website"/>`, `<meta property="og:locale" content="ru_RU"/>`, `<meta property="og:site_name" content="Кварта"/>`, `<meta property="og:url" content="https://kvarta.example"/>`, `<meta property="og:title" content="Кварта — свежеобжаренный кофе с доставкой по Минску"/>`, `<meta property="og:image:width" content="1200"/>`, `<meta property="og:image:height" content="630"/>`, `<meta property="og:image:type" content="image/png"/>`, `<meta property="og:image:alt" content="Кварта — кофе, который приезжает свежим"/>`, and an `og:image` whose `content` starts with `https://kvarta.example/opengraph-image`

#### Scenario: Twitter card in HTML
- **WHEN** the same HTML is inspected
- **THEN** it contains `<meta name="twitter:card" content="summary_large_image"/>`, `<meta name="twitter:title" content="Кварта — свежеобжаренный кофе с доставкой по Минску"/>`, and a `twitter:image` whose `content` starts with `https://kvarta.example/opengraph-image`

#### Scenario: Preview in a messenger
- **WHEN** the production URL is pasted into a Telegram chat
- **THEN** the preview shows the generated image, the title «Кварта — свежеобжаренный кофе с доставкой по Минску» and the description text

### Requirement: Generated preview image
The site SHALL serve a 1200×630 PNG preview image at `/opengraph-image`, generated at build time. On the espresso background `#1f1a14` with text color `#f1ede3` it MUST show, top to bottom: the wordmark «КВАРТА», the headline «Кофе, который приезжает свежим» in the heading font (Lora, weight 700), the caption «Обжарка по четвергам, доставка по Минску в пятницу» in the text font (Golos Text, weight 400), and a badge «Минск · с 2019 года» with background `#cae18a` and text color `#1a1814`. Cyrillic text MUST be drawn with these fonts, not a fallback font.

#### Scenario: Preview image format
- **WHEN** the default export of the preview image route is called and its response body is read
- **THEN** the response has `content-type` `image/png`, and the PNG header gives width 1200 and height 630

#### Scenario: Preview image is static
- **WHEN** `pnpm build` finishes
- **THEN** the route table lists `○ /opengraph-image` (static), not `ƒ`

#### Scenario: Preview image content
- **WHEN** `/opengraph-image` is opened in a browser after `pnpm build` and `pnpm start`
- **THEN** the image shows «КВАРТА», «Кофе, который приезжает свежим», «Обжарка по четвергам, доставка по Минску в пятницу» and the light-green badge «Минск · с 2019 года» on a dark background, the headline is set in a serif font, and no character is drawn as an empty box

### Requirement: Brand icons
The site SHALL serve a 32×32 PNG icon at `/icon` and a 180×180 PNG Apple touch icon at `/apple-icon`, generated at build time. Both MUST show the letter «К» in the heading font (Lora, weight 700) with color `#f1ede3` on `#1f1a14`. The scaffold `favicon.ico` MUST NOT be served.

#### Scenario: Icon links in HTML
- **WHEN** the HTML of `/` is fetched with `curl` after `pnpm build` and `pnpm start`
- **THEN** it contains `<link rel="icon"` with `type="image/png"` and `sizes="32x32"` whose `href` starts with `/icon`, and `<link rel="apple-touch-icon"` with `sizes="180x180"` whose `href` starts with `/apple-icon`

#### Scenario: Icon formats
- **WHEN** the default exports of the icon and Apple icon routes are called and their response bodies are read
- **THEN** both have `content-type` `image/png`; the PNG header of the icon gives 32×32, and that of the Apple icon gives 180×180

#### Scenario: Scaffold favicon removed
- **WHEN** `GET /favicon.ico` is requested from the built site
- **THEN** the response status is 404

### Requirement: robots.txt
The site SHALL serve `/robots.txt` that allows every crawler to access `/` and names the sitemap at the site URL plus `/sitemap.xml`.

#### Scenario: robots.txt content
- **WHEN** `/robots.txt` of the site built with `NEXT_PUBLIC_SITE_URL=https://kvarta.example` is fetched
- **THEN** the body is the lines `User-Agent: *`, `Allow: /`, an empty line, and `Sitemap: https://kvarta.example/sitemap.xml`

### Requirement: sitemap.xml
The site SHALL serve `/sitemap.xml` with exactly one URL: the site URL plus `/`, change frequency `monthly` and priority `1`. It MUST NOT include `lastmod`.

#### Scenario: sitemap.xml content
- **WHEN** `/sitemap.xml` of the site built with `NEXT_PUBLIC_SITE_URL=https://kvarta.example` is fetched
- **THEN** it contains exactly one `<url>` element with `<loc>https://kvarta.example/</loc>`, `<changefreq>monthly</changefreq>` and `<priority>1</priority>`, and no `<lastmod>` element

### Requirement: Structured data about the workshop
The page `/` SHALL contain one `<script type="application/ld+json">` with a schema.org `LocalBusiness` object. Every value in it MUST come from the site data and the SEO texts. Every `<` character in the serialized JSON MUST be written as `<`.

#### Scenario: LocalBusiness fields
- **WHEN** the JSON-LD object is built for the site URL `https://kvarta.example` from the current site data
- **THEN** it equals `{"@context":"https://schema.org","@type":"LocalBusiness","@id":"https://kvarta.example/#business","name":"Кварта","description":"Обжариваем кофе по четвергам, в пятницу привозим по Минску — зерно приезжает на 1–3 день после обжарки. Подписка и разовые заказы.","url":"https://kvarta.example/","image":"https://kvarta.example/images/hero.webp","telephone":"+375291234567","email":"hello@example.com","foundingDate":"2019","address":{"@type":"PostalAddress","streetAddress":"ул. Короля, 9","addressLocality":"Минск","addressCountry":"BY"},"geo":{"@type":"GeoCoordinates","latitude":53.902189,"longitude":27.542084},"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"08:00","closes":"20:00"},{"@type":"OpeningHoursSpecification","dayOfWeek":["Saturday","Sunday"],"opens":"10:00","closes":"18:00"}],"areaServed":{"@type":"City","name":"Минск"}}`

#### Scenario: JSON-LD in HTML
- **WHEN** the HTML of `/` is fetched with `curl` after `pnpm build` and `pnpm start`
- **THEN** it contains exactly one `<script type="application/ld+json">` whose content parses as JSON with `"@type":"LocalBusiness"` and `"name":"Кварта"`

#### Scenario: Escaping in JSON-LD
- **WHEN** the value `{"name":"</script><b>"}` is serialized for the JSON-LD script
- **THEN** the result is `{"name":"</script><b>"}`

#### Scenario: Invalid opening hours in site data
- **WHEN** the hours value `с 8 до 20` is converted for structured data
- **THEN** the conversion throws `Error` with the message `Неверный формат часов работы: "с 8 до 20", ожидается "8:00–20:00"`

#### Scenario: Address without the city prefix
- **WHEN** the address `ул. Короля, 9` is split with the city `Минск`
- **THEN** the split throws `Error` with the message `Адрес "ул. Короля, 9" должен начинаться с "Минск, "`

### Requirement: Page stays static
Adding metadata, the preview image, icons, `robots.txt`, `sitemap.xml` and structured data MUST NOT make any route request-time rendered.

#### Scenario: Build route table
- **WHEN** `pnpm build` finishes
- **THEN** it exits with code 0 and the route table marks `/`, `/opengraph-image`, `/icon`, `/apple-icon`, `/robots.txt` and `/sitemap.xml` with `○` (static)

### Requirement: SEO assumptions in README
README SHALL contain the section «Допущения для change "add-seo-og-analytics"» listing the decisions not given in the brief.

#### Scenario: README assumptions
- **WHEN** the developer opens `README.md`
- **THEN** the section contains these items: the canonical address is taken from `NEXT_PUBLIC_SITE_URL`, and on Vercel without it from the production domain; the preview image is generated by code at build time from brand colors and the fonts Lora and Golos Text (`@fontsource`, SIL OFL), without a photo; the schema.org type is `LocalBusiness`, not a cafe, because the workshop has no seating; Yandex Metrika is used without Webvisor and without the form submission goal; GA4 is not connected; Vercel previews are not closed from indexing
