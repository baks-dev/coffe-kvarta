# Tasks

## 1. Установка зависимостей

- [x] 1.1 Установить Zod как зависимость проекта (`pnpm add zod`)
- [x] 1.2 Установить `tsx` как devDependency (`pnpm add -D tsx`)
- [x] 1.3 Добавить скрипты в `package.json`:
  ```json
  {
    "scripts": {
      "validate-data": "tsx scripts/validate-data.ts",
      "build": "pnpm validate-data && next build"
    }
  }
  ```

## 2. Создание данных продуктов

- [x] 2.1 Создать файл `src/data/products.json` с продуктами: "Эфиопия Иргачеффе" (id: "ethiopia", 32 BYN, 250г, light, ["цветочный", "бергамот"]), "Колумбия Уила" (id: "colombia", 29 BYN, 250г, medium, ["карамель", "красное яблоко"]), "Бразилия Серрадо" (id: "brazil", 26 BYN, 250г, medium-dark, ["орех", "шоколад"], "эспрессо"), "Дрип-пакеты ассорти" (id: "drip-pack", 18 BYN, 10 шт), "Подписка на кофе" (id: "subscription", 54 BYN/мес, period: "месяц", includes: ["2 пачки по 250 г", "Бесплатная доставка"])
- [x] 2.2 Создать Zod-схему `src/lib/product-schema.ts` с дискриминированным объединением:
  ```typescript
  const base = z.object({ id: z.string(), name: z.string(), description: z.string().optional(), price: z.number().positive() });
  const ProductSchema = z.discriminatedUnion('type', [
    base.extend({ type: z.literal('coffee'), weight: z.string(), roastLevel: z.enum(['light', 'medium', 'medium-dark', 'dark']), notes: z.array(z.string()), recommendedFor: z.string().optional() }),
    base.extend({ type: z.literal('drip-pack'), quantity: z.number() }),
    base.extend({ type: z.literal('subscription'), period: z.string(), includes: z.array(z.string()) })
  ]);
  ```
  и экспортировать тип `Product`
- [x] 2.3 Создать функцию `src/lib/get-products.ts` с `getProducts()` и `getProductById()`, использующую ProductSchema
- [x] 2.4 Создать скрипт `scripts/validate-data.ts` для валидации данных через `import products from '@/data/products.json' with { type: 'json' }`

## 3. Создание данных сайта

- [x] 3.1 Создать файл `src/data/site.ts` с: name="Кварта", address="Минск, ул. Короля, 9", phone="+375 (29) 123-45-67" (заглушка), email="hello@example.com" (заглушка), hours={weekday:"8:00–20:00", weekend:"10:00–18:00"}, delivery={freeThreshold:50, day:"пятница", city:"Минск"}, pickup={address:"Минск, ул. Короля, 9"}
- [x] 3.2 Обновить `src/lib/site.ts`: перенести `siteName` на реэкспорт из `src/data/site.ts`, оставить `siteUrl` как обёртку для `NEXT_PUBLIC_SITE_URL`
- [x] 3.3 Создать файл `src/data/content.ts` с текстами секций: hero (`headline: "Свежий кофе", subheading: "Обжарка в четверг, доставка в пятницу", cta: "Оставить заявку"`), about (`story: "Аня и Дмитрий — бывшие бариста, с 2019 года обжаривают кофе партиями по 5 кг"`, `whyFresh: { description: "Обжарка в четверг → доставка в пятницу → зерно приходит к вам на 1–3 день после обжарки" }`), subscription (`description: "2×250 г каждый месяц, бесплатная доставка"`), delivery (`title: "Доставка и самовывоз"`)
- [x] 3.4 Проверить, что content.ts не дублирует данные из products.json и site.ts

## 4. Подготовка изображений

- [x] 4.1 Найти изображения для hero, продуктов, секции "О нас" на Unsplash/Pexels с бесплатной лицензией
- [x] 4.2 Подготовить исходники: WebP/JPEG q90+, размер до ~2000 px (без предсжатия до q85)
- [x] 4.3 Разместить изображения в `public/images/` (hero, products)
- [x] 4.4 Добавить источники изображений в раздел "Допущения" README.md (без создания SOURCES.md)

## 5. Настройка next.config

- [x] 5.1 Убедиться, что `images.formats` по умолчанию (['image/webp']) — изменений не требуется
- [x] 5.2 Проверить работу `next/image` с WebP-изображениями и `preload` для hero
- [x] 5.3 Добавить alt-тексты на русском для всех изображений (например: "Зёрна кофе крупным планом")

## 6. Финальная валидация

- [x] 6.1 Запустить `pnpm typecheck` для проверки TypeScript
- [x] 6.2 Запустить `pnpm build` для проверки валидации данных
- [x] 6.3 Проверить соответствие всех фактов ТЗ (цены, адреса, часы, названия сортов, вкусовые профили, id товаров)
- [x] 6.4 Убедиться, что раздел "Допущения" в README содержит: заглушки контактов (email `hello@example.com`), обжарки Колумбии medium и Бразилии medium-dark (не в ТЗ), самовывоз в любое рабочее время, источники изображений

## 7. Документирование

- [x] 7.1 Обновить README.md: добавить раздел "Допущения" с перечнем выдуманных данных и источников изображений
- [ ] 7.2 Закоммитить изменения с сообщением: "content: добавить контент и данные сайта"
