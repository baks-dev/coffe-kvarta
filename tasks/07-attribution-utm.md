# 07. Источник заявки (атрибуция)

**Приоритет:** P0 · **Оценка:** 20 мин

## Цель
Менеджер видит: из какой рекламы, с какого объявления, с какой страницы пришёл клиент.

## Подзадачи
- [ ] Клиентский хук: при первом заходе читает `utm_source/medium/campaign/content/term`, `yclid`, `fbclid`, `gclid`, `referrer`, `landing URL`
- [ ] Сохранять в `sessionStorage`/`localStorage` (first-touch не перезаписывать при внутренней навигации)
- [ ] Отправлять в теле `/api/lead` как `attribution` + `pageUrl` отправки
- [ ] Сервер валидирует (Zod, обрезка длин) и сохраняет; выводит в Telegram
- [ ] Instagram-реклама: учесть `fbclid`, `utm_*`, `ig` в referrer

## Критерии приёмки
- Заход по `/?utm_source=instagram&utm_campaign=x&utm_content=ad1` → в заявке есть все три значения даже после прокрутки/навигации.
