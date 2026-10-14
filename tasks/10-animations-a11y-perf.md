# 10. Анимации, доступность, производительность

**Приоритет:** P1 · **Оценка:** 40 мин

## Подзадачи
- [ ] Анимации: лёгкий CSS (fade/slide при скролле, IntersectionObserver); Framer Motion только если реально нужен (вес бандла)
- [ ] `prefers-reduced-motion` отключает анимации
- [ ] A11y (WCAG 2.1 AA): семантика, лейблы, `aria-live` для ошибок и успеха формы, фокус-стили, навигация с клавиатуры, alt у фото
- [ ] `next/image` с `sizes`, `priority` только для hero, AVIF/WebP
- [ ] Шрифты через `next/font` с `display: swap`
- [ ] Lighthouse mobile: цель Performance ≥ 90, A11y/SEO/Best Practices ≥ 95; LCP < 2.5 с, CLS < 0.1
- [ ] Минимум клиентского JS: секции — серверные компоненты, `"use client"` только форма/интерактив

## Критерии приёмки
- Скриншот/отчёт Lighthouse mobile на боевом URL (требование ТЗ).
