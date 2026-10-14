# План выполнения задачи 09: SEO, превью ссылок, аналитика

**Задача:** Оптимизировать SEO, OG, аналитику  
**Приоритет:** P1 · **Оценка:** 30 мин  
**Дата создания:** 2026-10-14

---

## Фаза 1: Metadata и базовый SEO (10 мин)

### Шаг 1.1 — Обновить `src/app/layout.tsx`

```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Кварта | Свежий кофе с душой',
  description:
    'Свежий кофе из Эфиопии, Колумбии, Бразилии. Обжариваем в четверг, доставляем в пятницу. Подписка от 54 BYN/месяц.',
  keywords: [
    'кофе Минск',
    'свежий кофе',
    'заказ кофе',
    'подписка на кофе',
    'доставка кофе',
  ],
  authors: [{ name: 'Кварта' }],
  creator: 'Кварта',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://kvarta.coffee',
    siteName: 'Кварта',
    title: 'Кварта | Свежий кофе с душой',
    description:
      'Свежий кофе из Эфиопии, Колумбии, Бразилии. Обжариваем в четверг, доставляем в пятницу.',
    images: [
      {
        url: 'https://kvarta.coffee/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Кварта - свежий кофе',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Кварта | Свежий кофе с душой',
    description: 'Свежий кофе из Эфиопии, Колумбии, Бразилии',
    images: ['https://kvarta.coffee/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://kvarta.coffee',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#6B4423" />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## Фаза 2: Структурированные данные (8 мин)

### Шаг 2.1 — Создать `src/app/structured-data.tsx`

```typescript
import { siteData } from '@/data/site';

export function StructuredData() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: siteData.name,
    description: 'Свежий кофе с душой',
    url: 'https://kvarta.coffee',
    telephone: siteData.contacts.phone,
    email: siteData.contacts.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteData.address,
      addressLocality: 'Минск',
      addressCountry: 'BY',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '10:00',
        closes: '18:00',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### Шаг 2.2 — Подключить в layout

```typescript
import { StructuredData } from './structured-data';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        {/* ... */}
        <StructuredData />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## Фаза 3: Robots, Sitemap, Favicon (5 мин)

### Шаг 3.1 — Создать `src/app/robots.ts`

```typescript
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://kvarta.coffee/sitemap.xml',
  };
}
```

### Шаг 3.2 — Создать `src/app/sitemap.ts`

```typescript
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://kvarta.coffee',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
```

### Шаг 3.3 — Добавить favicon

```bash
# Скачать или создать favicon.ico и разместить в public/
# Размер: 32x32, 64x64, 256x256
# Или использовать онлайн генератор
```

---

## Фаза 4: Аналитика (7 мин)

### Шаг 4.1 — Установить GA4 и Яндекс.Метрика

```bash
pnpm add @vercel/analytics @vercel/speed-insights
```

### Шаг 4.2 — Добавить в layout

```typescript
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Шаг 4.3 — Добавить GA4 и Яндекс.Метрика

**В `src/app/layout.tsx`:**

```typescript
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        {/* GA4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="ga4"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA4_ID}');
            `,
          }}
        />

        {/* Яндекс.Метрика */}
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
              (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
              ym(${process.env.NEXT_PUBLIC_YM_ID}, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true
              });
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Шаг 4.4 — Добавить goal для формы

**В `src/components/lead-form.tsx`:**

```typescript
const onSubmit = async (data: Lead) => {
  // ... отправка ...
  
  // GA4 event
  if (window.gtag) {
    gtag.event('form_submit', { form_name: 'lead_form' });
  }

  // Яндекс.Метрика goal
  if (window.ym) {
    window.ym(process.env.NEXT_PUBLIC_YM_ID, 'reachGoal', 'form_submit');
  }
};
```

---

## Финальный коммит

```bash
git add .
git commit -m "feat: добавить SEO, OG, аналитику

- Metadata API с title, description, canonical
- OG/Twitter cards с картинкой 1200×630
- JSON-LD LocalBusiness структура
- robots.txt и sitemap.xml
- Favicon
- Vercel Analytics и Speed Insights
- GA4 и Яндекс.Метрика через next/script
- Goals на успешную отправку формы"
```

---

**Ожидаемое время:** 30 мин  
**Статус:** ⏳ Ожидает выполнения
