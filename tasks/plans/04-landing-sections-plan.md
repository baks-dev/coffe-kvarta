# План выполнения задачи 04: Секции лендинга

**Задача:** Создать все секции лендинга с контентом (SSG)  
**Приоритет:** P0 · **Оценка:** 90 мин  
**Дата создания:** 2026-10-14

---

## Фаза 1: Структура страницы (5 мин)

### Шаг 1.1 — Создать `src/app/page.tsx`
```typescript
import { Hero } from '@/components/sections/hero';
import { About } from '@/components/sections/about';
import { Products } from '@/components/sections/products';
import { Subscription } from '@/components/sections/subscription';
import { Delivery } from '@/components/sections/delivery';
import { Contacts } from '@/components/sections/contacts';
import { LeadForm } from '@/components/lead-form';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Products />
      <Subscription />
      <Delivery />
      <Contacts />
      <LeadForm />
      <Footer />
    </main>
  );
}
```

---

## Фаза 2: Компоненты секций (60 мин)

### Шаг 2.1 — Header с sticky CTA (10 мин)

**Создать:** `src/components/header.tsx`
```typescript
'use client';

import { Logo } from './logo';
import { Button } from './ui/button';
import { useState } from 'react';

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => setScrolled(window.scrollY > 0));
  }

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow ${scrolled ? 'shadow-md' : ''}`}>
      <div className="container flex justify-between items-center py-4">
        <Logo />
        <Button onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })}>
          Оставить заявку
        </Button>
      </div>
    </header>
  );
}
```

### Шаг 2.2 — Hero секция (8 мин)

**Создать:** `src/components/sections/hero.tsx`
```typescript
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { content } from '@/data/content';

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="container max-w-4xl text-center">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary-900 mb-6">
          {content.hero.headline}
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
          {content.hero.subheading}
        </p>
        <Button size="lg" onClick={() => document.getElementById('form')?.scrollIntoView()}>
          {content.hero.cta}
        </Button>
      </div>
    </section>
  );
}
```

### Шаг 2.3 — About секция (10 мин)

**Создать:** `src/components/sections/about.tsx`
```typescript
import { content, siteData } from '@/data';

export function About() {
  return (
    <section className="py-20 bg-white">
      <div className="container max-w-4xl">
        <h2 className="text-4xl font-serif font-bold text-primary-700 mb-8">
          {content.about.title}
        </h2>
        <p className="text-lg text-gray-700 mb-12">
          {content.about.story}
        </p>
        
        <h3 className="text-2xl font-serif font-bold text-primary-700 mb-6">
          {content.about.whyFresh.title}
        </h3>
        <p className="text-lg text-gray-700 mb-8">
          {content.about.whyFresh.description}
        </p>

        {/* Timeline */}
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          <div className="text-center">
            <p className="font-bold text-primary-700">Четверг</p>
            <p className="text-gray-600">Обжарка партии 5 кг</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-primary-700">Пятница</p>
            <p className="text-gray-600">Доставка и самовывоз</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-primary-700">1–3 дня</p>
            <p className="text-gray-600">Пик вкуса у вас</p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Шаг 2.4 — Products секция (12 мин)

**Создать:** `src/components/sections/products.tsx`
```typescript
import { getProducts } from '@/lib/get-products';
import { Button } from '@/components/ui/button';

export function Products() {
  const products = getProducts();

  return (
    <section className="py-20 bg-gray-50">
      <div className="container">
        <h2 className="text-4xl font-serif font-bold text-primary-700 mb-12">
          Ассортимент
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-primary-700 mb-2">
                {product.name}
              </h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <p className="text-2xl font-bold text-primary-900 mb-4">
                {product.price} BYN
              </p>
              <Button variant="primary" className="w-full">
                Хочу
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Шаг 2.5 — Subscription, Delivery, Contacts (20 мин)

**Создать:** `src/components/sections/subscription.tsx`, `delivery.tsx`, `contacts.tsx`

Каждая секция: title + description + информация + CTA кнопка

### Шаг 2.6 — Footer (5 мин)

**Создать:** `src/components/footer.tsx`
```typescript
export function Footer() {
  return (
    <footer className="bg-primary-900 text-white py-8">
      <div className="container">
        <p className="text-center text-sm">
          © 2024 Кварта. Свежий кофе с душой.
        </p>
      </div>
    </footer>
  );
}
```

---

## Фаза 3: Проверка адаптивности (15 мин)

```bash
pnpm dev
# Открыть в браузере: http://localhost:3000

# Проверить:
# 360px - мобильная версия
# 768px - планшет
# 1440px - десктоп
# Нет горизонтального скролла!
```

---

## Фаза 4: SSG проверка (10 мин)

```bash
pnpm build
# Проверить что page.tsx генерируется как статичная страница
# На выходе должен быть HTML, а не динамический контент
```

---

## Чек-лист

- ✅ Header с sticky CTA
- ✅ Hero с headline и CTA
- ✅ About с timeline
- ✅ Products с карточками
- ✅ Subscription с информацией
- ✅ Delivery с условиями
- ✅ Contacts с картой
- ✅ Lead Form
- ✅ Footer
- ✅ Корректная на 360–1440 px
- ✅ Без горизонтального скролла
- ✅ SSG: весь контент статичный

---

## Финальный коммит

```bash
git add .
git commit -m "feat: создать все секции лендинга

- Header с sticky CTA 'Оставить заявку'
- Hero с headline, description и CTA
- About с историей и timeline свежести
- Products с карточками товаров и кнопками
- Subscription с описанием подписки
- Delivery с условиями доставки и самовывоза
- Contacts с адресом и картой
- Lead Form (подготовка к 05)
- Footer
- Адаптивный дизайн: 360–1440 px
- SSG: весь контент статичный"
```

---

**Ожидаемое время:** 90 мин  
**Статус:** ⏳ Ожидает выполнения
