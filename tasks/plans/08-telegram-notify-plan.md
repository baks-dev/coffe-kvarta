# План выполнения задачи 08: Дублирование заявки в Telegram

**Задача:** Отправлять заявки в Telegram чат менеджера  
**Приоритет:** P1 · **Оценка:** 20 мин  
**Дата создания:** 2026-10-14

---

## Фаза 1: Создание Telegram бота (5 мин)

### Шаг 1.1 — Создать бот в @BotFather

1. Открить https://t.me/BotFather
2. Написать `/newbot`
3. Дать имя бота (например, `KvartaCoffeeBot`)
4. Скопировать `TELEGRAM_BOT_TOKEN`

### Шаг 1.2 — Получить ID чата

1. Добавить бота в чат/группу
2. Отправить сообщение: `@userinfobot`
3. Скопировать ID чата

### Шаг 1.3 — Добавить в `.env.local`

```
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=-1001234567890
```

---

## Фаза 2: Функция отправки в Telegram (8 мин)

### Шаг 2.1 — Создать `src/lib/send-telegram.ts`

```typescript
interface TelegramMessage {
  name: string;
  phone: string;
  interest: string;
  comment?: string;
  attribution?: any;
  pageUrl?: string;
}

export async function sendToTelegram(data: TelegramMessage) {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.warn('Telegram env vars not set');
    return;
  }

  const message = formatTelegramMessage(data);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'HTML',
        }),
        signal: AbortSignal.timeout(3000),
      }
    );

    if (!response.ok) {
      console.error('Telegram API error:', await response.text());
    }
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    // Не бросаем ошибку — заявка уже сохранена
  }
}

function formatTelegramMessage(data: TelegramMessage): string {
  const escapeHtml = (str: string) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  return `
<b>📝 Новая заявка!</b>

<b>Имя:</b> ${escapeHtml(data.name)}
<b>Телефон:</b> <code>${escapeHtml(data.phone)}</code>
<b>Интерес:</b> ${escapeHtml(data.interest)}
${data.comment ? `<b>Комментарий:</b> ${escapeHtml(data.comment)}` : ''}

${
  data.attribution?.utm_source
    ? `<b>📊 Источник:</b>
utm_source: ${escapeHtml(data.attribution.utm_source)}
utm_medium: ${escapeHtml(data.attribution.utm_medium || '—')}
utm_campaign: ${escapeHtml(data.attribution.utm_campaign || '—')}
referrer: ${escapeHtml(data.attribution.referrer || '—')}`
    : ''
}

${data.pageUrl ? `<b>Страница:</b> ${escapeHtml(data.pageUrl)}` : ''}
  `.trim();
}
```

---

## Фаза 3: Интеграция в API (5 мин)

### Шаг 3.1 — Обновить `src/app/api/lead/route.ts`

```typescript
import { sendToTelegram } from '@/lib/send-telegram';

export async function POST(request: Request) {
  try {
    // ... валидация, дедуп, сохранение ...

    // Отправить в Telegram асинхронно
    sendToTelegram({
      name: validatedData.name,
      phone: validatedData.phone,
      interest: validatedData.interest,
      comment: validatedData.comment,
      attribution: body.attribution,
      pageUrl: request.headers.get('referer'),
    }).catch(err => console.error('Telegram error:', err));

    return new Response(
      JSON.stringify({ status: 'success', id: leadId }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // ...
  }
}
```

---

## Фаза 4: Тестирование (2 мин)

```bash
pnpm dev

# 1. Заполнить форму и отправить
# 2. Проверить что сообщение пришло в Telegram чат
# 3. Отключить интернет, отправить еще одну заявку
# 4. Включить интернет — форма была успешна, но в Telegram может не быть
# 5. Проверить что форма работает даже если Telegram недоступен
```

---

## Чек-лист

- ✅ Бот создан через @BotFather
- ✅ `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID` в env
- ✅ Отправка через Telegram Bot API (не telegraf)
- ✅ Экранирование HTML в сообщении
- ✅ Таймаут запроса (3 сек)
- ✅ Ошибка Telegram не ронит заявку
- ✅ Сообщение содержит все поля + атрибуцию

---

## Финальный коммит

```bash
git add .
git commit -m "feat: добавить отправку заявок в Telegram

- Создана функция sendToTelegram для Bot API
- Отправка асинхронно через fetch (не блокирует ответ)
- Экранирование HTML для безопасности
- Таймаут 3 сек для быстрого ответа
- Ошибка Telegram не ронит заявку
- Telegram недоступность — форма работает"
```

---

**Ожидаемое время:** 20 мин  
**Статус:** ⏳ Ожидает выполнения
