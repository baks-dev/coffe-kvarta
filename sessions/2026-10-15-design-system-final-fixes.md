# Session Log: Add Design System - Final Fixes and Archive

**Date:** 2026-10-15  
**Project:** Coffe Kvarta Landing Page  
**Change:** `add-design-system`  
**Status:** ✅ Completed and Archived

## Overview

This session focused on fixing critical issues in the `add-design-system` OpenSpec change, including focus ring visibility, ghost button arrows, tailwind-merge integration, and typography line-heights. After all fixes were verified, the change was successfully archived.

## Initial Problems Identified

### Critical Issues
1. **Focus ring not visible on dark backgrounds** - `--focus-ring` override applied to button itself instead of its children
2. **Ghost button missing arrow** - Arrow added via JSX only when no children, breaking `asChild` usage
3. **`cn` function breaking Tailwind utilities** - Using raw `twMerge` without extending for custom classes
4. **Missing line-height tokens** - Removed during previous cleanup, breaking typography scale

### Minor Issues
- `--spacing-section` always 64px (should be 96px on desktop)
- Self-referencing `--text-*--line-height` in `@theme inline`
- Extra `cn-toast` class in Sonner
- Placeholder text color in Input component

## Fixes Applied

### 1. Focus Ring on Dark Backgrounds (`globals.css`)
**Before:**
```css
.bg-espresso,
.bg-primary {
  --focus-ring: var(--ring-inverse);
}
```

**After:**
```css
:is(.bg-espresso, .bg-primary) :focus-visible {
  --focus-ring: var(--ring-inverse);
}
```
- Now only affects focus visible on dark surfaces
- Prevents light ring from appearing on light backgrounds

### 2. Ghost Button Arrow (`button.tsx`)
**Before:**
```tsx
const content = variant === 'ghost' && !children ? (
  <>
    {children}
    <ArrowRightIcon className="size-4" />
  </>
) : children;
```

**After:**
```tsx
const buttonVariants = cva(
  '...',
  {
    variants: {
      variant: {
        ghost: '... after:content-["→"] after:ml-1',
      },
      size: {
        icon: 'size-10 after:content-none',
      },
    },
  },
);
```
- Arrow added via CSS `::after` for all ghost buttons
- Works with `asChild` (no JSX needed)
- Icon variant explicitly hides arrow

### 3. Enhanced `cn` Function (`utils.ts`)
**Before:**
```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**After:**
```ts
const twMergeExtended = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['display', 'h2', 'h3', 'body', 'small', 'eyebrow'] }],
      rounded: [{ rounded: ['card', 'pill'] }],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMergeExtended(clsx(inputs));
}
```
- Properly merges custom Tailwind v4 classes
- Prevents loss of `text-*` and `rounded-*` utilities

### 4. Typography Line-Heights (`globals.css`)
**Before:**
```css
:root {
  --text-display--line-height: 1.05; /* ... */
}

@theme inline {
  --text-display--line-height: var(--text-display--line-height); /* Self-reference */
}

@utility text-display {
  font-size: var(--text-display);
  font-family: var(--font-heading);
  /* Missing line-height */
}
```

**After:**
```css
:root {
  --leading-display: 1.05;
  --leading-h2: 1.15;
  --leading-h3: 1.3;
  --leading-body: 1.6;
  --leading-small: 1.5;
  --leading-eyebrow: 1.4;
}

@theme inline {
  --text-display--line-height: var(--leading-display);
  --text-h2--line-height: var(--leading-h2);
  /* ... */
}

@utility text-display {
  font-size: var(--text-display);
  line-height: var(--leading-display);
  font-family: var(--font-heading);
}
```
- Introduced `--leading-*` tokens for line-heights
- Fixed self-reference issue in `@theme inline`
- Applied line-heights in `@utility` blocks

### 5. Other Fixes
- **Spacing on desktop:** Added `@media (width >= 48rem)` override for `--spacing-section`
- **Input placeholder:** Restored `placeholder:text-muted-foreground`
- **Sonner:** Removed unused `cn-toast` class
- **Tasks:** Updated `tasks/02-design-system.md` checkboxes

## Verification Results

### OpenSpec Status
```
Progress: 17/17 tasks complete
State: all_done
```

### Build & Type Check
- ✅ `pnpm build` - Success
- ✅ `pnpm typecheck` - Success
- ✅ `pnpm lint` - Success
- ✅ `pnpm format:check` - Success

### Verification Report Summary
| Dimension | Status |
|-----------|--------|
| Completeness | 17/17 tasks, 12 reqs |
| Correctness | All requirements covered |
| Coherence | All checks passed |

**All 12 requirements verified:**
1. Единый источник дизайн-токенов ✅
2. Компоненты без захардкоженных цветов ✅
3. Фирменные шрифты с кириллицей ✅
4. Один фирменный вид без тёмной темы ✅
5. Русский язык документа ✅
6. Контраст текста ✅
7. Видимый фокус ✅
8. Типографическая шкала ✅
9. Кнопка ✅
10. Поля формы ✅
11. Всплывающие уведомления ✅
12. Текстовый логотип ✅

## Archive

**Change Archived:** `2026-10-15-add-design-system`  
**Location:** `.`

**Specs Synced:**
- Created `openspec/specs/design-system/spec.md`
- Added 12 requirements from delta spec
- Preserved all purpose, requirements, and scenarios

## Files Modified

1. `src/app/globals.css` - Focus rings, typography, spacing
2. `src/components/ui/button.tsx` - Ghost arrow via CSS
3. `src/components/ui/input.tsx` - Placeholder color
4. `src/components/ui/textarea.tsx` - Consistency
5. `src/components/ui/radio-group.tsx` - Focus styles
6. `src/components/logo.tsx` - Removed focus-none
7. `src/lib/utils.ts` - Extended tailwind-merge
8. `src/components/ui/sonner.tsx` - Removed cn-toast
9. `openspec/changes/add-design-system/tasks.md` - Updated checkboxes
10. `tasks/02-design-system.md` - Fixed checkbox formatting

## Key Takeaways

1. **Focus visibility** requires careful CSS scoping to work on both light and dark backgrounds
2. **CSS pseudo-elements** can solve JSX fragment issues with `asChild` components
3. **Tailwind v4** requires extending `twMerge` for custom class groups
4. **Typography tokens** need proper separation between size and line-height values
5. **Verification** before archiving catches regressions early

## Next Steps

The design system implementation is now complete and ready for production use. All OpenSpec artifacts are archived, and the main specification has been synced.
