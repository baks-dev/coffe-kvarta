# План выполнения задачи 07: Источник заявки (атрибуция)

**Задача:** Отслеживать UTM параметры и источник трафика  
**Приоритет:** P0 · **Оценка:** 20 мин  
**Дата создания:** 2026-10-14

---

## Фаза 1: Клиентский хук для атрибуции (10 мин)

### Шаг 1.1 — Создать `src/lib/use-attribution.ts`

```typescript
'use client';

import { useEffect, useState } from 'react';

interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  yclid?: string;
  fbclid?: string;
  gclid?: string;
  referrer: string;
  landingUrl: string;
}

export function useAttribution(): Attribution {
  const [attribution, setAttribution] = useState<Attribution>({
    referrer: '',
    landingUrl: '',
  });

  useEffect(() => {
    // Получить атрибуцию из localStorage или создать новую
    const stored = sessionStorage.getItem('attribution');
    
    if (!stored) {
      const params = new URLSearchParams(window.location.search);
      const newAttribution: Attribution = {
        utm_source: params.get('utm_source') || undefined,
        utm_medium: params.get('utm_medium') || undefined,
        utm_campaign: params.get('utm_campaign') || undefined,
        utm_content: params.get('utm_content') || undefined,
        utm_term: params.get('utm_term') || undefined,
        yclid: params.get('yclid') || undefined,
        fbclid: params.get('fbclid') || undefined,
        gclid: params.get('gclid') || undefined,
        referrer: document.referrer,
        landingUrl: window.location.href,
      };
      
      sessionStorage.setItem('attribution', JSON.stringify(newAttribution));
      setAttribution(newAttribution);
    } else {
      setAttribution(JSON.parse(stored));
    }
  }, []);

  return attribution;
}
```

---

## Фаза 2: Интеграция в форму (8 мин)

### Шаг 2.1 — Обновить `src/lib/lead-schema.ts`

```typescript
export const leadSchema = z.object({
  // ... существующие поля ...
  attribution: z.object({
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_content: z.string().optional(),
    utm_term: z.string().optional(),
    yclid: z.string().optional(),
    fbclid: z.string().optional(),
    gclid: z.string().optional(),
    referrer: z.string(),
    landingUrl: z.string().url(),
  }).optional(),
});
```

### Шаг 2.2 — Обновить форму компонент

**В `src/components/lead-form.tsx`:**

```typescript
'use client';

import { useAttribution } from '@/lib/use-attribution';

export function LeadForm() {
  const attribution = useAttribution();

  const onSubmit = async (data: Lead) => {
    // ...
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        attribution,
      }),
    });
    // ...
  };
  
  // ...
}
```

---

## Фаза 3: Сохранение на сервере (2 мин)

### Шаг 3.1 — API обновления

**В `src/app/api/lead/route.ts`:**

```typescript
const leadData = {
  ...validatedData,
  id: leadId,
  createdAt: new Date().toISOString(),
  attribution: body.attribution || {},
  userAgent: request.headers.get('user-agent'),
  ip,
};

// Отправить в Telegram с атрибуцией
const message = `
📝 Новая заявка!

Имя: ${leadData.name}
Телефон: ${leadData.phone}
Интерес: ${leadData.interest}

📊 Источник:
utm_source: ${leadData.attribution?.utm_source || '—'}
utm_medium: ${leadData.attribution?.utm_medium || '—'}
utm_campaign: ${leadData.attribution?.utm_campaign || '—'}
Referrer: ${leadData.attribution?.referrer || '—'}
`.trim();
```

---

## Чек-лист

- ✅ `useAttribution` хук отслеживает UTM параметры
- ✅ Атрибуция сохраняется в sessionStorage (не перезаписывается)
- ✅ Поддерживаются: utm_*, yclid, fbclid, gclid, referrer
- ✅ Данные отправляются в API `/api/lead`
- ✅ Сервер сохраняет атрибуцию
- ✅ Telegram сообщение содержит источник

---

## Финальный коммит

```bash
git add .
git commit -m "feat: добавить отслеживание источника заявки

- Клиентский хук useAttribution для UTM параметров
- Сохранение first-touch в sessionStorage
- Поддержка utm_*, yclid, fbclid, gclid, referrer
- Отправка атрибуции в API /api/lead
- Telegram сообщение с источником трафика"
```

---

**Ожидаемое время:** 20 мин  
**Статус:** ⏳ Ожидает выполнения
