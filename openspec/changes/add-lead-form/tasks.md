# Tasks

Rules for every task below:

- Paths are relative to the repository root `/mnt/1TB/HTML/coffe-kvarta`; every command runs from the repository root. The package manager is pnpm (single package, no workspaces).
- Requirements and scenarios: `openspec/changes/add-lead-form/specs/lead-form/spec.md`, `openspec/changes/add-lead-form/specs/landing-page/spec.md`, `openspec/changes/add-lead-form/specs/dev-workflow/spec.md`. Scenario names in tasks are quoted verbatim from these files; the exact input values and expected strings are in the scenario text.
- Contracts, algorithms, examples, conventions and prohibitions: `openspec/changes/add-lead-form/design.md`. A reference such as «Contracts / src/lib/phone.ts», «Algorithms / submitLead» or «D7» names a `###` heading of that file. Names, signatures, texts and versions from design.md are copied verbatim.
- `[stub]` tasks create modules with final exports and signatures; function bodies are `throw new Error('not implemented');`. A stub lives only until the `[code]` task of the same group replaces it; after group 5 no stub remains.
- Tests written by `[test]` tasks are never changed by later tasks; a `[code]` task makes them pass. If a test looks wrong, stop and ask.
- Every test that checks a scenario has the line `// @scenario: <exact scenario name>` directly above its `it(...)` (design.md «Conventions»). `.skip`, `.only` and `.todo` are forbidden.
- Wiring a new file (imports in the files that use it) belongs to the task that creates the file only when that task lists the importing file in Files; otherwise a later task wires it as stated there.
- Before finishing a task, run `pnpm exec prettier --write <files of the task>`. Do not use `pnpm format:check` as a task check: it fails on the unrelated file `verification-report-add-landing-sections.md`.
- Lint is checked with zero warnings: `pnpm exec eslint <files> --max-warnings 0`. Do not add `eslint-disable` comments.
- Touch only the files listed in the task's Files. If a task, the design sections in its Refs and the code disagree, or something is not specified, stop and ask, quoting the place. Do not choose yourself.

## 1. Test stack and dependencies

Installs the form and test dependencies and replaces the leftover Vitest setup. No tests are written here.

- [x] 1.1 [infra] Install the form and test dependencies
  - Files: `package.json` (modify), `pnpm-lock.yaml` (modify)
  - Steps:
    1. Run `pnpm add react-hook-form@7.90.0 @hookform/resolvers@5.9.2`.
    2. Run `pnpm add -D jsdom@30.1.3 @testing-library/react@16.3.3 @testing-library/dom@10.4.2 @testing-library/user-event@14.6.8`.
    3. Check that `package.json` has `"test": "vitest run"` in `scripts` and `"vitest": "^5.0.5"` in `devDependencies`; add them with exactly these values when missing.
    4. Check that no other key of `package.json` changed (`git diff package.json`).
  - Refs: «Contracts / package.json», «D1», «D12», «Don'ts»
  - Depends on: none
  - Done when: `pnpm ls react-hook-form @hookform/resolvers --depth 0` passes; `pnpm ls -D jsdom @testing-library/react @testing-library/dom @testing-library/user-event vitest --depth 0` passes
    Manual: the first command lists `react-hook-form 7.90.0` and `@hookform/resolvers 5.9.2` under `dependencies`; the second lists `jsdom 30.1.3`, `@testing-library/react 16.3.3`, `@testing-library/dom 10.4.2`, `@testing-library/user-event 14.6.8`, `vitest 5.0.5` under `devDependencies`.

- [x] 1.2 [infra] Replace `vitest.config.ts` with `vitest.config.mts`
  - Files: `vitest.config.ts` (delete), `vitest.config.mts` (create)
  - Steps:
    1. Delete `vitest.config.ts`.
    2. Create `vitest.config.mts` with exactly the code from «Contracts / vitest.config.mts» (alias `@` → `./src`, `environment: 'node'`, `include: ['src/**/*.test.ts', 'src/**/*.test.tsx']`).
  - Refs: «Contracts / vitest.config.mts», «D12», «D16»
  - Depends on: 1.1
  - Done when: `test ! -e vitest.config.ts` passes; `pnpm exec eslint vitest.config.mts --max-warnings 0` passes; `pnpm exec prettier --check vitest.config.mts` passes

- [x] 1.3 [infra] Delete the leftover test files
  - Files: `src/lib/phone.test.ts` (delete), `src/lib/lead-schema.test.ts` (delete), `src/lib/submit-lead.test.ts` (delete)
  - Steps:
    1. Delete `src/lib/phone.test.ts`.
    2. Delete `src/lib/lead-schema.test.ts`.
    3. Delete `src/lib/submit-lead.test.ts`.
    4. Do not reuse their content anywhere (design.md «Don'ts»).
  - Refs: «D16», «File Structure»
  - Depends on: 1.2
  - Done when: `test ! -e src/lib/phone.test.ts -a ! -e src/lib/lead-schema.test.ts -a ! -e src/lib/submit-lead.test.ts` passes; `pnpm test --passWithNoTests` passes

## 2. Belarusian phone numbers

Pure module `src/lib/phone.ts` (no React, no Next), tested in the Node environment.

- [x] 2.1 [stub] Create the `src/lib/phone.ts` skeleton
  - Files: `src/lib/phone.ts` (create; overwrite the leftover file completely)
  - Steps:
    1. Replace the whole file content.
    2. Export `BELARUS_MOBILE_CODES = ['25', '29', '33', '44'] as const` with its JSDoc from the contract.
    3. Export `normalizeBelarusPhone(input: string): string | null` and `formatBelarusPhone(input: string): string` with the JSDoc from the contract; each body is `throw new Error('not implemented');`.
    4. Reference the parameter in each stub body so that lint reports no unused variable: write `void input;` before the `throw`.
  - Refs: «Contracts / src/lib/phone.ts», «D2», «Conventions»
  - Depends on: none
  - Done when: `pnpm typecheck` passes; `pnpm exec eslint src/lib/phone.ts --max-warnings 0` passes

- [x] 2.2 [test] Write unit tests for `normalizeBelarusPhone` and `formatBelarusPhone`
  - Files: `src/lib/phone.test.ts` (create)
  - Steps:
    1. Import `describe`, `expect`, `it` from `vitest` and `normalizeBelarusPhone`, `formatBelarusPhone` from `@/lib/phone`. No `// @vitest-environment` line (Node environment).
    2. «Notations of one number»: for each of the ten values listed in the scenario (including `  +375 29 123-45-67  ` with surrounding spaces) `normalizeBelarusPhone(value)` returns `'+375291234567'`.
    3. «All operator codes»: `'+375 25 765-43-21'` → `'+375257654321'`, `'+375 33 456-78-90'` → `'+375334567890'`, `'+375 44 999-99-99'` → `'+375449999999'`.
    4. «Empty phone»: `normalizeBelarusPhone('')` and `normalizeBelarusPhone('   ')` return `null`.
    5. «Landline number»: `'+375 17 123-45-67'` and `'8 017 123-45-67'` return `null`.
    6. «Wrong digit count»: `'+375 29 123-45-6'`, `'+375 29 123-45-678'`, `'0291234567'` return `null`.
    7. «Foreign number»: `'+7 900 123-45-67'` returns `null`.
    8. «Forbidden characters»: `'29 123-45-6X'`, `'++375291234567'`, `'375+291234567'`, `'+80291234567'` return `null`.
    9. «Valid number is reformatted»: `formatBelarusPhone('80291234567')` returns `'+375 29 123-45-67'`; additionally every value from step 2 formats to `'+375 29 123-45-67'`.
    10. «Invalid number is left as typed»: `formatBelarusPhone('+375 17 1234567')` returns `'+375 17 1234567'` and `formatBelarusPhone('')` returns `''`.
  - Refs: «Contracts / src/lib/phone.ts», «Algorithms / normalizeBelarusPhone», «Algorithms / formatBelarusPhone», «Conventions»; scenarios «Notations of one number», «All operator codes», «Empty phone», «Landline number», «Wrong digit count», «Foreign number», «Forbidden characters», «Valid number is reformatted», «Invalid number is left as typed»
  - Depends on: 1.3, 2.1
  - Done when: `pnpm typecheck` compiles; `pnpm exec eslint src/lib/phone.test.ts --max-warnings 0` passes; `pnpm test src/lib/phone.test.ts` fails

- [x] 2.3 [code] Implement `normalizeBelarusPhone` and `formatBelarusPhone`
  - Files: `src/lib/phone.ts` (modify)
  - Steps:
    1. Implement `normalizeBelarusPhone` step by step as in «Algorithms / normalizeBelarusPhone» (steps 1–9). Compare the operator code with `(BELARUS_MOBILE_CODES as readonly string[]).includes(...)`; no `any`.
    2. Implement `formatBelarusPhone` as in «Algorithms / formatBelarusPhone» (steps 1–4).
    3. Remove the `void input;` lines and the `throw` statements of the stub.
  - Refs: «Algorithms / normalizeBelarusPhone», «Algorithms / formatBelarusPhone», «Contracts / src/lib/phone.ts», «Conventions»
  - Depends on: 2.2
  - Done when: `pnpm test src/lib/phone.test.ts` passes; `pnpm typecheck` passes; `pnpm exec eslint src/lib/phone.ts --max-warnings 0` passes; `pnpm exec prettier --check src/lib/phone.ts src/lib/phone.test.ts` passes

## 3. Shared lead schema

`src/lib/lead-schema.ts` is shared by the form and the future `POST /api/lead` handler (task 06). Tested in the Node environment through `leadSchema.safeParse`.

- [x] 3.1 [stub] Create the `src/lib/lead-schema.ts` skeleton
  - Files: `src/lib/lead-schema.ts` (create; overwrite the leftover empty file)
  - Steps:
    1. Import `z` from `zod` and `LEAD_INTERESTS` from `@/lib/lead-intent`. Do not import `getProductById` or `normalizeBelarusPhone` yet (unused imports fail lint).
    2. Export `LEAD_NAME_MAX`, `LEAD_COMMENT_MAX`, `LEAD_MESSAGES`, `LEAD_FIELDS`, `LeadField`, `LeadFormValues`, `Lead`, `LeadApiResponse` exactly as in «Contracts / src/lib/lead-schema.ts», with their JSDoc.
    3. Export the placeholder schema (no messages, no checks yet):
       `export const leadSchema = z.object({ name: z.string(), phone: z.string(), interest: z.enum(LEAD_INTERESTS), comment: z.string().default(''), productId: z.string().optional() });`
       with the JSDoc line from the contract.
  - Refs: «Contracts / src/lib/lead-schema.ts», «D2», «D8», «D11»
  - Depends on: none
  - Done when: `pnpm typecheck` passes; `pnpm exec eslint src/lib/lead-schema.ts --max-warnings 0` passes

- [x] 3.2 [test] Write unit tests for `leadSchema`
  - Files: `src/lib/lead-schema.test.ts` (create)
  - Steps:
    1. Import `describe`, `expect`, `it` from `vitest` and `LEAD_MESSAGES`, `leadSchema` from `@/lib/lead-schema`. No `// @vitest-environment` line.
    2. Define `const base = { name: 'Аня', phone: '+375291234567', interest: 'order' };` and a helper `messagesFor(input: unknown, field: string): string[]` that calls `leadSchema.safeParse(input)` and returns `[]` on success, otherwise the `message` of every issue whose `path[0] === field`.
    3. «Notations of one number»: for each of the ten values of the scenario, `leadSchema.parse({ ...base, phone: value }).phone` is `'+375291234567'`.
    4. «Empty phone»: `messagesFor({ ...base, phone: '' }, 'phone')` and `messagesFor({ ...base, phone: '   ' }, 'phone')` equal `['Укажите телефон — по нему перезвонит менеджер']`.
    5. «Landline number», «Wrong digit count», «Foreign number», «Forbidden characters»: for every value listed in these four scenarios, `messagesFor({ ...base, phone: value }, 'phone')` equals `['Введите номер в формате +375 29 123-45-67']` (one `it` per scenario).
    6. «Empty name»: `messagesFor({ ...base, name: '' }, 'name')` and `messagesFor({ ...base, name: '   ' }, 'name')` equal `['Напишите, как к вам обращаться']`.
    7. «Name of 60 characters»: `leadSchema.parse({ ...base, name: 'А'.repeat(60) }).name` is `'А'.repeat(60)`.
    8. «Name of 61 characters»: `messagesFor({ ...base, name: 'А'.repeat(61) }, 'name')` equals `['Имя не длиннее 60 символов']`.
    9. «Comment of 500 characters»: `leadSchema.parse({ ...base, comment: 'к'.repeat(500) }).comment` is `'к'.repeat(500)`.
    10. «Comment of 501 characters»: `messagesFor({ ...base, comment: 'к'.repeat(501) }, 'comment')` equals `['Комментарий не длиннее 500 символов']`.
    11. «Comment omitted»: `leadSchema.parse(base).comment` is `''`.
    12. «Unknown interest»: `messagesFor({ ...base, interest: 'wholesale' }, 'interest')` equals `['Выберите, что вас интересует']`.
    13. «Unknown product id»: `messagesFor({ ...base, productId: 'latte' }, 'productId')` equals `['Выбранный товар не найден']`; additionally `leadSchema.parse({ ...base, productId: 'colombia' }).productId` is `'colombia'`.
    14. «Extra keys are dropped»: `'isAdmin' in leadSchema.parse({ ...base, isAdmin: true })` is `false`.
    15. «Request body with product»: `JSON.stringify(leadSchema.parse({ name: '  Аня  ', phone: '8 029 123-45-67', interest: 'order', comment: '  Позвоните после 18:00 ', productId: 'colombia' }))` is `'{"name":"Аня","phone":"+375291234567","interest":"order","comment":"Позвоните после 18:00","productId":"colombia"}'`.
    16. «Request body without product»: `JSON.stringify(leadSchema.parse({ name: 'Аня', phone: '29 123-45-67', interest: 'question', comment: '' }))` is `'{"name":"Аня","phone":"+375291234567","interest":"question","comment":""}'`.
    17. In steps 4–13 compare against `LEAD_MESSAGES.<key>` or the literal text; both must be the strings above.
  - Refs: «Contracts / src/lib/lead-schema.ts», «Algorithms / leadSchema», «Conventions»; scenarios «Notations of one number», «Empty phone», «Landline number», «Wrong digit count», «Foreign number», «Forbidden characters», «Empty name», «Name of 60 characters», «Name of 61 characters», «Comment of 500 characters», «Comment of 501 characters», «Comment omitted», «Unknown interest», «Unknown product id», «Extra keys are dropped», «Request body with product», «Request body without product»
  - Depends on: 1.3, 3.1
  - Done when: `pnpm typecheck` compiles; `pnpm exec eslint src/lib/lead-schema.test.ts --max-warnings 0` passes; `pnpm test src/lib/lead-schema.test.ts` fails

- [x] 3.3 [code] Implement `leadSchema`
  - Files: `src/lib/lead-schema.ts` (modify)
  - Steps:
    1. Add imports `getProductById` from `@/lib/get-products` and `normalizeBelarusPhone` from `@/lib/phone`.
    2. Replace the placeholder fields with the five field definitions of «Algorithms / leadSchema» in the order `name`, `phone`, `interest`, `comment`, `productId` (zod 4 `{ error: … }` messages, `ctx.addIssue({ code: 'custom', message })` and `z.NEVER` in the phone transform).
    3. Keep plain `z.object` (no `.strict()`, `.passthrough()`, no manual type annotation).
    4. Leave every other export unchanged.
  - Refs: «Algorithms / leadSchema», «Contracts / src/lib/lead-schema.ts», «D2», «D6»
  - Depends on: 2.3, 3.2
  - Done when: `pnpm test src/lib/lead-schema.test.ts` passes; `pnpm test src/lib/phone.test.ts` passes; `pnpm typecheck` passes; `pnpm exec eslint src/lib/lead-schema.ts --max-warnings 0` passes; `pnpm exec prettier --check src/lib/lead-schema.ts src/lib/lead-schema.test.ts` passes

## 4. Lead submission client

`src/lib/submit-lead.ts` sends the validated lead to `POST /api/lead` and maps every outcome to `SubmitLeadResult`. Tested in the Node environment with a stubbed global `fetch` and Vitest fake timers.

- [ ] 4.1 [stub] Create the `src/lib/submit-lead.ts` skeleton
  - Files: `src/lib/submit-lead.ts` (create; overwrite the leftover empty file)
  - Steps:
    1. Import only types: `import type { Lead, LeadField } from '@/lib/lead-schema';` (the value import of `LEAD_FIELDS` is added by task 4.3).
    2. Export `LEAD_ENDPOINT`, `SUBMIT_TIMEOUT_MS`, `SubmitFailureReason`, `SubmitLeadResult` exactly as in «Contracts / src/lib/submit-lead.ts».
    3. Export `async function submitLead(lead: Lead): Promise<SubmitLeadResult>` with its JSDoc; body: `void lead;` then `throw new Error('not implemented');`.
    4. Do not add `interpretResponse` yet.
  - Refs: «Contracts / src/lib/submit-lead.ts», «D8», «D9»
  - Depends on: 3.1
  - Done when: `pnpm typecheck` passes; `pnpm exec eslint src/lib/submit-lead.ts --max-warnings 0` passes

- [ ] 4.2 [test] Write unit tests for `submitLead`
  - Files: `src/lib/submit-lead.test.ts` (create)
  - Steps:
    1. Use the imports, `afterEach`, `jsonResponse` and `hangingFetch` from «Examples / submitLead test patterns (Node environment)». No `// @vitest-environment` line. Create other fetch stubs with `vi.fn<typeof fetch>(() => Promise.resolve(<response>))` and install them with `vi.stubGlobal('fetch', <stub>)`; read call arguments from `<stub>.mock.calls[0]`.
    2. «Request body with product»: lead `{ name: 'Аня', phone: '+375291234567', interest: 'order', comment: 'Позвоните после 18:00', productId: 'colombia' }`, fetch answers `jsonResponse(200, { status: 'ok', id: 'lead_1' })`. Expect exactly one call; URL `'/api/lead'`; `init.method` `'POST'`; `init.headers` equal to `{ 'Content-Type': 'application/json' }`; `init.body` equal to `'{"name":"Аня","phone":"+375291234567","interest":"order","comment":"Позвоните после 18:00","productId":"colombia"}'`; `init.signal` is an `AbortSignal`.
    3. «Request body without product»: lead `{ name: 'Аня', phone: '+375291234567', interest: 'question', comment: '' }` → `init.body` equal to `'{"name":"Аня","phone":"+375291234567","interest":"question","comment":""}'`.
    4. «Success response»: with `vi.useFakeTimers()`, fetch answers `jsonResponse(200, { status: 'ok', id: 'lead_1' })` → result equals `{ kind: 'ok' }` and `vi.getTimerCount()` is `0` afterwards.
    5. «Duplicate response»: `jsonResponse(200, { status: 'duplicate' })` → `{ kind: 'duplicate' }`.
    6. «Validation response»: `jsonResponse(400, { status: 'invalid', fieldErrors: { phone: 'Номер не принят' } })` → `{ kind: 'invalid', fieldErrors: { phone: 'Номер не принят' } }`.
    7. «Unexpected responses are failures»: each of these responses gives `{ kind: 'failed', reason: 'server' }`: `jsonResponse(500, { status: 'error' })`; `new Response('<!DOCTYPE html><html><body>Not Found</body></html>', { status: 404, headers: { 'Content-Type': 'text/html' } })`; `jsonResponse(200, { status: 'queued' })`; `new Response('not json', { status: 200 })`; `jsonResponse(400, { status: 'invalid', fieldErrors: { email: 'x' } })`.
    8. «Network failure»: fetch is `vi.fn<typeof fetch>(() => Promise.reject(new TypeError('Failed to fetch')))` → `{ kind: 'failed', reason: 'network' }`.
    9. «Request timeout»: `vi.useFakeTimers()`, `vi.stubGlobal('fetch', hangingFetch)`, start `const pending = submitLead(lead)` and track settlement with a `settled` flag set in `pending.then(...)`; after `await vi.advanceTimersByTimeAsync(SUBMIT_TIMEOUT_MS - 1)` `settled` is `false`; after `await vi.advanceTimersByTimeAsync(1)` `await pending` equals `{ kind: 'failed', reason: 'timeout' }`, the signal passed to fetch (`hangingFetch.mock.calls[0]?.[1]?.signal?.aborted`) is `true` and `vi.getTimerCount()` is `0`.
    10. «Server failure»: `jsonResponse(500, { status: 'error', message: 'Не удалось сохранить заявку' })` → `{ kind: 'failed', reason: 'server' }`.
  - Refs: «Contracts / src/lib/submit-lead.ts», «Contracts / POST /api/lead (wire format)», «Algorithms / submitLead», «Algorithms / interpretResponse», «Examples / submitLead test patterns (Node environment)», «Conventions»; scenarios «Request body with product», «Request body without product», «Success response», «Duplicate response», «Validation response», «Unexpected responses are failures», «Network failure», «Request timeout», «Server failure»
  - Depends on: 1.3, 4.1
  - Done when: `pnpm typecheck` compiles; `pnpm exec eslint src/lib/submit-lead.test.ts --max-warnings 0` passes; `pnpm test src/lib/submit-lead.test.ts` fails

- [ ] 4.3 [code] Implement `submitLead` and `interpretResponse`
  - Files: `src/lib/submit-lead.ts` (modify)
  - Steps:
    1. Change the imports to `import { LEAD_FIELDS, type Lead, type LeadField } from '@/lib/lead-schema';`.
    2. Add the non-exported `function interpretResponse(status: number, body: unknown): SubmitLeadResult` following «Algorithms / interpretResponse» steps 1–6. Narrow `unknown` with `typeof`/`Array.isArray`; no `any`, no `as unknown as`.
    3. Implement `submitLead` following «Algorithms / submitLead» steps 1–5 (`AbortController` + `setTimeout(…, SUBMIT_TIMEOUT_MS)`, `clearTimeout` in `finally`, separate `try/catch` around `fetch` and around `response.json()`).
    4. Remove `void lead;` and the `throw` of the stub.
  - Refs: «Algorithms / submitLead», «Algorithms / interpretResponse», «Contracts / src/lib/submit-lead.ts», «D8», «D9», «Don'ts»
  - Depends on: 4.2
  - Done when: `pnpm test src/lib/submit-lead.test.ts` passes; `pnpm typecheck` passes; `pnpm exec eslint src/lib/submit-lead.ts --max-warnings 0` passes; `pnpm exec prettier --check src/lib/submit-lead.ts src/lib/submit-lead.test.ts` passes

## 5. Lead form component and page

The client component `LeadForm`, its texts, the component tests (jsdom, `submitLead` and `sonner` mocked), wiring into the home page and README. Component tests use the file header from «Examples / Component test file header (both component test files)», importing only what the file uses; they render `<LeadForm />` alone with `render(<LeadForm />)` and create `const user = userEvent.setup()` per test. The submit button is found with `screen.getByRole('button', { name: 'Отправить заявку' })`; fields with `screen.getByLabelText('Имя' | 'Телефон' | 'Комментарий')`; radios with `screen.getByRole('radio', { name: 'Подписка' | 'Разовый заказ' | 'Вопрос' })` and checked state via `getAttribute('aria-checked') === 'true'`; focus via `await waitFor(() => expect(document.activeElement).toBe(<element>))`.

- [ ] 5.1 [stub] Add the `leadForm` texts to `src/data/content.ts`
  - Files: `src/data/content.ts` (modify)
  - Steps:
    1. Add `import type { LeadInterest } from '@/lib/lead-intent';` and `import type { SubmitFailureReason } from '@/lib/submit-lead';` to the imports.
    2. Insert the `leadForm` key right after the `lead` key inside `export const content = { … }`, copying every string from «Contracts / src/data/content.ts» verbatim (including `success.text` and `duplicate.text` functions and both `satisfies` clauses).
    3. Change nothing else in the file.
  - Refs: «Contracts / src/data/content.ts», «D11», «D15», «Examples / Existing code to imitate»
  - Depends on: 4.1
  - Done when: `pnpm typecheck` passes; `pnpm exec eslint src/data/content.ts --max-warnings 0` passes; `pnpm exec prettier --check src/data/content.ts` passes

- [ ] 5.2 [stub] Create the `LeadForm` component skeleton
  - Files: `src/components/lead-form.tsx` (create)
  - Steps:
    1. First line `'use client';`.
    2. Export `function LeadForm(): React.JSX.Element` with the JSDoc `/** Форма заявки: поля, валидация, отправка на POST /api/lead и результат. Без пропсов. */`; body `throw new Error('not implemented');`.
    3. Do not import it into `src/app/page.tsx` yet (task 5.6 does).
  - Refs: «Contracts / src/components/lead-form.tsx», «File Structure»
  - Depends on: none
  - Done when: `pnpm typecheck` passes; `pnpm exec eslint src/components/lead-form.tsx --max-warnings 0` passes

- [ ] 5.3 [test] Write component tests for fields, validation, prefill and prerender
  - Files: `src/components/lead-form.test.tsx` (create)
  - Steps:
    1. Start the file with the header from «Examples / Component test file header (both component test files)» (`// @vitest-environment jsdom`, mocks of `@/lib/submit-lead` and `sonner`, `ResizeObserverStub`, `beforeEach`, `afterEach`, `fillValidForm`), keeping only the imports this file uses; add `import { renderToStaticMarkup } from 'react-dom/server';`.
    2. «Initial form state»: «Имя», «Телефон», «Комментарий» have value `''`; «Разовый заказ» is checked, «Подписка» and «Вопрос» are not; the button «Отправить заявку» exists.
    3. «Labels focus their fields»: `await user.click(screen.getByText('Телефон'))` moves focus to `screen.getByLabelText('Телефон')`, whose attributes are `type="tel"`, `autocomplete="tel"`, `placeholder="+375 29 123-45-67"`.
    4. «Radio group keyboard control»: focus «Разовый заказ», press and hold the Down arrow as in the Examples bullet «arrow key in Radix» → «Вопрос» is checked (`aria-checked="true"`) and is `document.activeElement`.
    5. «Valid number is reformatted»: type `80291234567` into «Телефон», `await user.tab()` → the phone value is `+375 29 123-45-67`.
    6. «Invalid number is left as typed»: type `+375 17 1234567`, `await user.tab()` → the value is `+375 17 1234567`.
    7. «Invalid phone is not sent»: type `Аня` and `+375 17 123-45-67`, click «Отправить заявку» → `await screen.findByText('Введите номер в формате +375 29 123-45-67')`; `submitLead` was not called; the phone input has `aria-invalid="true"`, its `aria-describedby` contains `lead-phone-error`, and it is focused.
    8. «Several invalid fields»: click «Отправить заявку» on the empty form → `Напишите, как к вам обращаться` and `Укажите телефон — по нему перезвонит менеджер` are shown; `submitLead` was not called; «Имя» is focused.
    9. «Error clears after correction»: produce the error of step 7, then `await user.clear(phone)` and type `+375 29 123-45-67` → `screen.queryByText('Введите номер в формате +375 29 123-45-67')` is `null` and the input has no `aria-invalid` attribute.
    10. «Product intent»: `act(() => { requestLeadIntent({ interest: 'order', productId: 'colombia' }); })` → «Разовый заказ» is checked and `Вы выбрали: Колумбия Уила` is shown.
    11. «Subscription intent»: intent `{ interest: 'subscription', productId: 'subscription' }` → «Подписка» is checked and `Вы выбрали: Подписка на кофе` is shown.
    12. «Intent keeps typed values»: type `Аня` and `29 123-45-67` (do not move focus out of «Телефон»), then intent `{ interest: 'order', productId: 'brazil' }` → «Имя» is `Аня`, «Телефон» is `29 123-45-67`, `Вы выбрали: Бразилия Серрадо` is shown.
    13. «Intent sent before the form mounted»: call `requestLeadIntent({ interest: 'order', productId: 'ethiopia' })` before `render` → after render «Разовый заказ» is checked and `await screen.findByText('Вы выбрали: Эфиопия Иргачеффе')` resolves.
    14. «Remove product»: intent `{ interest: 'order', productId: 'colombia' }`, click the button with accessible name `Убрать выбор: Колумбия Уила` → `screen.queryByText('Вы выбрали: Колумбия Уила')` is `null`; then `vi.mocked(submitLead).mockResolvedValue({ kind: 'ok' })`, `fillValidForm(user)`, click «Отправить заявку» → `submitLead` called once and `JSON.stringify(vi.mocked(submitLead).mock.calls[0]?.[0])` is `'{"name":"Аня","phone":"+375291234567","interest":"order","comment":""}'`.
    15. «Prerendered form»: `const html = renderToStaticMarkup(<LeadForm />)` (do not call `render`) → `html` contains `>Имя<`, `>Телефон<`, `>Что интересует<`, `>Комментарий<`, `Чтобы отправить заявку, включите JavaScript или позвоните нам:` and `href="tel:+375291234567"`; the tag `html.match(/<button[^>]*id="lead-submit"[^>]*>/)?.[0]` contains `type="submit"` and matches `/\sdisabled=""/`.
    16. «Button enabled after hydration»: after `render(<LeadForm />)` the button «Отправить заявку» has no `disabled` attribute.
  - Refs: «Contracts / src/components/lead-form.tsx», «Contracts / src/data/content.ts», «Examples / Component test file header (both component test files)», «D5», «D6», «D10», «Conventions»; scenarios «Initial form state», «Labels focus their fields», «Radio group keyboard control», «Valid number is reformatted», «Invalid number is left as typed», «Invalid phone is not sent», «Several invalid fields», «Error clears after correction», «Product intent», «Subscription intent», «Intent keeps typed values», «Intent sent before the form mounted», «Remove product», «Prerendered form», «Button enabled after hydration»
  - Depends on: 1.1, 1.3, 5.1, 5.2
  - Done when: `pnpm typecheck` compiles; `pnpm exec eslint src/components/lead-form.test.tsx --max-warnings 0` passes; `pnpm test src/components/lead-form.test.tsx` fails

- [ ] 5.4 [test] Write component tests for submission outcomes and focus
  - Files: `src/components/lead-form.submit.test.tsx` (create)
  - Steps:
    1. Start the file with the header from «Examples / Component test file header (both component test files)», keeping only the imports this file uses; add `fireEvent` from `@testing-library/react` for step 4. A request in flight is `const d = Promise.withResolvers<SubmitLeadResult>(); vi.mocked(submitLead).mockReturnValue(d.promise);`, settled with `await act(async () => { d.resolve(<result>); });`. A fixed result is `vi.mocked(submitLead).mockResolvedValue(<result>)`. The body sent is `JSON.stringify(vi.mocked(submitLead).mock.calls[<n>]?.[0])`.
    2. «Request body with product»: intent `{ interest: 'order', productId: 'colombia' }`; type `  Аня  ` into «Имя», `8 029 123-45-67` into «Телефон», `  Позвоните после 18:00 ` into «Комментарий»; result `{ kind: 'ok' }`; click «Отправить заявку» → one call, body `'{"name":"Аня","phone":"+375291234567","interest":"order","comment":"Позвоните после 18:00","productId":"colombia"}'`.
    3. «Request body without product»: type `Аня`, `29 123-45-67`, click radio «Вопрос», leave the comment empty; result `{ kind: 'ok' }`; submit → body `'{"name":"Аня","phone":"+375291234567","interest":"question","comment":""}'`.
    4. «Double click sends one request»: request in flight; `fillValidForm(user)`; `await user.dblClick(<submit button>)`; then get the form with `const form = container.querySelector('form'); if (!form) throw new Error('form not found');` (`container` from `render`) and call `fireEvent.submit(form)`; `await act(async () => {})` → `submitLead` was called exactly once; finally resolve with `{ kind: 'ok' }`.
    5. «Button while sending»: request in flight; fill and click submit → `await screen.findByRole('button', { name: 'Отправляем…' })` has the `disabled` attribute; resolve with `{ kind: 'failed', reason: 'server' }` → the button «Отправить заявку» has no `disabled` attribute and `submitLead` was called once.
    6. «Success block»: type `Аня` and `80291234567`; result `{ kind: 'ok' }`; submit → `await screen.findByRole('heading', { name: 'Спасибо, заявка у нас' })`; text `Менеджер перезвонит на номер +375 29 123-45-67 в рабочее время: пн–пт 8:00–20:00, сб–вс 10:00–18:00.` is shown; the heading is focused; `screen.queryByLabelText('Имя')` is `null`.
    7. «Duplicate block»: type `Аня` and `+375291234567`; result `{ kind: 'duplicate' }`; submit → heading `Мы уже получили вашу заявку`, text `Заявка с номера +375 29 123-45-67 пришла меньше 10 минут назад, повторно отправлять не нужно. Менеджер перезвонит в рабочее время.`, the heading is focused.
    8. «Server rejects the phone»: `fillValidForm(user)`, type `Позвоните после 18:00` into «Комментарий»; result `{ kind: 'invalid', fieldErrors: { phone: 'Номер не принят' } }`; submit → `Номер не принят` is shown; the phone input is focused and has `aria-invalid="true"`; «Имя» is `Аня`, «Телефон» is `+375 29 123-45-67`, «Комментарий» is `Позвоните после 18:00`; the button «Отправить заявку» has no `disabled` attribute.
    9. «Server rejects the product»: intent `{ interest: 'order', productId: 'colombia' }`; `fillValidForm(user)`; result `{ kind: 'invalid', fieldErrors: { productId: 'Выбранный товар не найден' } }`; submit → `Выбранный товар не найден` is shown and the button «Отправить заявку» is focused.
    10. «Network failure»: `fillValidForm(user)`, click radio «Подписка», type `Позвоните после 18:00` into «Комментарий»; result `{ kind: 'failed', reason: 'network' }`; submit → `await screen.findByRole('alert')` contains `Не удалось отправить заявку`, `Похоже, пропал интернет. Проверьте подключение и отправьте заявку ещё раз.` and a link with text `+375 (29) 123-45-67` and `href="tel:+375291234567"`; `toast.error` was called once with `'Не удалось отправить заявку'`; «Имя» is `Аня`, «Телефон» is `+375 29 123-45-67`, «Подписка» is checked, «Комментарий» is `Позвоните после 18:00`.
    11. «Request timeout»: result `{ kind: 'failed', reason: 'timeout' }` → the alert contains `Сервер не ответил за 15 секунд. Отправьте заявку ещё раз.`.
    12. «Server failure»: result `{ kind: 'failed', reason: 'server' }` → the alert contains `На нашей стороне что-то пошло не так. Отправьте заявку ещё раз.`; the button «Отправить заявку» has no `disabled` attribute and is focused.
    13. «Retry after failure»: `mockResolvedValueOnce({ kind: 'failed', reason: 'network' })` then `mockResolvedValueOnce({ kind: 'ok' })`; fill, submit, wait for the alert, click «Отправить заявку» again → heading `Спасибо, заявка у нас` is shown; `submitLead` was called twice with equal bodies (`JSON.stringify` of call 0 equals that of call 1); `screen.queryByRole('alert')` is `null`.
    14. «Alert is announced»: result `{ kind: 'failed', reason: 'server' }` → `await screen.findByRole('alert')` resolves and the element contains `Не удалось отправить заявку`.
    15. «Start over»: intent `{ interest: 'subscription', productId: 'subscription' }`; `fillValidForm(user)`; result `{ kind: 'ok' }`; submit; click `Отправить ещё одну заявку` → «Имя», «Телефон», «Комментарий» are `''`; «Разовый заказ» is checked; `screen.queryByText(/Вы выбрали:/)` is `null`; «Имя» is focused.
    16. «Intent while sending»: request in flight; fill; submit; wait for `Отправляем…`; `act(() => { requestLeadIntent({ interest: 'subscription', productId: 'subscription' }); })` → «Разовый заказ» is still checked and `screen.queryByText('Вы выбрали: Подписка на кофе')` is `null`; finally resolve with `{ kind: 'ok' }`.
    17. «Intent after success»: fill; result `{ kind: 'ok' }`; submit; wait for the heading `Спасибо, заявка у нас`; intent `{ interest: 'order', productId: 'drip-pack' }` → «Имя», «Телефон», «Комментарий» are `''`, «Разовый заказ» is checked, `Вы выбрали: Дрип-пакеты ассорти` is shown.
  - Refs: «Contracts / src/components/lead-form.tsx», «Contracts / src/data/content.ts», «Examples / Component test file header (both component test files)», «D7», «D14», «D15», «Conventions»; scenarios «Request body with product», «Request body without product», «Double click sends one request», «Button while sending», «Success block», «Duplicate block», «Server rejects the phone», «Server rejects the product», «Network failure», «Request timeout», «Server failure», «Retry after failure», «Alert is announced», «Start over», «Intent while sending», «Intent after success»
  - Depends on: 1.1, 1.3, 5.1, 5.2
  - Done when: `pnpm typecheck` compiles; `pnpm exec eslint src/components/lead-form.submit.test.tsx --max-warnings 0` passes; `pnpm test src/components/lead-form.submit.test.tsx` fails

- [ ] 5.5 [code] Implement `LeadForm`
  - Files: `src/components/lead-form.tsx` (modify)
  - Steps:
    1. Use exactly the imports listed in «Contracts / src/components/lead-form.tsx» and the module-level declarations `LeadFormStatus`, `PendingFocus`, `SUBMIT_ID`, `LEAD_FORM_DEFAULTS`, `subscribeNothing`, `useHydrated` from that contract.
    2. Set up state, refs and `useForm` as in «Examples / Verified component skeleton (lint-clean with this project's ESLint config)» and «D1».
    3. Implement `setStatus`, `applyIntent`, the intent effect, `onValid`, `onSubmit`, `onPhoneBlur`, `removeProduct`, `startOver`, the focus effect and render exactly as in the «Algorithms / LeadForm / …» subsections.
    4. Render the form markup and the result block exactly as in the two DOM contracts of «Contracts / src/components/lead-form.tsx» (ids, attributes, classes, texts from `content.leadForm`); bind the radio group as in «Examples / Radio group through Controller».
    5. Remove the stub `throw`.
  - Refs: «Contracts / src/components/lead-form.tsx», «Algorithms / LeadForm / setStatus», «Algorithms / LeadForm / applyIntent», «Algorithms / LeadForm / intent effect», «Algorithms / LeadForm / onValid», «Algorithms / LeadForm / onSubmit», «Algorithms / LeadForm / onPhoneBlur», «Algorithms / LeadForm / removeProduct», «Algorithms / LeadForm / startOver», «Algorithms / LeadForm / focus effect», «Algorithms / LeadForm / render», «Examples / Verified component skeleton (lint-clean with this project's ESLint config)», «Examples / Radio group through Controller», «D4», «D5», «D6», «D7», «D10», «D13», «D14», «D15», «Don'ts»
  - Depends on: 2.3, 3.3, 4.3, 5.3, 5.4
  - Done when: `pnpm test src/components/lead-form.test.tsx` passes; `pnpm test src/components/lead-form.submit.test.tsx` passes; `pnpm typecheck` passes; `pnpm exec eslint src/components/lead-form.tsx --max-warnings 0` passes; `pnpm exec prettier --check src/components/lead-form.tsx src/components/lead-form.test.tsx src/components/lead-form.submit.test.tsx` passes

- [ ] 5.6 [code] Pass `LeadForm` into the lead section on the home page
  - Files: `src/app/page.tsx` (modify), `src/components/sections/lead-section.tsx` (modify)
  - Steps:
    1. In `src/app/page.tsx` add `import { LeadForm } from '@/components/lead-form';` and replace `<LeadSection />` with `<LeadSection>` containing `<LeadForm />`, as in «Contracts / src/app/page.tsx». Keep `export const ensureStatic = 'navigation';` and every other line.
    2. In `src/components/sections/lead-section.tsx` replace only the JSDoc line of `children` (line 7) with `  /** Форма заявки; без неё секция показывает только шаги и телефон. */`.
    3. Run `pnpm build`.
  - Refs: «Contracts / src/app/page.tsx», «Contracts / src/components/sections/lead-section.tsx», «D10», «Don'ts»; scenarios «Форма заявки на главной странице», «С формой», «Prerendered form»
  - Depends on: 5.5
  - Done when: `pnpm typecheck` passes; `pnpm exec eslint src/app/page.tsx src/components/sections/lead-section.tsx --max-warnings 0` passes; `pnpm build` passes; `node -e "const h=require('fs').readFileSync('.next/server/app/index.html','utf8');const s=h.indexOf('id=\"lead-form\"'),f=h.indexOf('<form'),c=h.indexOf('Удобнее позвонить?'),b=(h.match(/<button[^>]*id=\"lead-submit\"[^>]*>/)||[''])[0];process.exit(s>=0&&s<f&&f<c&&h.indexOf('Привозим в пятницу или ждём в мастерской')<f&&/\sdisabled=\"\"/.test(b)&&h.includes('Чтобы отправить заявку, включите JavaScript или позвоните нам:')?0:1)"` passes; `git diff --numstat src/components/sections/lead-section.tsx` passes
    Manual: the `git diff --numstat` output for `lead-section.tsx` is `1	1	src/components/sections/lead-section.tsx` (one line changed).

- [ ] 5.7 [docs] Document the assumptions and the `test` command in README
  - Files: `README.md` (modify)
  - Steps:
    1. Insert the section `### Допущения для change "add-lead-form"` with its five bullets verbatim from «Contracts / README.md» right after the section `### Допущения для change "add-landing-sections"` and before `## Development`.
    2. Add the row for `test` with the description `Запустить модульные и компонентные тесты (Vitest)` to the `### Commands` table directly after the `format:check` row.
    3. Run `pnpm exec prettier --write README.md`.
  - Refs: «Contracts / README.md», «D3», «D4», «D9», «D10», «D12»
  - Depends on: 1.1, 5.6
  - Done when: `pnpm exec prettier --check README.md` passes; `grep -c 'Допущения для change "add-lead-form"' README.md` passes; `grep -c 'Запустить модульные и компонентные тесты (Vitest)' README.md` passes

## 6. Final checks

Integration checks across all groups; no new code.

- [ ] 6.1 [manual] Check the built page in a browser and the test command behaviour
  - Files: none
  - Steps:
    1. Run `pnpm build` and then `pnpm start`; open `http://localhost:3000/` in Chrome.
    2. «Prerendered form»: `curl -s http://localhost:3000/` output contains `Имя`, `Телефон`, `Что интересует`, `Комментарий`, a `<button` tag with `id="lead-submit"`, `type="submit"` and `disabled=""`, and the text `Чтобы отправить заявку, включите JavaScript или позвоните нам:`.
    3. «Форма заявки на главной странице»: in the same output, `<form` follows `Привозим в пятницу или ждём в мастерской` and precedes `Удобнее позвонить?`.
    4. «Button enabled after hydration»: with JavaScript enabled the button «Отправить заявку» is enabled.
    5. «JavaScript отключён» and «Форма заявки без JavaScript»: DevTools → Command Menu → «Disable JavaScript», reload: all sections with texts, prices and photos are visible; header, hero and footer links scroll to their sections; the form fields are visible; «Отправить заявку» is disabled; the text «Чтобы отправить заявку, включите JavaScript или позвоните нам: +375 (29) 123-45-67.» is visible; pressing Enter in «Имя» does not change the address bar.
    6. «Narrow screen»: at 360 px width «Имя» and «Телефон» are stacked, the submit button is as wide as the form, the computed `font-size` of the inputs is at least 16 px, and `document.documentElement.scrollWidth === document.documentElement.clientWidth` is `true`.
    7. «Wide screen»: at 1440 px width «Имя» and «Телефон» are on one row and the form's width in DevTools is at most 672 px.
    8. «Без формы»: `git diff src/components/sections/lead-section.tsx` changes only the JSDoc line of `children`, so the section still renders the steps and the phone line without a placeholder.
    9. «С формой»: on the page the form is between the steps list and the line «Удобнее позвонить? +375 (29) 123-45-67».
    10. «Single test file»: `pnpm test src/lib/phone.test.ts` reports `Test Files  1 passed (1)`.
    11. «Failing test breaks the run»: temporarily change one expected value in `src/lib/phone.test.ts` (for example `'+375291234567'` → `'+375291234568'` in one assertion), run `pnpm test`, confirm a non-zero exit code (`echo $?`) and that the output names the failing test; revert the change with `git checkout -- src/lib/phone.test.ts` or by restoring the value, and confirm `git diff src/lib/phone.test.ts` is empty.
  - Refs: «Edge Cases», «D10»; scenarios «Prerendered form», «Форма заявки на главной странице», «Button enabled after hydration», «JavaScript отключён», «Форма заявки без JavaScript», «Narrow screen», «Wide screen», «Без формы», «С формой», «Single test file», «Failing test breaks the run»
  - Depends on: 5.7
  - Done when:
    Manual: every observation in steps 2–11 holds; `src/lib/phone.test.ts` is unchanged after step 11.

- [ ] 6.2 [verify] Run formatting, lint, type check, all tests and the production build
  - Files: none
  - Steps:
    1. Run `pnpm exec prettier --check package.json vitest.config.mts src/lib/phone.ts src/lib/phone.test.ts src/lib/lead-schema.ts src/lib/lead-schema.test.ts src/lib/submit-lead.ts src/lib/submit-lead.test.ts src/data/content.ts src/components/lead-form.tsx src/components/lead-form.test.tsx src/components/lead-form.submit.test.tsx src/app/page.tsx src/components/sections/lead-section.tsx README.md`.
    2. Run `pnpm lint --max-warnings 0`.
    3. Run `pnpm typecheck`.
    4. Run `pnpm test` («Tests pass»).
    5. Run `pnpm build`.
  - Refs: «Conventions», «Don'ts»; scenario «Tests pass»
  - Depends on: 6.1
  - Done when: `pnpm exec prettier --check package.json vitest.config.mts src/lib/phone.ts src/lib/phone.test.ts src/lib/lead-schema.ts src/lib/lead-schema.test.ts src/lib/submit-lead.ts src/lib/submit-lead.test.ts src/data/content.ts src/components/lead-form.tsx src/components/lead-form.test.tsx src/components/lead-form.submit.test.tsx src/app/page.tsx src/components/sections/lead-section.tsx README.md` passes; `pnpm lint --max-warnings 0` passes; `pnpm typecheck` passes; `pnpm test` passes; `pnpm build` passes
