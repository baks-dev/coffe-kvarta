# План выполнения задачи 11: Тесты

**Задача:** Unit тесты, интеграционные тесты, e2e тесты  
**Приоритет:** P1 · **Оценка:** 40 мин  
**Дата создания:** 2026-10-14

---

## Фаза 1: Установка и настройка (5 мин)

### Шаг 1.1 — Установить Vitest

```bash
pnpm add --save-dev vitest @vitest/ui happy-dom
```

### Шаг 1.2 — Установить RTL и Playwright

```bash
pnpm add --save-dev @testing-library/react @testing-library/jest-dom
pnpm add --save-dev @playwright/test
```

### Шаг 1.3 — Создать `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Шаг 1.4 — Создать `vitest.setup.ts`

```typescript
import '@testing-library/jest-dom';
```

### Шаг 1.5 — Обновить `package.json` скрипты

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Фаза 2: Unit тесты (12 мин)

### Шаг 2.1 — Тесты валидатора номера

**Создать:** `src/lib/__tests__/phone-validator.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { leadSchema, normalizePhoneNumber } from '@/lib/lead-schema';

describe('Phone validation', () => {
  describe('normalizePhoneNumber', () => {
    it('should normalize +375 format', () => {
      expect(normalizePhoneNumber('+375 29 123-45-67')).toBe('+375291234567');
    });

    it('should normalize 80 format', () => {
      expect(normalizePhoneNumber('80 29 123-45-67')).toBe('+375291234567');
    });

    it('should handle various formats', () => {
      const inputs = [
        '+375291234567',
        '375291234567',
        '80291234567',
        '+375 (29) 123-45-67',
      ];
      inputs.forEach(input => {
        expect(normalizePhoneNumber(input)).toBe('+375291234567');
      });
    });
  });

  describe('leadSchema phone validation', () => {
    it('should accept valid +375 format', () => {
      const result = leadSchema.safeParse({
        name: 'John',
        phone: '+375 29 123-45-67',
        interest: 'subscription',
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid 80 format', () => {
      const result = leadSchema.safeParse({
        name: 'John',
        phone: '80 29 123-45-67',
        interest: 'subscription',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid operators (23, 24)', () => {
      const result = leadSchema.safeParse({
        name: 'John',
        phone: '+375 23 123-45-67',
        interest: 'subscription',
      });
      expect(result.success).toBe(false);
    });

    it('should reject short numbers', () => {
      const result = leadSchema.safeParse({
        name: 'John',
        phone: '+375 29 123-45',
        interest: 'subscription',
      });
      expect(result.success).toBe(false);
    });
  });
});
```

### Шаг 2.2 — Тесты API обработчика

**Создать:** `src/app/api/lead/__tests__/route.test.ts`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Мокировать Redis
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(() => ({
    incr: vi.fn().mockResolvedValue(1),
    setex: vi.fn().mockResolvedValue(true),
    hset: vi.fn().mockResolvedValue(true),
    exists: vi.fn().mockResolvedValue(false),
  })),
}));

describe('POST /api/lead', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should accept valid lead data', async () => {
    const validData = {
      name: 'John',
      phone: '+375 29 123-45-67',
      interest: 'subscription',
    };

    // Тест запроса к API
    const request = new Request('http://localhost:3000/api/lead', {
      method: 'POST',
      body: JSON.stringify(validData),
    });

    // Здесь нужно вызвать обработчик из route.ts
    // ... логика зависит от вашей настройки
  });

  it('should return 400 for invalid data', () => {
    // Тест с невалидными данными
  });

  it('should handle duplicate phones within 10 minutes', () => {
    // Тест дедупликации
  });
});
```

---

## Фаза 3: RTL тесты формы (12 мин)

### Шаг 3.1 — Тесты формы

**Создать:** `src/components/__tests__/lead-form.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@testing-library/react';
import { LeadForm } from '@/components/lead-form';

// Мокировать fetch
global.fetch = vi.fn();

describe('LeadForm', () => {
  it('should display phone error for invalid number', async () => {
    render(<LeadForm />);

    const phoneInput = screen.getByPlaceholderText(/\+375/);
    await userEvent.type(phoneInput, '123');
    await userEvent.tab(); // blur event

    expect(screen.getByText(/Введите номер в формате/)).toBeInTheDocument();
  });

  it('should disable submit button while sending', async () => {
    render(<LeadForm />);

    const button = screen.getByText(/Отправить заявку/);
    expect(button).not.toBeDisabled();

    // Имитировать отправку
    await userEvent.click(button);
    expect(button).toBeDisabled();
  });

  it('should handle network errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<LeadForm />);

    // Заполнить форму и отправить
    const button = screen.getByText(/Отправить заявку/);
    await userEvent.click(button);

    expect(screen.getByText(/Ошибка отправки/)).toBeInTheDocument();
  });
});
```

---

## Фаза 4: E2E тесты Playwright (8 мин)

### Шаг 4.1 — Создать `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Шаг 4.2 — Создать E2E тест

**Создать:** `e2e/lead-form.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Lead form flow', () => {
  test('should submit form successfully', async ({ page }) => {
    await page.goto('/');

    // Заполнить форму
    await page.fill('input[placeholder*="Например"]', 'Иван');
    await page.fill('input[placeholder*="+375"]', '+375 29 123-45-67');
    await page.selectOption('select', 'subscription');

    // Отправить
    const button = page.locator('button:has-text("Отправить заявку")');
    await button.click();

    // Проверить успех
    await expect(
      page.locator('text=Спасибо! Мы получили вашу заявку')
    ).toBeVisible();
  });

  test('should show duplicate message on second submit', async ({ page }) => {
    await page.goto('/');

    const phone = '+375 29 999-99-99';
    const button = page.locator('button:has-text("Отправить заявку")');

    // Первая отправка
    await page.fill('input[placeholder*="Например"]', 'Test');
    await page.fill('input[placeholder*="+375"]', phone);
    await page.selectOption('select', 'question');
    await button.click();

    await expect(page.locator('text=получили вашу заявку')).toBeVisible();

    // Перезагрузка и вторая отправка
    await page.reload();
    await page.fill('input[placeholder*="Например"]', 'Test2');
    await page.fill('input[placeholder*="+375"]', phone);
    await page.selectOption('select', 'order');
    await button.click();

    await expect(
      page.locator('text=уже получили вашу заявку')
    ).toBeVisible();
  });
});
```

---

## Фаза 5: Запуск всех тестов (3 мин)

```bash
# Unit тесты
pnpm test

# E2E тесты
pnpm test:e2e

# Все вместе в CI
pnpm test && pnpm test:e2e
```

---

## Финальный коммит

```bash
git add .
git commit -m "test: добавить unit, integration и e2e тесты

- Vitest для unit тестов валидатора номера
- RTL тесты для компонента формы
- Playwright e2e сценарий отправки форм
- Тесты дедупликации заявок
- Тесты сетевых ошибок
- Скрипты test и test:e2e"
```

---

**Ожидаемое время:** 40 мин  
**Статус:** ⏳ Ожидает выполнения
