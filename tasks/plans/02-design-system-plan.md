# План выполнения задачи 02: Дизайн-система и тема

> ⚠️ **Заменён.** Этот черновой план устарел: он написан под Tailwind v3, палитра не снята с макета, компоненты используют хардкод цветов. Реализуйте задачу 02 по change `openspec/changes/add-design-system/` (proposal, spec, design, tasks). Расхождения перечислены в `design.md`, раздел Decisions, п. 7.

**Задача:** Визуальная идентичность «Кварты», не похожая на типовой AI-лендинг  
**Приоритет:** P0 · **Оценка:** 45 мин  
**Дата создания:** 2026-10-14

---

## Фаза 1: Анализ дизайна (5 мин)

### Шаг 1.1 — Изучить design.png и выписать палитру

**Открыть:** `images/design/design.png`

**Выписать:**
- 🎨 Основные цвета (первичный, вторичный, акцент)
- 🎨 Дополнительные цвета (успех, ошибка, предупреждение, нейтральная палитра)
- 📏 Размеры радиусов (border-radius)
- 🌑 Тени (shadow)
- ✏️ Типографика (шрифт заголовков, шрифт текста, размеры)
- 📐 Сетка (отступы, шаг сетки)
- 🏛️ Архитектура (container width, spacing system)

**Пример выписок:**
```
Основные цвета:
- Primary: #6B4423 (коричневый, кофейный тон)
- Secondary: #D4A574 (светло-коричневый, бежевый)
- Accent: #F5DEB3 (светлый бежевый)

Нейтральная палитра:
- Gray-50: #FAFAF9
- Gray-100: #F5F5F4
- Gray-900: #1C1917

Типографика:
- Заголовки: Serif или Sans (с кириллицей)
- Текст: Sans serif с хорошей кириллицей
```

**Чек-лист:**
- [ ] Выписаны основные цвета
- [ ] Выписаны нейтральные цвета (серая гамма)
- [ ] Выписаны размеры радиусов
- [ ] Выписаны тени
- [ ] Определена типографика
- [ ] Определена сетка и spacing

---

## Фаза 2: Кастомная тема Tailwind (10-12 мин)

### Шаг 2.1 — Создать конфиг Tailwind с токенами

**Открыть:** `tailwind.config.ts`

**Заменить содержимое на:**
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Основная палитра (кофейная)
        primary: {
          50: '#FBF8F5',
          100: '#F5F0E8',
          200: '#EBE0D4',
          300: '#DCC8B5',
          400: '#C4A98C',
          500: '#A0845A',
          600: '#8B6F42',
          700: '#6B4423',
          800: '#52341B',
          900: '#3D2512',
        },
        // Вторичная палитра (земляная)
        secondary: {
          50: '#FAF8F5',
          100: '#F3EDE4',
          200: '#E8DED2',
          300: '#D9CCBA',
          400: '#C4ADA0',
          500: '#A68D7F',
          600: '#8F7568',
          700: '#6D5548',
          800: '#533F34',
          900: '#3D3028',
        },
        // Нейтральная палитра
        gray: {
          50: '#FAFAF9',
          100: '#F5F5F4',
          200: '#E7E5E4',
          300: '#D6D3D1',
          400: '#A8A29E',
          500: '#78716B',
          600: '#57534E',
          700: '#44403C',
          800: '#292524',
          900: '#1C1917',
        },
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        base: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        none: 'none',
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.08)',
        base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '2rem',
          '2xl': '2rem',
        },
        maxWidth: {
          xs: '20rem',
          sm: '24rem',
          md: '28rem',
          lg: '32rem',
          xl: '36rem',
          '2xl': '42rem',
          '3xl': '48rem',
          '4xl': '56rem',
          '5xl': '64rem',
          '6xl': '72rem',
          '7xl': '80rem',
          full: '100%',
        },
      },
      fontFamily: {
        // Будут переопределены через next/font в следующем шаге
        sans: ['--font-sans'],
        serif: ['--font-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
```

**Чек-лист:**
- [ ] `tailwind.config.ts` обновлен с кастомными цветами
- [ ] Добавлены tokens для primary, secondary, gray
- [ ] Добавлены custom borderRadius и boxShadow
- [ ] Container настроен с правильным padding и maxWidth
- [ ] `fontFamily` подготовлена для next/font

---

## Фаза 3: Шрифты через next/font (8-10 мин)

### Шаг 3.1 — Установить пакет для работы со шрифтами

Шрифты уже встроены в Next.js, поэтому пропускаем установку.

### Шаг 3.2 — Создать файл конфига шрифтов

**Создать файл:** `src/lib/fonts.ts`

```typescript
import { Inter, Merriweather } from 'next/font/google';

// Шрифт для текста (sans-serif с хорошей поддержкой кириллицы)
export const fontSans = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Шрифт для заголовков (serif с кириллицей)
export const fontSerif = Merriweather({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-serif',
  weight: ['400', '700'],
  display: 'swap',
});

export const fontsConfig = `${fontSans.variable} ${fontSerif.variable}`;
```

**Примечание:** Если хотите другие шрифты:
- Для текста: `Inter`, `Roboto`, `Open Sans` (лучше `Inter` для экранов)
- Для заголовков: `Merriweather`, `Playfair Display`, `Cormorant Garamond`
- Все эти шрифты имеют cyrillic подмножество на Google Fonts

### Шаг 3.3 — Обновить layout.tsx

**Открыть:** `src/app/layout.tsx`

**Обновить импорты и html-тег:**
```typescript
import { fontSans, fontSerif } from '@/lib/fonts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${fontSans.variable} ${fontSerif.variable}`}>
      <body className="font-sans text-gray-900 bg-gray-50">
        {children}
      </body>
    </html>
  );
}
```

**Чек-лист:**
- [ ] `src/lib/fonts.ts` создан с двумя шрифтами
- [ ] Оба шрифта имеют cyrillic подмножество
- [ ] Используется `display: 'swap'` для оптимизации LCP
- [ ] `layout.tsx` обновлен с классами шрифтов
- [ ] Шрифты применены через CSS переменные

---

## Фаза 4: Базовые компоненты (15-18 мин)

### Шаг 4.1 — Установить необходимые пакеты

```bash
pnpm add react-hook-form zod @hookform/resolvers
pnpm add sonner  # для toast
```

### Шаг 4.2 — Создать базовый Button компонент

**Создать файл:** `src/components/ui/button.tsx`

```typescript
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, children, disabled, className, ...props }, ref) => {
    const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
      primary: 'bg-primary-700 text-white hover:bg-primary-800 active:bg-primary-900',
      secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800',
      outline: 'border border-primary-700 text-primary-700 hover:bg-primary-50 active:bg-primary-100',
      ghost: 'text-primary-700 hover:bg-primary-50 active:bg-primary-100',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {isLoading ? '...' : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### Шаг 4.3 — Создать Input компонент

**Создать файл:** `src/components/ui/input.tsx`

```typescript
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';
```

### Шаг 4.4 — Создать Textarea компонент

**Создать файл:** `src/components/ui/textarea.tsx`

```typescript
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`w-full px-3 py-2 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
);

Textarea.displayName = 'Textarea';
```

### Шаг 4.5 — Создать Select компонент

**Создать файл:** `src/components/ui/select.tsx`

```typescript
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`w-full px-3 py-2 border rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  )
);

Select.displayName = 'Select';
```

### Шаг 4.6 — Настроить Sonner toast

**Обновить:** `src/app/layout.tsx`

```typescript
import { Toaster } from 'sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
```

**Чек-лист:**
- [ ] React Hook Form и Zod установлены
- [ ] Sonner установлен
- [ ] Button компонент создан (primary, secondary, outline, ghost варианты)
- [ ] Input компонент создан с поддержкой ошибок
- [ ] Textarea компонент создан
- [ ] Select компонент создан
- [ ] Sonner Toaster подключен в layout

---

## Фаза 5: Логотип (3-5 мин)

### Шаг 5.1 — Создать текстовый логотип

**Создать файл:** `src/components/logo.tsx`

```typescript
export function Logo() {
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-2xl font-serif font-bold text-primary-700">Кварта</span>
      <span className="text-xs text-secondary-600 font-medium">кофе</span>
    </div>
  );
}
```

**Или более простой вариант:**

```typescript
export function Logo() {
  return <h1 className="text-2xl font-serif font-bold text-primary-700">Кварта</h1>;
}
```

**Чек-лист:**
- [ ] Компонент Logo создан
- [ ] Использует font-serif для логотипа
- [ ] Использует цвет primary-700

---

## Фаза 6: Базовые стили и проверка контраста (5 мин)

### Шаг 6.1 — Создать глобальные стили

**Обновить или создать:** `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Базовые стили */
html {
  scroll-behavior: smooth;
}

body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Убедиться что все интерактивные элементы видны при фокусе */
:focus-visible {
  outline: 2px solid rgb(var(--color-primary-500) / 1);
  outline-offset: 2px;
}
```

### Шаг 6.2 — Проверить контраст текста

**Проверить контраст** используя [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/):
- Primary text (gray-900) на gray-50: **Должен быть ≥ 4.5:1** ✅
- Primary text на primary-700: **Проверить**
- Secondary text на white: **Проверить**

**Если контраст недостаточен:** Отрегулировать цвета в `tailwind.config.ts`

**Чек-лист:**
- [ ] Глобальные стили в globals.css
- [ ] Проверен контраст основных текстов (≥ 4.5:1)
- [ ] Focus стили видны и доступны

---

## Фаза 7: Тестирование (3 мин)

### Шаг 7.1 — Проверить дизайн локально

```bash
pnpm dev
# Открыть http://localhost:3000
```

**Проверить:**
- ✅ Шрифты загружены и отображаются (кириллица видна)
- ✅ Цвета соответствуют design.png
- ✅ Button, Input, Select компоненты стилизованы корректно
- ✅ Логотип отображается правильно
- ✅ Нет ошибок в консоли браузера

### Шаг 7.2 — Проверить в DevTools

```
1. Открыть DevTools → Elements
2. Проверить что CSS переменные для шрифтов применены к html
3. Проверить что класс 'font-sans' применен к body
4. Проверить цвета в инспекторе
```

**Чек-лист:**
- [ ] Шрифты загружены и отображаются корректно
- [ ] Цвета соответствуют палитре
- [ ] Компоненты стилизованы правильно
- [ ] Нет ошибок в консоли

---

## Финальный коммит

```bash
git add .
git commit -m "style: создать дизайн-систему и тему Tailwind

- Добавлена кастомная палитра цветов (primary, secondary, gray)
- Настроены токены: borderRadius, boxShadow, container
- Подключены шрифты через next/font (Inter + Merriweather с кириллицей)
- Создана система базовых компонентов (Button, Input, Textarea, Select)
- Подключен Sonner для toast-уведомлений
- Создан текстовый логотип 'Кварта'
- Добавлены глобальные стили и focus-стили
- Проверен контраст текста (WCAG 2.1 AA)"
```

---

## Критерии завершения

✅ Все нижеперечисленные пункты должны быть выполнены:

1. ✅ Палитра, типографика, сетка выписаны из design.png
2. ✅ Tailwind конфиг с кастомными цветами и tokens
3. ✅ Два шрифта с cyrillic подмножеством подключены через next/font
4. ✅ Базовые компоненты: Button, Input, Textarea, Select, Logo
5. ✅ Sonner toast подключен и готов к использованию
6. ✅ Контраст текста ≥ 4.5:1 (WCAG 2.1 AA)
7. ✅ Стили совпадают с design.png, не похоже на типовой AI-лендинг
8. ✅ Все изменения закоммичены

---

**Ожидаемое время выполнения:** 45 мин  
**Статус:** ⏳ Ожидает выполнения
