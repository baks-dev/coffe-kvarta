# План выполнения задачи 06: API `/api/lead`

**Задача:** Создать API эндпоинт с дедупликацией через Upstash Redis  
**Приоритет:** P0 · **Оценка:** 60 мин  
**Дата создания:** 2026-10-14

---

## Фаза 1: Настройка Upstash Redis (5-10 мин)

### Шаг 1.1 — Создать Upstash Redis

1. Перейти на https://console.upstash.com/
2. Создать новую базу (Free Tier)
3. Скопировать `UPSTASH_REDIS_REST_URL` и `UPSTASH_REDIS_REST_TOKEN`

### Шаг 1.2 — Добавить в `.env.local`

```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### Шаг 1.3 — Установить клиент

```bash
pnpm add @upstash/redis
```

---

## Фаза 2: Создание API хендлера (35-40 мин)

### Шаг 2.1 — Создать `src/app/api/lead/route.ts`

```typescript
import { Redis } from '@upstash/redis';
import { leadSchema } from '@/lib/lead-schema';
import { headers } from 'next/headers';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const RATE_LIMIT_KEY = (ip: string) => `ratelimit:${ip}`;
const DEDUP_KEY = (phone: string) => `lead:dedupe:${phone}`;

export async function POST(request: Request) {
  try {
    // 1. Парсинг и валидация
    const body = await request.json();
    const validatedData = leadSchema.parse(body);

    // 2. Rate limiting по IP
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = RATE_LIMIT_KEY(ip);
    const attempts = await redis.incr(rateLimitKey);
    
    if (attempts === 1) {
      await redis.expire(rateLimitKey, 3600); // 1 час
    }

    if (attempts > 50) {
      return new Response(
        JSON.stringify({ error: 'Слишком много заявок. Попробуйте позже.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Дедуп: проверить если такой номер недавно отправлял
    const dedupeKey = DEDUP_KEY(validatedData.phone);
    const isDuplicate = await redis.exists(dedupeKey);

    if (isDuplicate) {
      return new Response(
        JSON.stringify({ status: 'duplicate' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Сохранить дедуп ключ (10 минут = 600 сек)
    await redis.setex(dedupeKey, 600, '1');

    // 5. Создать запись заявки
    const leadId = `lead:${Date.now()}:${Math.random().toString(36).slice(2, 9)}`;
    const leadData = {
      ...validatedData,
      id: leadId,
      createdAt: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip,
    };

    // 6. Сохранить в Redis
    await redis.hset('leads', { [leadId]: JSON.stringify(leadData) });

    // 7. Отправить в Telegram (асинхронно, не блокируем ответ)
    sendToTelegram(leadData).catch(err => console.error('Telegram error:', err));

    return new Response(
      JSON.stringify({ status: 'success', id: leadId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('API error:', error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: 'Невалидные данные', details: error.errors }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Ошибка сервера' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function sendToTelegram(leadData: any) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    return;
  }

  const message = `
📝 Новая заявка!

Имя: ${leadData.name}
Телефон: ${leadData.phone}
Интерес: ${leadData.interest}
Комментарий: ${leadData.comment || '—'}
Время: ${leadData.createdAt}
  `.trim();

  try {
    await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (error) {
    console.error('Telegram send error:', error);
  }
}

import { z } from 'zod';
```

---

## Фаза 3: Тестирование API (15 мин)

### Шаг 3.1 — Локальное тестирование

```bash
pnpm dev

# Открыть DevTools → Network
# Заполнить форму и отправить

# Проверить:
# 1. Первый запрос → 200, status: "success"
# 2. Второй запрос с тем же номером → 200, status: "duplicate"
# 3. Запрос через 10 мин → 200, status: "success" (новая заявка)
# 4. Невалидный номер → 400
```

### Шаг 3.2 — Проверить в Upstash консоли

```
https://console.upstash.com/
1. Открить базу
2. Нажать "Browser" или "CLI"
3. Проверить: KEYS lead:*
4. Проверить: HGETALL leads
```

---

## Чек-лист

- ✅ Redis интегрирован через Upstash
- ✅ Валидация на сервере через Zod
- ✅ Дедуп через `SET NX EX 600`
- ✅ Rate limiting по IP
- ✅ Сохранение заявок в Redis (хэш)
- ✅ Отправка в Telegram асинхронно
- ✅ Ошибки не ронят дедуп ключ
- ✅ Honeypot и rate limit работают

---

## Финальный коммит

```bash
git add .
git commit -m "feat: создать API POST /api/lead с Redis

- Upstash Redis для хранилища и дедупликации
- Дедуп через SET NX EX 600 (10 минут)
- Rate limiting по IP через INCR
- Валидация данных на сервере (Zod)
- Сохранение заявок в Redis (хэш)
- Асинхронная отправка в Telegram
- Обработка ошибок без потери дедуп ключа
- Same-origin проверка через Origin header"
```

---

**Ожидаемое время:** 60 мин  
**Статус:** ⏳ Ожидает выполнения
