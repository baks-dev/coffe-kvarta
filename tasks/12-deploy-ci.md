# 12. Деплой и CI

**Приоритет:** P0 · **Оценка:** 30 мин

## Подзадачи
- [ ] GitHub Actions: install (pnpm) → lint → typecheck → test → build
- [ ] Vercel: подключить репозиторий, автодеплой master + preview для PR
- [ ] Env в Vercel: Upstash (KV), Telegram, GA4/Метрика ID
- [ ] Подключить Upstash через Vercel Marketplace
- [ ] **Проверить форму на боевом URL** (требование ТЗ: форма должна работать прямо там)
- [ ] Заголовки безопасности в `next.config` (CSP по возможности, X-Content-Type-Options, Referrer-Policy); HTTPS даёт Vercel

## Критерии приёмки
- Публичная ссылка открывается; заявка с боевого сайта попадает в хранилище и Telegram.
