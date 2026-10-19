# Report: stubber — task 2.1

**Task:** Create the `src/lib/phone.ts` skeleton

## Steps executed

### Step 1: Replace the whole file content
Файл `src/lib/phone.ts` перезаписан полностью.

### Step 2: Export BELARUS_MOBILE_CODES
Экспортирована константа `BELARUS_MOBILE_CODES` с JSDoc:
```ts
/** Коды мобильных операторов Беларуси. */
export const BELARUS_MOBILE_CODES = ['25', '29', '33', '44'] as const;
```

### Step 3: Export normalizeBelarusPhone и formatBelarusPhone
Экспортированы функции с JSDoc из Contracts:
```ts
export function normalizeBelarusPhone(input: string): string | null {
  void input;
  throw new Error('not implemented');
}

export function formatBelarusPhone(input: string): string {
  void input;
  throw new Error('not implemented');
}
```

### Step 4: Reference parameter in stub bodies
В каждом теле функции добавлена строка `void input;` перед `throw`.

## "Done when" commands

- `pnpm typecheck` — **passes** (exit code 0)
- `pnpm exec eslint src/lib/phone.ts --max-warnings 0` — **passes** (exit code 0)

## Artifacts created/modified

| Path | Kind | Reason |
|------|------|--------|
| `src/lib/phone.ts` | modified | Stub implementation per task 2.1 |

## Remarks

Нет замечаний.
