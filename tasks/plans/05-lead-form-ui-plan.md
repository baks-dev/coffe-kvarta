# План выполнения задачи 05: Форма заявки (UI)

**Задача:** Создать форму с валидацией белорусского номера  
**Приоритет:** P0 · **Оценка:** 45 мин  
**Дата создания:** 2026-10-14

---

## Фаза 1: Zod схема и валидация номера (10 мин)

### Шаг 1.1 — Создать `src/lib/lead-schema.ts`

```typescript
import { z } from 'zod';

const BELARUS_PHONE_REGEX = /^(\+375|80)\s?(\(?(25|29|33|44)\)?)\s?(\d{3})\s?-?(\d{2})\s?-?(\d{2})$/;

export const normalizePhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('375')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('80')) {
    return `+375${cleaned.slice(2)}`;
  }
  return phone;
};

export const leadSchema = z.object({
  name: z.string().min(2, 'Имя минимум 2 символа'),
  phone: z.string()
    .refine(
      p => BELARUS_PHONE_REGEX.test(p),
      'Введите номер в формате +375 29 123-45-67'
    )
    .transform(normalizePhoneNumber),
  interest: z.enum(['subscription', 'order', 'question'], {
    errorMap: () => ({ message: 'Выберите вариант' })
  }),
  comment: z.string().optional(),
});

export type Lead = z.infer<typeof leadSchema>;
```

---

## Фаза 2: React Hook Form компонент (20 мин)

### Шаг 2.1 — Создать `src/components/lead-form.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { leadSchema, type Lead } from '@/lib/lead-schema';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select } from './ui/select';
import { toast } from 'sonner';

export function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, getValues } = useForm<Lead>({
    resolver: zodResolver(leadSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: Lead) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка отправки');
      }

      const result = await response.json();

      if (result.status === 'duplicate') {
        toast.info('Мы уже получили вашу заявку с этого номера. Менеджер вскоре вам перезвонит.');
      } else {
        setIsSuccess(true);
        toast.success('Спасибо! Мы получили вашу заявку.');
        reset();
        setTimeout(() => setIsSuccess(false), 5000);
      }
    } catch (error) {
      toast.error(
        `Ошибка отправки. Попробуйте ещё раз или позвоните: ${error instanceof Error ? error.message : 'неизвестная ошибка'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="form" className="py-20 bg-primary-50">
      <div className="container max-w-xl">
        <h2 className="text-3xl font-serif font-bold text-primary-700 mb-6">
          Оставить заявку
        </h2>

        {isSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">
              ✓ Спасибо! Мы получили вашу заявку. Менеджер свяжется с вами в ближайшее время.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Ваше имя *"
            placeholder="Например, Иван"
            {...register('name')}
            error={errors.name?.message}
            required
          />

          <Input
            label="Телефон *"
            placeholder="+375 29 123-45-67"
            {...register('phone')}
            error={errors.phone?.message}
            required
          />

          <Select
            label="Что вас интересует? *"
            options={[
              { value: '', label: 'Выберите вариант' },
              { value: 'subscription', label: 'Подписка на кофе' },
              { value: 'order', label: 'Разовый заказ' },
              { value: 'question', label: 'Вопрос' },
            ]}
            {...register('interest')}
            error={errors.interest?.message}
            required
          />

          <Textarea
            label="Комментарий (не обязательно)"
            placeholder="Напишите, если есть дополнительные вопросы"
            {...register('comment')}
            error={errors.comment?.message}
            rows={4}
          />

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            isLoading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Отправляем...' : 'Отправить заявку'}
          </Button>
        </form>
      </div>
    </section>
  );
}
```

---

## Фаза 3: Тестирование формы (15 мин)

### Шаг 3.1 — Локальное тестирование

```bash
pnpm dev
# Открыть http://localhost:3000

# Тесты в браузере:
1. Введите невалидный номер → ошибка "Введите номер в формате..."
2. Введите валидный номер → без ошибки
3. Оставьте имя пусто → ошибка при отправке
4. Введите валидные данные → попробуйте отправить
5. Кликните на кнопку дважды быстро → один запрос (защита от двойного клика)
6. Выключите интернет → ошибка "Ошибка отправки"
```

### Шаг 3.2 — Проверить функциональность

**Чек-лист:**
- ✅ Невалидный номер не проходит валидацию
- ✅ Подсказка понятна: "+375 29 123-45-67"
- ✅ Двойной клик = один запрос
- ✅ Состояния: idle → sending → success/error
- ✅ Сетевой сбой показывает ошибку
- ✅ Данные формы сохраняются при ошибке
- ✅ Toast-уведомления работают

---

## Финальный коммит

```bash
git add .
git commit -m "feat: создать форму заявки с валидацией

- Zod-схема для валидации белорусского номера
- Нормализация номера (+375 и 80* форматы)
- React Hook Form с zodResolver
- Input, Textarea, Select компоненты
- Состояния: idle, sending, success, error
- Защита от двойного клика
- Toast-уведомления через Sonner
- Сохранение данных при ошибке"
```

---

**Ожидаемое время:** 45 мин  
**Статус:** ⏳ Ожидает выполнения
