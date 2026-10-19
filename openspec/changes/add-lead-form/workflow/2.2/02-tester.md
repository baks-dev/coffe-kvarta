# Report: Task 2.2 [test]

| scenario | test (file and name) | what is checked |
| --- | --- | --- |
| Notations of one number | `src/lib/phone.test.ts` -> `normalizes various valid notations to +375XXXXXXXXX` | returns `'+375291234567'` for various valid inputs |
| All operator codes | `src/lib/phone.test.ts` -> `handles all mobile operator codes` | returns `'+375257654321'`, `'+375334567890'`, `'+375449999999'` |
| Empty phone | `src/lib/phone.test.ts` -> `returns null for empty or whitespace input` | returns `null` for `''` and `'   '` |
| Landline number | `src/lib/phone.test.ts` -> `returns null for landline numbers` | returns `null` for `'+375 17 123-45-67'` and `'8 017 123-45-67'` |
| Wrong digit count | `src/lib/phone.test.ts` -> `returns null for numbers with wrong digit counts` | returns `null` for various invalid counts |
| Foreign number | `src/lib/phone.test.ts` -> `returns null for foreign numbers` | returns `null` for `'+7 900 123-45-67'` |
| Forbidden characters | `src/lib/phone.test.ts` -> `returns null if it contains forbidden characters` | returns `null` for various invalid characters |
| Valid number is reformatted | `src/lib/phone.test.ts` -> `reformats a valid number to +375 XX XXX-XX-XX` | returns `'+375 29 123-45-67'` for `80291234567` |
| Invalid number is left as typed | `src/lib/phone.test.ts` -> `returns the input unchanged if it is invalid` | returns input unchanged for invalid or empty |

## Commands Results

- `pnpm typecheck`: `exit code 0`
- `pnpm exec eslint src/lib/phone.test.ts --max-warnings 0`: `exit code 0`
- `pnpm test src/lib/phone.test.ts`: `exit code 1` (expected, as implementation is a stub)

## Remarks Fixed

- Fixed typo `normalizenormalizeBelarusPhone` to `normalizeBelarusPhone` in `src/lib/phone.test.ts:59`.
