# Coder Report for Task 2.3

## Task Summary
Task 2.3 [code]: Implement `normalizeBelarusPhone` and `formatBelarusPhone` functions in `src/lib/phone.ts`.

## Implementation Details

### normalizeBelarusPhone
Implemented according to «Algorithms / normalizeBelarusPhone» (steps 1–9):
- **Step 1**: Trim the input string.
- **Step 2**: Return `null` if the string is empty after trimming.
- **Step 3**: Return `null` if the string contains any character outside `0-9`, space, `+`, `(`, `)`, `-`.
- **Step 4**: Return `null` if `+` appears at any index other than 0 (also rejects `++...`).
- **Step 5**: Extract digits from the string.
- **Step 6**: Parse the national number based on the prefix (`+375` or `80`).
- **Step 7**: Validate the number length (9 digits for national format).
- **Step 8**: Check if the operator code is one of `BELARUS_MOBILE_CODES`.
- **Step 9**: Return `'+375' + national`.

### formatBelarusPhone
Implemented according to «Algorithms / formatBelarusPhone» (steps 1–4):
- **Step 1**: Call `normalizeBelarusPhone` to validate and normalize the input.
- **Step 2**: Return the original input unchanged if normalization returns `null`.
- **Step 3**: Extract the 9-digit national number from the normalized string.
- **Step 4**: Format as `+375 XX XXX-XX-XX`.

## Test Results
All 29 tests pass:
- ✅ Notations of one number (10 tests)
- ✅ All operator codes (3 tests)
- ✅ Empty phone (2 tests)
- ✅ Landline number (2 tests)
- ✅ Wrong digit count (3 tests)
- ✅ Foreign number (1 test)
- ✅ Forbidden characters (4 tests)
- ✅ Valid number is reformatted (2 tests)
- ✅ Invalid number is left as typed (2 tests)

## Verification
- ✅ `pnpm typecheck` passes
- ✅ `pnpm exec eslint src/lib/phone.ts --max-warnings 0` passes
- ✅ `pnpm exec prettier --check src/lib/phone.ts src/lib/phone.test.ts` passes
- ✅ `pnpm test src/lib/phone.test.ts` passes

## Files Modified
| File | Reason |
|------|--------|
| `src/lib/phone.ts` | Implemented `normalizeBelarusPhone` and `formatBelarusPhone` functions per design.md |

## Notes
- Removed stub implementations (`throw new Error('not implemented')`) from both functions.
- Used `const` for variables that are not reassigned to comply with ESLint rules.
