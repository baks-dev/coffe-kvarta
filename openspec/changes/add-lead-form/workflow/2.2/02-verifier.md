# Report for task 2.2

## Command results

| command | expectation | exit code | result |
| --- | --- | --- | --- |
| `pnpm typecheck` | `compiles` | 1 | mismatch |
| `pnpm exec eslint src/lib/phone.test.ts --max-warnings 0` | `passes` | 0 | pass |
| `pnpm test src/lib/phone.test.ts` | `fails` | 1 | pass |

## Mismatched command details

### command: `pnpm typecheck`
**problem**: Expected exit code 0, got 1.
**requirement**: task 2.2, Done when
**fix**: src/lib/phone.test.ts:59 — the test calls `normalizenormalizeBelarusPhone`, which is a typo for `normalizeBelarusPhone`.

## manual_checks
(none)
