# План выполнения задачи 10: Анимации, доступность, производительность

**Задача:** Легкие анимации, WCAG 2.1 AA, Lighthouse 90+  
**Приоритет:** P1 · **Оценка:** 40 мин  
**Дата создания:** 2026-10-14

---

## Фаза 1: Анимации через CSS (10 мин)

### Шаг 1.1 — Создать `src/styles/animations.css`

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

.animate-slide-in-up {
  animation: slideInUp 0.6s ease-out forwards;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Шаг 1.2 — Создать хук для IntersectionObserver

**Создать:** `src/lib/use-in-view.ts`

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';

export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsInView(true);
        observer.unobserve(entry.target);
      }
    }, options);

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isInView] as const;
}
```

### Шаг 1.3 — Использовать в компонентах

```typescript
export function Products() {
  const [ref, isInView] = useInView({ threshold: 0.1 });

  return (
    <section ref={ref} className={isInView ? 'animate-fade-in' : 'opacity-0'}>
      {/* ... */}
    </section>
  );
}
```

---

## Фаза 2: Доступность (10 мин)

### Шаг 2.1 — Обновить семантику

- Использовать `<header>`, `<main>`, `<section>`, `<footer>`
- Заголовки в правильном порядке: `h1` → `h2` → `h3`
- Form labels связаны с inputs через `htmlFor`

### Шаг 2.2 — Добавить aria-live для ошибок

```typescript
export function LeadForm() {
  return (
    <form>
      {/* ... */}
      <div aria-live="polite" aria-atomic="true">
        {errors.name && <span role="alert">{errors.name.message}</span>}
      </div>
    </form>
  );
}
```

### Шаг 2.3 — Alt текст для изображений

```typescript
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Чашка свежего кофе на столе"
  width={1200}
  height={800}
/>
```

### Шаг 2.4 — Навигация с клавиатуры

- Tab перемещает фокус через все интерактивные элементы
- Enter активирует кнопки
- Стили фокуса видны (outline или box-shadow)

---

## Фаза 3: Оптимизация производительности (15 мин)

### Шаг 3.1 — Оптимизировать изображения

```typescript
import Image from 'next/image';

<Image
  src="/images/hero.jpg"
  alt="Hero"
  width={1200}
  height={800}
  priority // только для hero
  sizes="(max-width: 768px) 100vw, 50vw"
  quality={85}
/>
```

### Шаг 3.2 — Шрифты с display: swap

**Уже настроено в `src/lib/fonts.ts`:**
```typescript
export const fontSans = Inter({
  display: 'swap', // ← это уменьшает LCP
});
```

### Шаг 3.3 — Серверные компоненты

```typescript
// src/app/page.tsx
// По умолчанию серверные компоненты → меньше JS

// Только форма и интерактив:
'use client';
export function LeadForm() { /* ... */ }
```

### Шаг 3.4 — Минимум клиентского JS

```bash
# Проверить размер бандла
pnpm build
# В терминале будет: ○ /                    XX kB (гн green если < 60 kB)
```

### Шаг 3.5 — Vercel Speed Insights

```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function Layout() {
  return (
    <>
      {/* ... */}
      <SpeedInsights />
    </>
  );
}
```

---

## Фаза 4: Проверка Lighthouse (5 мин)

```bash
pnpm dev

# 1. Открить http://localhost:3000
# 2. DevTools → Lighthouse
# 3. Запустить "Mobile" отчет

# Цели:
# Performance ≥ 90
# A11y ≥ 95
# SEO ≥ 95
# Best Practices ≥ 95
# LCP < 2.5 с
# CLS < 0.1
```

---

## Чек-лист

- ✅ CSS анимации (fade, slide)
- ✅ prefers-reduced-motion отключает анимации
- ✅ IntersectionObserver для скролла
- ✅ Семантический HTML
- ✅ Лейблы для inputs
- ✅ aria-live для ошибок
- ✅ Alt текст для изображений
- ✅ Фокус стили видны
- ✅ Навигация с клавиатуры
- ✅ next/image с sizes и priority
- ✅ Шрифты с display: swap
- ✅ Серверные компоненты где возможно
- ✅ Lighthouse mobile ≥ 90

---

## Финальный коммит

```bash
git add .
git commit -m "feat: добавить анимации, доступность, оптимизацию

- CSS анимации (fade-in, slide-in-up)
- prefers-reduced-motion для отключения анимаций
- IntersectionObserver для animations on scroll
- Семантический HTML и правильная иерархия заголовков
- ARIA labels и aria-live для форм
- Alt текст для всех изображений
- Видимые focus стили для доступности
- next/image с sizes, priority, quality
- display: swap для шрифтов (LCP оптимизация)
- Серверные компоненты (minimal client JS)
- Lighthouse mobile ≥ 90 (Performance, A11y, SEO, BP)"
```

---

**Ожидаемое время:** 40 мин  
**Статус:** ⏳ Ожидает выполнения
