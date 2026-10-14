# План выполнения задачи 12: Деплой и CI

**Задача:** GitHub Actions CI, Vercel деплой, проверка формы на боевом URL  
**Приоритет:** P0 · **Оценка:** 30 мин  
**Дата создания:** 2026-10-14

---

## Фаза 1: GitHub Actions CI (10 мин)

### Шаг 1.1 — Создать `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [master, main]
  pull_request:
    branches: [master, main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Typecheck
        run: pnpm typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm build
```

---

## Фаза 2: Vercel Deployment (8 мин)

### Шаг 2.1 — Подключить репозиторий к Vercel

1. Перейти на https://vercel.com
2. Импортировать репозиторий
3. Выбрать Next.js framework
4. Настроить переменные окружения

### Шаг 2.2 — Добавить env переменные в Vercel

**Settings → Environment Variables:**

```
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...
NEXT_PUBLIC_GA4_ID=...
NEXT_PUBLIC_YM_ID=...
```

### Шаг 2.3 — Включить автодеплой

- **Production:** Автодеплой из `master`/`main`
- **Preview:** Автодеплой для каждого PR

---

## Фаза 3: Upstash интеграция (5 мин)

### Шаг 3.1 — Подключить через Vercel Marketplace

1. Vercel Dashboard → Integrations → Marketplace
2. Поиск "Upstash"
3. Install → Select Project
4. Автоматически добавит `UPSTASH_REDIS_*` env vars

### Шаг 3.2 — Проверить переменные

В Vercel Settings должны быть:
```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

---

## Фаза 4: Заголовки безопасности (4 мин)

### Шаг 4.1 — Обновить `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## Фаза 5: Тестирование на production (3 мин)

### Шаг 5.1 — Дождаться деплоя

1. Закоммитить все изменения
2. Пушить в main/master
3. Дождаться завершения Vercel деплоя
4. Скопировать production URL

### Шаг 5.2 — Проверить форму на боевом URL

```
1. Открить https://kvarta-coffee.vercel.app (ваш URL)
2. Заполнить форму со всеми полями
3. Отправить
4. Проверить:
   - ✅ Form успешно отправлена
   - ✅ Уведомление в Telegram пришло
   - ✅ Данные в Upstash Redis сохранены
5. Отправить ещё раз же номер → "уже получили"
6. Дождаться 10 минут → отправить еще раз → новая запись
```

### Шаг 5.3 — Проверить Lighthouse на production

```
1. DevTools → Lighthouse
2. Measure page load (на production URL)
3. Performance ≥ 90
4. A11y ≥ 95
5. SEO ≥ 95
6. Best Practices ≥ 95
7. Скриншот отчета для сдачи
```

---

## Чек-лист

- ✅ GitHub Actions workflow создан (install → lint → typecheck → test → build)
- ✅ Репозиторий подключен к Vercel
- ✅ Env переменные добавлены в Vercel
- ✅ Upstash интегрирован через Marketplace
- ✅ Автодеплой из main/master работает
- ✅ Preview деплой для PR работает
- ✅ Заголовки безопасности в next.config.js
- ✅ HTTPS от Vercel (автоматически)
- ✅ Форма работает на production URL
- ✅ Telegram уведомления приходят
- ✅ Lighthouse mobile ≥ 90 на production

---

## Финальный коммит

```bash
git add .
git commit -m "ci: настроить GitHub Actions и Vercel деплой

- GitHub Actions: lint → typecheck → test → build
- Vercel автодеплой из master с preview для PR
- Upstash интегрирован через Vercel Marketplace
- Env переменные: Redis, Telegram, Analytics
- Заголовки безопасности (CSP, X-Frame-Options и др)
- HTTPS от Vercel"
```

---

**Ожидаемое время:** 30 мин  
**Статус:** ⏳ Ожидает выполнения
