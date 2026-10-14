# План выполнения задачи 03: Контент и данные

**Задача:** Создать продукты, данные сайта, контент на русском  
**Приоритет:** P0 · **Оценка:** 30 мин  
**Дата создания:** 2026-10-14

---

## Фаза 1: Создание данных продуктов (10 мин)

### Шаг 1.1 — Создать `src/data/products.json`
```json
[
  {"id": "ethiopia-32", "name": "Эфиопия", "description": "Спелая вишня, цветочные ноты", "price": 32, "weight": "250g", "roastLevel": "medium", "notes": ["вишня", "цветы", "вино"]},
  {"id": "colombia-29", "name": "Колумбия", "description": "Молочный шоколад, фундук", "price": 29, "weight": "250g", "roastLevel": "medium", "notes": ["шоколад", "фундук"]},
  {"id": "brazil-26", "name": "Бразилия", "description": "Какао, орехи, полное тело", "price": 26, "weight": "250g", "roastLevel": "medium-dark", "notes": ["какао", "орехи"]},
  {"id": "drip-pack", "name": "Дрип-пакеты", "price": 18, "weight": "25g", "quantity": 10},
  {"id": "subscription", "name": "Подписка на кофе", "price": 54, "period": "месяц", "includes": ["250g сорт #1", "250g сорт #2", "Бесплатная доставка"]}
]
```

### Шаг 1.2 — Создать `src/lib/product-schema.ts`
```typescript
import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number().positive(),
  weight: z.string().optional(),
  roastLevel: z.enum(['light', 'medium', 'medium-dark', 'dark']).optional(),
  notes: z.array(z.string()).optional(),
});

export type Product = z.infer<typeof ProductSchema>;
```

### Шаг 1.3 — Создать `src/lib/get-products.ts`
```typescript
import { Product, ProductSchema } from './product-schema';
import productsData from '@/data/products.json';

export function getProducts(): Product[] {
  return productsData.map(p => ProductSchema.parse(p));
}

export function getProductById(id: string): Product | undefined {
  return getProducts().find(p => p.id === id);
}
```

---

## Фаза 2: Создание данных сайта (10 мин)

### Шаг 2.1 — Создать `src/data/site.ts`
```typescript
export const siteData = {
  name: 'Кварта',
  address: 'Минск, ул. Короля, 9',
  phone: '+375 (29) 123-45-67', // заглушка
  email: 'hello@kvarta.coffee', // заглушка
  hours: {
    weekday: '8:00 – 20:00',
    weekend: '10:00 – 18:00',
  },
  delivery: {
    minAmount: 50, // BYN
    isFree: true,
  },
  founders: [
    { name: 'Аня', role: 'Бариста, обжарка' },
    { name: 'Дмитрий', role: 'Бариста, логистика' },
  ],
  foundedYear: 2019,
  roastDay: 'четверг',
};
```

### Шаг 2.2 — Создать `src/data/content.ts`
```typescript
export const content = {
  hero: {
    headline: 'Свежий кофе с душой',
    subheading: 'Обжариваем в четверг, доставляем в пятницу',
    cta: 'Оставить заявку',
  },
  about: {
    title: 'Кто мы',
    story: 'Аня и Дмитрий — бариста с 2019 года. Начали с малого, теперь это способ жизни',
    whyFresh: {
      title: 'Почему свежесть важна',
      description: 'Кофе теряет вкус через неделю. Обжарка четверг → доставка пятница → 1–3 дня у вас = пик вкуса',
    },
  },
  subscription: {
    title: 'Подписка',
    description: '2×250 г каждый месяц, бесплатная доставка',
    price: '54 BYN/месяц',
  },
  delivery: {
    title: 'Доставка и самовывоз',
    conditions: 'Доставка по Минску в пятницу. От 50 BYN — бесплатно',
  },
};
```

---

## Фаза 3: Подготовка изображений (8 мин)

### Шаг 3.1 — Найти изображения
- Hero, продукты, о нас с Unsplash/Pexels
- OG-картинка 1200×630 px для соцсетей

### Шаг 3.2 — Оптимизировать
```bash
# WebP конверсия
cwebp input.jpg -o output.webp -q 85
```

### Шаг 3.3 — Разместить
```
public/images/
├── hero.jpg
├── products/
└── og-image.jpg
```

### Шаг 3.4 — Создать `public/images/SOURCES.md`
Список с ссылками на Unsplash/Pexels

---

## Фаза 4: Валидация (2 мин)

```bash
pnpm typecheck
# Проверить что все данные валидны
```

**Чек-лист контента:**
- ✅ 3 сорта: Эфиопия 32, Колумбия 29, Бразилия 26 BYN
- ✅ Дрип-пакеты 18 BYN, подписка 54 BYN
- ✅ Адрес, часы, контакты (заглушки помечены)
- ✅ Основатели Аня и Дмитрий, с 2019 г
- ✅ Свежесть: четверг обжарка → пятница доставка → 1–3 дня

---

## Финальный коммит

```bash
git add .
git commit -m "content: добавить контент и данные сайта

- Создана база продуктов (JSON + TypeScript типы)
- Добавлены данные сайта (адрес, часы, контакты)
- Созданы тексты всех секций
- Оптимизированы и размещены изображения
- Заглушки контактов помечены"
```

---

**Ожидаемое время:** 30 мин  
**Статус:** ⏳ Ожидает выполнения
