# Report for Task 2.3 [code]

## Task Summary

Implement `normalizeBelarusPhone` and `formatBelarusPhone` functions in `src/lib/phone.ts`.

## Implementation Details

### normalizeBelarusPhone (Steps 1–9 from Algorithms)

| Step | Location | Description |
|------|----------|-------------|
| 1 | `src/lib/phone.ts:10` | Trim input: `const s = input.trim()` |
| 2 | `src/lib/phone.ts:12–15` | Return `null` if empty string |
| 3 | `src/lib/phone.ts:17–20` | Reject if contains invalid characters (regex `/[^0-9 +()-]/`) |
| 4 | `src/lib/phone.ts:22–31` | Reject if `+` at position other than 0 (also handles `++...`) |
| 5 | `src/lib/phone.ts:34` | Extract digits: `const digits = s.replace(/\D/g, '')` |
| 6–7 | `src/lib/phone.ts:40–58` | Parse national number based on prefix and digit count |
| 8 | `src/lib/phone.ts:60–63` | Validate operator code against `BELARUS_MOBILE_CODES` |
| 9 | `src/lib/phone.ts:65–66` | Return `'+375' + national` |

### formatBelarusPhone (Steps 1–4 from Algorithms)

| Step | Location | Description |
|------|----------|-------------|
| 1 | `src/lib/phone.ts:74` | Call `normalizeBelarusPhone(input)` |
| 2 | `src/lib/phone.ts:76–79` | Return input unchanged if normalization returns `null` |
| 3 | `src/lib/phone.ts:82` | Extract 9 digits: `normalized.slice(4)` |
| 4 | `src/lib/phone.ts:84–85` | Format as `` `+375 ${n.slice(0, 2)} ${n.slice(2, 5)}-${n.slice(5, 7)}-${n.slice(7, 9)}` `` |

## Edge Cases

All edge cases from the algorithm are implemented:
- Empty/whitespace input → `null`
- Invalid characters → `null`
- Multiple `+` signs → `null`
- Landline codes (not 25/29/33/44) → `null`
- Wrong digit counts → `null`
- Invalid prefixes (`+80...`, `375+...`) → `null`

## Tests

All 9 tests in `src/lib/phone.test.ts` pass:
- ✅ `normalizeBelarusPhone` – various notations
- ✅ `normalizeBelarusPhone` – all operator codes
- ✅ `normalizeBelarusPhone` – empty phone
- ✅ `normalizeBelarusPhone` – landline numbers
- ✅ `normalizeBelarusPhone` – wrong digit counts
- ✅ `normalizeBelarusPhone` – foreign numbers
- ✅ `normalizeBelarusPhone` – forbidden characters
- ✅ `formatBelarusPhone` – valid number reformatted
- ✅ `formatBelarusPhone` – invalid left unchanged

## Checks

All checks from "Done when" passed:
- `pnpm test src/lib/phone.test.ts` — passes
- `pnpm typecheck` — compiles
- `pnpm exec eslint src/lib/phone.ts --max-warnings 0` — passes
- `pnpm exec prettier --check src/lib/phone.ts src/lib/phone.test.ts` — passes
