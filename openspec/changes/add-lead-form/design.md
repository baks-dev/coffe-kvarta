# Design

## Context

Motivation and scope: see `proposal.md`. Requirements: `specs/lead-form/spec.md`, `specs/landing-page/spec.md`, `specs/dev-workflow/spec.md`.

- **Stack** (from `package.json`): Next.js 16.4.0 (App Router, `src/`), React 19.3.0, TypeScript 6 in `strict` with `noUncheckedIndexedAccess`, Tailwind CSS 4, zod ^4.6.7, sonner ^2.0.8, `@radix-ui/react-radio-group` 1.5.1 (installed), pnpm 12.4.1. Single package, no workspaces, no build flags. Path alias `@/*` → `src/*` (`tsconfig.json`), `jsx: "react-jsx"`.
- **Static rendering**: `next.config.ts` sets `cacheComponents: true`; `src/app/page.tsx` exports `ensureStatic = 'navigation'`. Any request-time work in the route fails the build. A client component that does not call request-time APIs is prerendered into the HTML.
- **Commands** (`package.json` scripts): `pnpm lint` = `eslint .`, `pnpm typecheck` = `next typegen && tsc --noEmit`, `pnpm format:check` = `prettier --check .`, `pnpm build` = `pnpm validate-data && next build`. `pnpm format:check` currently fails on the unrelated file `verification-report-add-landing-sections.md`; checks in this change are scoped to the touched paths.
- **Lint rules that shape the code**: `eslint-config-next` 16.4.0 enables `eslint-plugin-react-hooks` 7.1.1 with `react-hooks/refs`, `react-hooks/set-state-in-effect`, `react-hooks/purity`, `react-hooks/incompatible-library` and `@typescript-eslint/no-unused-vars` (warns even for `_`-prefixed parameters) and `@typescript-eslint/no-explicit-any` (error).
- **Section slot**: `src/components/sections/lead-section.tsx` renders `<Section id="lead-form">` with heading id `lead-form-title` (from `src/components/section.tsx:16`, `aria-labelledby={`${id}-title`}`), the steps list, then `{children && <div className="mt-10">{children}</div>}`, then the call line. `src/app/page.tsx:24` renders `<LeadSection />` without children.
- **Lead intent bus**: `src/lib/lead-intent.ts` exports `LEAD_INTERESTS = ['subscription', 'order', 'question'] as const`, `type LeadInterest`, `interface LeadIntent { interest: LeadInterest; productId?: string }`, `requestLeadIntent`, `subscribeLeadIntent(listener): () => void`, `takePendingLeadIntent(): LeadIntent | null`. Senders: `src/components/product-card.tsx:66` sends `{ interest: 'order', productId: product.id }`; `src/components/sections/subscription.tsx:34` sends `{ interest: 'subscription', productId: subscription.id }` (`'subscription'`).
- **Products**: `src/lib/get-products.ts` exports `getProductById(id: string): Product | undefined` over `src/data/products.json` (ids `ethiopia`, `colombia`, `brazil`, `drip-pack`, `subscription`; names «Эфиопия Иргачеффе», «Колумбия Уила», «Бразилия Серрадо», «Дрип-пакеты ассорти», «Подписка на кофе»). It parses JSON with zod at import time and has no Node-only imports, so client code may import it.
- **Site data**: `src/data/site.ts` — `siteData.phone = '+375 (29) 123-45-67'`, `siteData.hours = { weekday: '8:00–20:00', weekend: '10:00–18:00' }`. `src/lib/format.ts` exports `toTelHref(phone)` (`'+375 (29) 123-45-67'` → `'tel:+375291234567'`).
- **Texts**: `src/data/content.ts` exports `content` (`as const`) with one key per section (`lead` holds the section shell texts) and `type SiteContent`.
- **UI kit** (`src/components/ui/`): `Input` and `Textarea` (props `React.ComponentProps<'input' | 'textarea'>`, include `ref`, style `aria-invalid:border-destructive`), `Label` (`React.ComponentProps<'label'>`), `RadioGroup` / `RadioGroupItem` (Radix wrappers), `Button` (variants `primary | accent | outline | ghost`, sizes `default | sm | lg | icon`; its props do NOT include `ref`). `Toaster` from `src/components/ui/sonner.tsx` is already mounted once in `src/app/layout.tsx:18`.
- **Tokens used here**: `text-body`, `text-small`, `text-h3`, `font-heading`, `text-muted-foreground`, `text-destructive`, `border-destructive`, `border-border`, `bg-card`, `bg-surface`, `rounded-card` (all used in existing components).
- **Leftovers in the working tree** (untracked, from an abandoned attempt): `vitest.config.ts`, `src/lib/phone.ts` (bug: line 22 strips all digits; `as any` fails lint), `src/lib/phone.test.ts`, and empty `src/lib/lead-schema.ts`, `src/lib/lead-schema.test.ts`, `src/lib/submit-lead.ts`, `src/lib/submit-lead.test.ts`. `package.json` already has uncommitted `"test": "vitest run"` and `"vitest": "^5.0.5"`; `vitest` 5.0.5 is installed. This change rewrites every leftover from scratch (user decision); nothing of their content is reused.
- **Verified on prototypes before writing this design** (scratch directory, same versions): TSX compiles in Vitest 5.0.5 without a plugin; RTL 16.3.3 + jsdom 30.1.3 + user-event 14.6.8 + react-hook-form 7.90.0 + `@hookform/resolvers` 5.9.2 + zod 4 work together; Radix RadioGroup needs a `ResizeObserver` stub in jsdom; `onSubmit={handleSubmit(onValid)}` violates `react-hooks/refs` while a wrapper function does not; `react-dom/server` `renderToStaticMarkup` works in the jsdom environment and uses `getServerSnapshot`.

## Decisions

### D1. Form state with react-hook-form and the zod resolver
- **Decision**: `useForm<LeadFormValues, unknown, Lead>({ resolver: zodResolver(leadSchema), defaultValues: LEAD_FORM_DEFAULTS, mode: 'onSubmit', reValidateMode: 'onChange', shouldFocusError: true })` with `react-hook-form` ^7.90.0 and `@hookform/resolvers` ^5.9.2.
- **Why**: task 05 asks for react-hook-form + zodResolver; one schema validates both sides; field errors, first-error focus and revalidation after the first submit come for free.
- **Rejected**: plain `useState` per field (re-implements validation wiring); `useActionState` with a Server Action (the brief and task 06 require a JSON endpoint `POST /api/lead`, and a Server Action would bypass it).
- **Affects**: `src/components/lead-form.tsx`, `package.json`.

### D2. One shared schema, phone logic in its own module
- **Decision**: `src/lib/lead-schema.ts` holds `leadSchema`, field list, messages and the API response type; `src/lib/phone.ts` holds pure `normalizeBelarusPhone` / `formatBelarusPhone`. Neither imports React or Next.
- **Why**: task 06 imports the same schema on the server; the form reuses `formatBelarusPhone` on blur and in result texts; pure modules are tested in the Node environment.
- **Rejected**: phone regex inside the schema (blur formatting would duplicate it); a schema per side (drift between client and server).
- **Affects**: `src/lib/lead-schema.ts`, `src/lib/phone.ts`.

### D3. Accepted phone notations (Assumed)
- **Decision**: accept only mobile codes 25, 29, 33, 44 in the notations `+375XXXXXXXXX`, `375XXXXXXXXX`, `80XXXXXXXXX`, `XXXXXXXXX` with optional spaces, parentheses and hyphens; reject landlines and everything else.
- **Why**: task 05 lists `+375 (25|29|33|44)` and the `80…`, `375…` forms; visitors from Instagram often type the 9-digit local form `29 123-45-67`, and rejecting it would cost leads. Landlines are out because the manager calls back mobile numbers (assumption recorded in README).
- **Rejected**: `libphonenumber-js` (≈150 KB for four operator codes); accepting landline code 17 (contradicts task 05).
- **Affects**: `src/lib/phone.ts`, `README.md`.

### D4. No input mask; hint plus reformat on blur
- **Decision** (user decision): a permanent hint under the field and reformatting to `+375 XX XXX-XX-XX` on blur when the value is accepted.
- **Why**: masks fight paste and autofill on mobile keyboards; the hint shows accepted notations up front.
- **Rejected**: an input mask library; reformatting on every keystroke (caret jumps).
- **Affects**: `src/components/lead-form.tsx`.

### D5. Radio group with «Разовый заказ» preselected
- **Decision** (user decision): Radix radio group from `src/components/ui/radio-group.tsx` bound through `Controller`; default `interest: 'order'`; only «Имя» and «Телефон» are required.
- **Why**: one tap on mobile; the README already records radio over select; most visitors come for a one-time order.
- **Rejected**: native `<select>` (two taps); no default (one more error for the visitor).
- **Affects**: `src/components/lead-form.tsx`.

### D6. Product from the intent is sent and shown
- **Decision** (user decision): the intent's `productId` is stored as an unregistered form value, shown as «Вы выбрали: <name>» with «Убрать», sent as `productId`, and validated against `getProductById`.
- **Why**: the manager sees which card the visitor clicked; validating against the catalogue keeps junk ids out of storage in task 06.
- **Rejected**: copying the product name into the comment (mixes data with free text); a regex-only id check (accepts unknown ids).
- **Affects**: `src/lib/lead-schema.ts`, `src/components/lead-form.tsx`.

### D7. Double-submit guard: synchronous ref plus disabled button
- **Decision**: `onValid` returns immediately when `inFlightRef.current` is `true`; it sets the ref to `true` before any `await`; the button is disabled while `status === 'sending'`.
- **Why**: `handleSubmit` validates asynchronously, so two quick clicks both reach `onValid` before React re-renders the disabled button; only a synchronous ref check stops the second call.
- **Rejected**: disabled button only (race above); debounce (delays the first request and still races).
- **Affects**: `src/components/lead-form.tsx`.

### D8. `POST /api/lead` contract (binding for task 06)
- **Decision**: request = JSON `Lead`; responses: 200 `{"status":"ok","id":string}`, 200 `{"status":"duplicate"}`, 400 `{"status":"invalid","fieldErrors":{<field>:string}}`, any other status with `{"status":"error","message":string}`. The client treats everything except the first three shapes as a server failure.
- **Why**: the brief says a repeated number must not create a second lead, which is not an error for the visitor, so duplicate is a 200; field errors reuse the shared messages.
- **Rejected**: 409 for duplicate (the visitor did nothing wrong, and `fetch` users read 4xx as failure); 422 for validation (task 06 plan uses 400).
- **Affects**: `src/lib/lead-schema.ts` (`LeadApiResponse`), `src/lib/submit-lead.ts`.

### D9. 15-second timeout with AbortController and setTimeout (Assumed)
- **Decision**: `submitLead` aborts the request after `SUBMIT_TIMEOUT_MS = 15_000` using `new AbortController()` and `setTimeout`, and always clears the timer.
- **Why**: on a weak mobile connection the visitor must not wait forever; 15 s covers a cold serverless start plus storage. `setTimeout` is controlled by Vitest fake timers, so the timeout is testable.
- **Rejected**: `AbortSignal.timeout()` (not driven by fake timers); no timeout (spinner forever).
- **Affects**: `src/lib/submit-lead.ts`, `README.md`.

### D10. Disabled submit until hydration, `<noscript>` fallback (Assumed)
- **Decision**: `useHydrated()` built on `useSyncExternalStore(subscribeNothing, () => true, () => false)`; the button is disabled while it returns `false`; a `<noscript>` inside the form offers the phone.
- **Why**: without JS a native GET submission would put the name and phone into the URL (and into analytics and logs); the endpoint accepts only JSON. `useSyncExternalStore` avoids `setState` inside an effect (`react-hooks/set-state-in-effect`).
- **Rejected**: native `method="post"` fallback (task 06 accepts JSON only); `useEffect(() => setHydrated(true))` (lint error).
- **Affects**: `src/components/lead-form.tsx`.

### D11. Where texts live
- **Decision**: validation messages in `LEAD_MESSAGES` (`src/lib/lead-schema.ts`, shared with the server); all other form texts in a new `content.leadForm` key of `src/data/content.ts`.
- **Why**: the project keeps section texts in `content.ts`; messages must be identical on both sides.
- **Rejected**: literals inside the component (breaks the content convention).
- **Affects**: `src/data/content.ts`, `src/lib/lead-schema.ts`.

### D12. Test stack
- **Decision**: Vitest with `environment: 'node'` by default; component test files start with `// @vitest-environment jsdom`; `@testing-library/react` ^16.3.3, `@testing-library/dom` ^10.4.2, `@testing-library/user-event` ^14.6.8, `jsdom` ^30.1.3. Component tests mock `@/lib/submit-lead` and `sonner` with `vi.mock`. Assertions use plain `expect` (no `@testing-library/jest-dom`). Config file `vitest.config.mts`.
- **Why**: library modules must also run on the server, so they are tested in Node; mocking `submitLead` isolates the component from HTTP (HTTP is covered by `submit-lead.test.ts`); `.mts` avoids Vite's "ESM syntax in a file loaded as CommonJS" warning because `package.json` has no `"type": "module"`.
- **Rejected**: jsdom for all tests (slower, hides Node-only problems); `happy-dom` (Radix compatibility not verified); `@vitejs/plugin-react` (not needed, TSX compiles without it); `vitest.config.ts` (warning on every run).
- **Affects**: `package.json`, `vitest.config.mts`, all `*.test.ts(x)` files.

### D13. Submit handler wrapper
- **Decision**: `const onSubmit = (event: React.FormEvent<HTMLFormElement>) => { void handleSubmit(onValid)(event); };` and `<form onSubmit={onSubmit}>`.
- **Why**: `onSubmit={handleSubmit(onValid)}` calls `handleSubmit` during render with a callback that reads a ref; `react-hooks/refs` reports it as an error (verified).
- **Rejected**: disabling the rule (forbidden by Don'ts).
- **Affects**: `src/components/lead-form.tsx`.

### D14. Status machine and focus management
- **Decision**: `LeadFormStatus = 'idle' | 'sending' | 'success' | 'duplicate' | 'error'` kept in state and mirrored in `statusRef` via one `setStatus` callback; focus moves happen only in one effect keyed on `[status, setFocus]`, driven by `pendingFocusRef`.
- **Why**: the intent listener needs the current status outside render (ref); effects that only call DOM methods are allowed by `react-hooks/set-state-in-effect`.
- **Rejected**: `setError(..., { shouldFocus: true })` (the button is disabled at that moment and the status re-render follows); reading status from state inside the listener (stale closure).
- **Affects**: `src/components/lead-form.tsx`.

### D15. Failure feedback: alert block plus toast
- **Decision**: on failure show an inline `role="alert"` block above the button with a reason-specific text and the workshop phone, call `toast.error('Не удалось отправить заявку')`, keep all values, focus the submit button.
- **Why**: the toast disappears after a few seconds, the inline block stays while the visitor decides; the design-system spec already defines the toast text.
- **Rejected**: toast only (vanishes); clearing the form (loses typed data).
- **Affects**: `src/components/lead-form.tsx`, `src/data/content.ts`.

### D16. Leftover files are rewritten from scratch
- **Decision** (user decision): delete `vitest.config.ts`, `src/lib/phone.test.ts`, `src/lib/lead-schema.test.ts`, `src/lib/submit-lead.test.ts` in the first group; stubs overwrite `src/lib/phone.ts`, `src/lib/lead-schema.ts`, `src/lib/submit-lead.ts`.
- **Why**: the leftover code has a digit-stripping bug and a lint error; a clean stub → test → code sequence is easier to verify.
- **Rejected**: patching the leftovers (their tests do not match the scenario names of this change).
- **Affects**: files listed above.

## File Structure

| Path | Action | Purpose | Wired in |
|---|---|---|---|
| `package.json` | modify | add dependencies and keep `"test": "vitest run"` | — |
| `pnpm-lock.yaml` | modify | lock new packages (written by `pnpm add`) | — |
| `vitest.config.ts` | delete | leftover, replaced by `.mts` | — |
| `vitest.config.mts` | create | Vitest config: alias `@`, node env, include patterns | picked up by `vitest` automatically |
| `src/lib/phone.ts` | create (overwrite leftover) | normalize and format Belarusian mobile numbers | imported by `lead-schema.ts`, `lead-form.tsx` |
| `src/lib/phone.test.ts` | delete, then create | unit tests of `phone.ts` | `vitest.config.mts` include |
| `src/lib/lead-schema.ts` | create (overwrite leftover) | shared zod schema, messages, field list, API response type | imported by `submit-lead.ts`, `lead-form.tsx`, task 06 |
| `src/lib/lead-schema.test.ts` | delete, then create | unit tests of the schema | `vitest.config.mts` include |
| `src/lib/submit-lead.ts` | create (overwrite leftover) | `POST /api/lead` client with timeout and response mapping | imported by `lead-form.tsx` |
| `src/lib/submit-lead.test.ts` | delete, then create | unit tests of `submitLead` with a stubbed `fetch` | `vitest.config.mts` include |
| `src/data/content.ts` | modify | add `leadForm` texts | imported by `lead-form.tsx` |
| `src/components/lead-form.tsx` | create | client component `LeadForm` | imported by `src/app/page.tsx` |
| `src/components/lead-form.test.tsx` | create | component tests: fields, validation, prefill, prerender | `vitest.config.mts` include |
| `src/components/lead-form.submit.test.tsx` | create | component tests: submission outcomes and focus | `vitest.config.mts` include |
| `src/app/page.tsx` | modify | pass `<LeadForm />` into `<LeadSection>` | route `/` |
| `src/components/sections/lead-section.tsx` | modify | JSDoc of `children` only | — |
| `README.md` | modify | assumptions of this change and the `test` command | — |

No other files are touched.

## Contracts

### package.json

```json
{
  "scripts": {
    "test": "vitest run"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.9.2",
    "react-hook-form": "^7.90.0"
  },
  "devDependencies": {
    "@testing-library/dom": "^10.4.2",
    "@testing-library/react": "^16.3.3",
    "@testing-library/user-event": "^14.6.8",
    "jsdom": "^30.1.3",
    "vitest": "^5.0.5"
  }
}
```

Only these keys are added or kept; all other keys stay unchanged. Install with `pnpm add react-hook-form@7.90.0 @hookform/resolvers@5.9.2` and `pnpm add -D jsdom@30.1.3 @testing-library/react@16.3.3 @testing-library/dom@10.4.2 @testing-library/user-event@14.6.8` (pnpm writes the `^` ranges).

### vitest.config.mts

```ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
```

### src/lib/phone.ts

```ts
/** Коды мобильных операторов Беларуси. */
export const BELARUS_MOBILE_CODES = ['25', '29', '33', '44'] as const;

/**
 * Любая допустимая запись белорусского мобильного → '+375XXXXXXXXX'; иначе null.
 * Не бросает исключений.
 */
export function normalizeBelarusPhone(input: string): string | null;

/**
 * Допустимая запись → '+375 XX XXX-XX-XX'; недопустимая возвращается без изменений.
 */
export function formatBelarusPhone(input: string): string;
```

Invariants: a non-null result of `normalizeBelarusPhone` always matches `/^\+375(25|29|33|44)\d{7}$/`; `normalizeBelarusPhone(formatBelarusPhone(x)) === normalizeBelarusPhone(x)` for every `x`; `formatBelarusPhone` of an accepted value always matches `/^\+375 (25|29|33|44) \d{3}-\d{2}-\d{2}$/`.

### src/lib/lead-schema.ts

```ts
import { z } from 'zod';
import { getProductById } from '@/lib/get-products';
import { LEAD_INTERESTS } from '@/lib/lead-intent';
import { normalizeBelarusPhone } from '@/lib/phone';

export const LEAD_NAME_MAX = 60;
export const LEAD_COMMENT_MAX = 500;

/** Тексты ошибок валидации; общие для формы и POST /api/lead. */
export const LEAD_MESSAGES = {
  nameRequired: 'Напишите, как к вам обращаться',
  nameTooLong: 'Имя не длиннее 60 символов',
  phoneRequired: 'Укажите телефон — по нему перезвонит менеджер',
  phoneInvalid: 'Введите номер в формате +375 29 123-45-67',
  interestInvalid: 'Выберите, что вас интересует',
  commentTooLong: 'Комментарий не длиннее 500 символов',
  productInvalid: 'Выбранный товар не найден',
} as const;

/** Поля заявки в порядке формы. */
export const LEAD_FIELDS = ['name', 'phone', 'interest', 'comment', 'productId'] as const;
export type LeadField = (typeof LEAD_FIELDS)[number];

/** Схема заявки (см. Algorithms / leadSchema). Тип НЕ аннотируется вручную: задача 07 вызовет `.extend`. */
export const leadSchema = z.object({
  name: /* see Algorithms / leadSchema */,
  phone: /* … */,
  interest: /* … */,
  comment: /* … */,
  productId: /* … */,
});

/** Значения формы до валидации. */
export type LeadFormValues = z.input<typeof leadSchema>;
/** Проверенная заявка: телефон '+375XXXXXXXXX', строки обрезаны, comment по умолчанию ''. */
export type Lead = z.output<typeof leadSchema>;

/** Тело ответа POST /api/lead (контракт для задачи 06). */
export type LeadApiResponse =
  | { status: 'ok'; id: string }
  | { status: 'duplicate' }
  | { status: 'invalid'; fieldErrors: Partial<Record<LeadField, string>> }
  | { status: 'error'; message: string };
```

Resulting types (must hold; checked by `pnpm typecheck` through usage):
- `LeadFormValues = { name: string; phone: string; interest: 'subscription' | 'order' | 'question'; comment?: string | undefined; productId?: string | undefined }`
- `Lead = { name: string; phone: string; interest: 'subscription' | 'order' | 'question'; comment: string; productId?: string | undefined }`

Invariants: a successfully parsed `Lead` has `phone` matching `/^\+375(25|29|33|44)\d{7}$/`, `name.length` in 1..60 with no leading/trailing whitespace, `comment.length` ≤ 500 with no leading/trailing whitespace, `productId` either absent or an id for which `getProductById` returns a product, and no keys outside `LEAD_FIELDS`. A failed parse yields exactly one issue per invalid field with a message from `LEAD_MESSAGES` (except non-string inputs, which keep zod's default type message).

### src/lib/submit-lead.ts

```ts
import type { Lead, LeadField } from '@/lib/lead-schema';

export const LEAD_ENDPOINT = '/api/lead';
export const SUBMIT_TIMEOUT_MS = 15_000;

export type SubmitFailureReason = 'network' | 'timeout' | 'server';

export type SubmitLeadResult =
  | { kind: 'ok' }
  | { kind: 'duplicate' }
  | { kind: 'invalid'; fieldErrors: Partial<Record<LeadField, string>> }
  | { kind: 'failed'; reason: SubmitFailureReason };

/**
 * Отправляет заявку на POST /api/lead. Никогда не бросает: любой сбой → { kind: 'failed' }.
 */
export async function submitLead(lead: Lead): Promise<SubmitLeadResult>;
```

The module has one non-exported helper `interpretResponse(status: number, body: unknown): SubmitLeadResult`. Invariant: after `submitLead` settles, no timer created by it is pending.

### POST /api/lead (wire format)

Request:

```http
POST /api/lead HTTP/1.1
Content-Type: application/json

{"name":"Аня","phone":"+375291234567","interest":"order","comment":"Позвоните после 18:00","productId":"colombia"}
```

Responses the client recognises:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"status":"ok","id":"lead_1"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"status":"duplicate"}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"status":"invalid","fieldErrors":{"phone":"Введите номер в формате +375 29 123-45-67"}}
```

Any other response (for example `HTTP/1.1 500` with `{"status":"error","message":"Не удалось сохранить заявку"}`, a 404 HTML page, a non-JSON body) is a server failure.

### src/data/content.ts

Add imports and a `leadForm` key after `lead` inside `content`:

```ts
import type { LeadInterest } from '@/lib/lead-intent';
import type { SubmitFailureReason } from '@/lib/submit-lead';

// inside `export const content = { … }`, right after the `lead` key:
  leadForm: {
    labels: {
      name: 'Имя',
      phone: 'Телефон',
      interest: 'Что интересует',
      comment: 'Комментарий',
    },
    phonePlaceholder: '+375 29 123-45-67',
    phoneHint: 'Белорусский мобильный: +375 29 123-45-67, 8 029 123-45-67 или 29 123-45-67',
    commentHint: 'Необязательно. Например, удобное время для звонка.',
    interestOptions: [
      { value: 'subscription', label: 'Подписка' },
      { value: 'order', label: 'Разовый заказ' },
      { value: 'question', label: 'Вопрос' },
    ] satisfies ReadonlyArray<{ value: LeadInterest; label: string }>,
    product: {
      selected: 'Вы выбрали:',
      remove: 'Убрать',
      removeLabel: 'Убрать выбор:',
    },
    submit: 'Отправить заявку',
    sending: 'Отправляем…',
    success: {
      title: 'Спасибо, заявка у нас',
      text: (phone: string) =>
        `Менеджер перезвонит на номер ${phone} в рабочее время: пн–пт ${siteData.hours.weekday}, сб–вс ${siteData.hours.weekend}.`,
    },
    duplicate: {
      title: 'Мы уже получили вашу заявку',
      text: (phone: string) =>
        `Заявка с номера ${phone} пришла меньше 10 минут назад, повторно отправлять не нужно. Менеджер перезвонит в рабочее время.`,
    },
    startOver: 'Отправить ещё одну заявку',
    failure: {
      title: 'Не удалось отправить заявку',
      toast: 'Не удалось отправить заявку',
      reasons: {
        network: 'Похоже, пропал интернет. Проверьте подключение и отправьте заявку ещё раз.',
        timeout: 'Сервер не ответил за 15 секунд. Отправьте заявку ещё раз.',
        server: 'На нашей стороне что-то пошло не так. Отправьте заявку ещё раз.',
      } satisfies Record<SubmitFailureReason, string>,
      callBefore: 'Или позвоните:',
      callAfter: '— примем заявку по телефону.',
    },
    noscript: {
      before: 'Чтобы отправить заявку, включите JavaScript или позвоните нам:',
      after: '.',
    },
  },
```

`siteData` is already imported in `content.ts`. Invariant: every string above is used verbatim by `LeadForm`; the component contains no other user-visible literals.

### src/components/lead-form.tsx

```tsx
'use client';

/** Форма заявки: поля, валидация, отправка на POST /api/lead и результат. Без пропсов. */
export function LeadForm() { /* … */ }
```

Imports (exactly these modules): `react` (`useCallback`, `useEffect`, `useRef`, `useState`, `useSyncExternalStore`), `react-hook-form` (`Controller`, `useForm`, `useWatch`), `@hookform/resolvers/zod` (`zodResolver`), `sonner` (`toast`), `@/components/ui/button` (`Button`), `@/components/ui/input` (`Input`), `@/components/ui/label` (`Label`), `@/components/ui/radio-group` (`RadioGroup`, `RadioGroupItem`), `@/components/ui/textarea` (`Textarea`), `@/data/content` (`content`), `@/data/site` (`siteData`), `@/lib/format` (`toTelHref`), `@/lib/get-products` (`getProductById`), `@/lib/lead-intent` (`subscribeLeadIntent`, `takePendingLeadIntent`, type `LeadIntent`), `@/lib/lead-schema` (`LEAD_FIELDS`, `leadSchema`, types `Lead`, `LeadFormValues`), `@/lib/phone` (`formatBelarusPhone`), `@/lib/submit-lead` (`submitLead` — the only runtime import from this module; types `SubmitFailureReason`).

Module-level (not exported):

```ts
type LeadFormStatus = 'idle' | 'sending' | 'success' | 'duplicate' | 'error';
type PendingFocus = 'name' | 'phone' | 'comment' | 'submit';

const SUBMIT_ID = 'lead-submit';
const LEAD_FORM_DEFAULTS: LeadFormValues = {
  name: '',
  phone: '',
  interest: 'order',
  comment: '',
  productId: undefined,
};
const subscribeNothing = () => () => {};
function useHydrated(): boolean; // useSyncExternalStore(subscribeNothing, () => true, () => false)
```

Component state: `status` (`useState<LeadFormStatus>('idle')`) mirrored in `statusRef`; `failureReason` (`useState<SubmitFailureReason | null>(null)`); `submittedPhone` (`useState('')`, normalized phone of the last sent lead); refs `inFlightRef` (`false`), `pendingFocusRef` (`PendingFocus | null`), `resultHeadingRef` (`HTMLHeadingElement`).

DOM contract while `status` is `idle`, `sending` or `error` (ids and attributes are fixed; tests query by role, label and text):

```tsx
<form noValidate aria-labelledby="lead-form-title" onSubmit={onSubmit} className="grid max-w-2xl gap-6">
  {/* product area: rendered only when a product is selected or errors.productId exists */}
  <div className="grid gap-2">
    {/* when getProductById(productId) returns a product: */}
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border bg-surface px-4 py-3">
      <p className="text-body">{`${content.leadForm.product.selected} ${product.name}`}</p>
      <Button type="button" variant="outline" size="sm"
        aria-label={`${content.leadForm.product.removeLabel} ${product.name}`} onClick={removeProduct}>
        {content.leadForm.product.remove}
      </Button>
    </div>
    {/* when errors.productId: */}
    <p id="lead-product-error" className="text-small text-destructive">{errors.productId.message}</p>
  </div>

  <div className="grid gap-6 md:grid-cols-2">
    <div className="grid gap-2">
      <Label htmlFor="lead-name">Имя</Label>
      <Input id="lead-name" autoComplete="name" aria-required="true"
        aria-invalid={errors.name ? true : undefined}
        aria-describedby={errors.name ? 'lead-name-error' : undefined}
        {...register('name')} />
      {/* when errors.name: */}<p id="lead-name-error" className="text-small text-destructive">…</p>
    </div>
    <div className="grid gap-2">
      <Label htmlFor="lead-phone">Телефон</Label>
      <Input id="lead-phone" type="tel" inputMode="tel" autoComplete="tel"
        placeholder="+375 29 123-45-67" aria-required="true"
        aria-invalid={errors.phone ? true : undefined}
        aria-describedby={errors.phone ? 'lead-phone-hint lead-phone-error' : 'lead-phone-hint'}
        {...register('phone', { onBlur: onPhoneBlur })} />
      <p id="lead-phone-hint" className="text-small text-muted-foreground">{content.leadForm.phoneHint}</p>
      {/* when errors.phone: */}<p id="lead-phone-error" className="text-small text-destructive">…</p>
    </div>
  </div>

  <fieldset className="grid gap-3">
    <legend id="lead-interest-legend" className="mb-3 text-sm font-medium">Что интересует</legend>
    {/* Controller name="interest" → */}
    <RadioGroup name="interest" value={field.value} onValueChange={field.onChange}
      aria-labelledby="lead-interest-legend"
      aria-invalid={errors.interest ? true : undefined}
      aria-describedby={errors.interest ? 'lead-interest-error' : undefined}
      className="grid gap-3 sm:grid-cols-3">
      {/* for each content.leadForm.interestOptions entry: */}
      <div className="flex items-center gap-3">
        <RadioGroupItem id={`lead-interest-${option.value}`} value={option.value} />
        <Label htmlFor={`lead-interest-${option.value}`} className="text-body font-normal">{option.label}</Label>
      </div>
    </RadioGroup>
    {/* when errors.interest: */}<p id="lead-interest-error" className="text-small text-destructive">…</p>
  </fieldset>

  <div className="grid gap-2">
    <Label htmlFor="lead-comment">Комментарий</Label>
    <Textarea id="lead-comment" rows={4}
      aria-invalid={errors.comment ? true : undefined}
      aria-describedby={errors.comment ? 'lead-comment-hint lead-comment-error' : 'lead-comment-hint'}
      {...register('comment')} />
    <p id="lead-comment-hint" className="text-small text-muted-foreground">{content.leadForm.commentHint}</p>
    {/* when errors.comment: */}<p id="lead-comment-error" className="text-small text-destructive">…</p>
  </div>

  {/* when status === 'error' && failureReason !== null: */}
  <div role="alert" className="grid gap-2 rounded-card border border-destructive bg-card p-4">
    <p className="font-medium text-destructive">{content.leadForm.failure.title}</p>
    <p className="text-body">{content.leadForm.failure.reasons[failureReason]}</p>
    <p className="text-body">
      {content.leadForm.failure.callBefore}{' '}
      <a href={toTelHref(siteData.phone)} className="font-medium underline underline-offset-4">{siteData.phone}</a>{' '}
      {content.leadForm.failure.callAfter}
    </p>
  </div>

  <Button id="lead-submit" type="submit" size="lg" className="w-full md:w-auto md:justify-self-start"
    disabled={!hydrated || status === 'sending'}>
    {status === 'sending' ? content.leadForm.sending : content.leadForm.submit}
  </Button>

  <noscript>
    <p className="text-body">
      {content.leadForm.noscript.before}{' '}
      <a href={toTelHref(siteData.phone)} className="font-medium underline underline-offset-4">{siteData.phone}</a>
      {content.leadForm.noscript.after}
    </p>
  </noscript>
</form>
```

Labels and the legend render the texts from `content.leadForm.labels` (`name`, `phone`, `interest`, `comment`); the literals above show the resulting text. Error paragraphs render `errors.<field>.message`.

DOM contract while `status` is `success` or `duplicate` (the form is not rendered):

```tsx
<div className="grid max-w-2xl gap-4 rounded-card border border-border bg-card p-5 md:p-8">
  <h3 id="lead-result-title" ref={resultHeadingRef} tabIndex={-1} className="font-heading text-h3">
    {status === 'success' ? content.leadForm.success.title : content.leadForm.duplicate.title}
  </h3>
  <p className="text-body">
    {(status === 'success' ? content.leadForm.success.text : content.leadForm.duplicate.text)(
      formatBelarusPhone(submittedPhone),
    )}
  </p>
  <Button type="button" variant="outline" className="justify-self-start" onClick={startOver}>
    {content.leadForm.startOver}
  </Button>
</div>
```

Invariants: at most one request is in flight; `statusRef.current === status` after every `setStatus`; the badge text is one text node; the submit button is disabled whenever `hydrated` is `false` or `status === 'sending'`.

### src/app/page.tsx

```tsx
import { LeadForm } from '@/components/lead-form';
// …
        <LeadSection>
          <LeadForm />
        </LeadSection>
```

All other lines stay unchanged, including `export const ensureStatic = 'navigation';`.

### src/components/sections/lead-section.tsx

Only line 7 changes:

```tsx
  /** Форма заявки; без неё секция показывает только шаги и телефон. */
```

### README.md

Insert after the section `### Допущения для change "add-landing-sections"` (before `## Development`):

```md
### Допущения для change "add-lead-form"

- **Формат номера**: принимаются только мобильные номера Беларуси (коды 25, 29, 33, 44) в записях `+375…`, `375…`, `80…` и девять цифр без префикса (`29 123-45-67`); городские и иностранные номера отклоняются.
- **Без маски ввода**: под полем телефона всегда видна подсказка, допустимый номер переформатируется в `+375 29 123-45-67`, когда поле теряет фокус.
- **Тайм-аут отправки**: если сервер не ответил за 15 секунд, запрос прерывается и форма показывает ошибку с телефоном мастерской.
- **Кнопка до загрузки JavaScript**: неактивна, чтобы браузер не отправил форму сам и имя с телефоном не попали в адресную строку; без JavaScript форма предлагает позвонить.
- **До задачи 06**: эндпоинта `POST /api/lead` ещё нет, поэтому на запущенном сайте отправка заканчивается сообщением об ошибке.
```

Add a row to the `### Commands` table after `format:check`:

```md
| `test`              | Запустить модульные и компонентные тесты (Vitest)         |
```

Run `pnpm exec prettier --write README.md` afterwards to realign the table.

## Algorithms

### normalizeBelarusPhone
Input: `input: string`. Output: `'+375' + 9 digits` or `null`.
1. Let `s = input.trim()`.
2. If `s === ''`, return `null`.
3. If `s` contains any character outside `0-9`, space, `+`, `(`, `)`, `-` (test with `/[^0-9 +()-]/`), return `null`.
4. If `s` contains `+` at any index other than 0, return `null` (this also rejects `++…`).
5. Let `digits = s.replace(/\D/g, '')`.
6. If `s` starts with `+`: if `digits.length === 12` and `digits.startsWith('375')`, let `national = digits.slice(3)`; otherwise return `null`.
7. Otherwise: if `digits.length === 12` and `digits.startsWith('375')`, `national = digits.slice(3)`; else if `digits.length === 11` and `digits.startsWith('80')`, `national = digits.slice(2)`; else if `digits.length === 9`, `national = digits`; else return `null`.
8. If `national.slice(0, 2)` is not one of `BELARUS_MOBILE_CODES`, return `null` (compare with `(BELARUS_MOBILE_CODES as readonly string[]).includes(...)`; no `any`).
9. Return `'+375' + national`.

### formatBelarusPhone
Input: `input: string`. Output: display string.
1. Let `normalized = normalizeBelarusPhone(input)`.
2. If `normalized === null`, return `input` unchanged.
3. Let `n = normalized.slice(4)` (9 digits).
4. Return `` `+375 ${n.slice(0, 2)} ${n.slice(2, 5)}-${n.slice(5, 7)}-${n.slice(7, 9)}` ``.

### leadSchema
Fields, in this order (zod 4 API; messages via `{ error: … }`):
1. `name`: `z.string().trim().min(1, { error: LEAD_MESSAGES.nameRequired }).max(LEAD_NAME_MAX, { error: LEAD_MESSAGES.nameTooLong })`.
2. `phone`: `z.string().transform((value, ctx) => { … })` where the callback:
   1. if `value.trim() === ''`: `ctx.addIssue({ code: 'custom', message: LEAD_MESSAGES.phoneRequired })`, return `z.NEVER`;
   2. let `normalized = normalizeBelarusPhone(value)`;
   3. if `normalized === null`: `ctx.addIssue({ code: 'custom', message: LEAD_MESSAGES.phoneInvalid })`, return `z.NEVER`;
   4. return `normalized`.
3. `interest`: `z.enum(LEAD_INTERESTS, { error: LEAD_MESSAGES.interestInvalid })`.
4. `comment`: `z.string().trim().max(LEAD_COMMENT_MAX, { error: LEAD_MESSAGES.commentTooLong }).default('')`.
5. `productId`: `z.string().refine((id) => getProductById(id) !== undefined, { error: LEAD_MESSAGES.productInvalid }).optional()`.
The object uses default `z.object` behaviour (unknown keys stripped). Do not use `.strict()`, `.passthrough()` or a manual type annotation.

### submitLead
Input: `lead: Lead`. Output: `Promise<SubmitLeadResult>`; never rejects.
1. Create `controller = new AbortController()` and `timer = setTimeout(() => controller.abort(), SUBMIT_TIMEOUT_MS)`.
2. Enter `try { … } finally { clearTimeout(timer); }` covering steps 3–5.
3. Call `fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead), signal: controller.signal })` inside its own `try/catch`. On any rejection return `{ kind: 'failed', reason: controller.signal.aborted ? 'timeout' : 'network' }`.
4. Read `body = await response.json()` inside its own `try/catch`. On rejection return `{ kind: 'failed', reason: controller.signal.aborted ? 'timeout' : 'server' }`.
5. Return `interpretResponse(response.status, body)`.

### interpretResponse
Input: `status: number`, `body: unknown`. Output: `SubmitLeadResult`.
1. If `body` is not a non-null object or is an array, return `{ kind: 'failed', reason: 'server' }`.
2. Let `kind = body.status` (read as `unknown`).
3. If `status === 200 && kind === 'ok'`, return `{ kind: 'ok' }`.
4. If `status === 200 && kind === 'duplicate'`, return `{ kind: 'duplicate' }`.
5. If `status === 400 && kind === 'invalid'`:
   1. let `raw = body.fieldErrors`; if `raw` is not a non-null, non-array object, return `{ kind: 'failed', reason: 'server' }`;
   2. build `fieldErrors: Partial<Record<LeadField, string>>`: for each `field` of `LEAD_FIELDS` in order, if `raw[field]` is a string with `trim() !== ''`, set `fieldErrors[field] = raw[field]`;
   3. if `fieldErrors` has no keys, return `{ kind: 'failed', reason: 'server' }`;
   4. return `{ kind: 'invalid', fieldErrors }`.
6. Return `{ kind: 'failed', reason: 'server' }`.
(`LEAD_FIELDS` is imported as a value from `@/lib/lead-schema` for step 5.2.)

### LeadForm / setStatus
`useCallback((next: LeadFormStatus) => { statusRef.current = next; setStatusState(next); }, [])`.

### LeadForm / applyIntent
Input: `intent: LeadIntent`. `useCallback` with deps `[reset, setStatus, setValue, clearErrors]`.
1. Let `current = statusRef.current`.
2. If `current === 'sending'`, return.
3. If `current === 'success'` or `current === 'duplicate'`: call `reset({ ...LEAD_FORM_DEFAULTS, interest: intent.interest, productId: intent.productId })`, then `setStatus('idle')`, return.
4. Otherwise (`idle` or `error`): `setValue('interest', intent.interest)`, `setValue('productId', intent.productId)`, `clearErrors('productId')`. The status (and an `error` alert) stays as is.

### LeadForm / intent effect
`useEffect` with deps `[applyIntent]`:
1. `const pending = takePendingLeadIntent();`
2. If `pending !== null`, call `applyIntent(pending)`.
3. Return `subscribeLeadIntent(applyIntent)` (the unsubscribe function is the cleanup).

### LeadForm / onValid
Input: `lead: Lead` (already validated by the resolver).
1. If `inFlightRef.current` is `true`, return.
2. Set `inFlightRef.current = true`; call `setStatus('sending')`.
3. In `try { … } finally { inFlightRef.current = false; }`: `const result = await submitLead(lead);` then branch on `result.kind`:
   - `'ok'`: `setSubmittedPhone(lead.phone)`; `setStatus('success')`.
   - `'duplicate'`: `setSubmittedPhone(lead.phone)`; `setStatus('duplicate')`.
   - `'invalid'`: for each `field` of `LEAD_FIELDS` with `result.fieldErrors[field]` defined, call `setError(field, { type: 'server', message: result.fieldErrors[field] })`; set `pendingFocusRef.current` to the first of `'name'`, `'phone'`, `'comment'` present in `result.fieldErrors`, or `'submit'` if none; `setStatus('idle')`.
   - `'failed'`: `setFailureReason(result.reason)`; `toast.error(content.leadForm.failure.toast)`; `setStatus('error')`.
(`LEAD_FIELDS` is imported from `@/lib/lead-schema` for this step as well.)

### LeadForm / onSubmit
`(event: React.FormEvent<HTMLFormElement>) => { void handleSubmit(onValid)(event); }` — see D13.

### LeadForm / onPhoneBlur
Input: `event: React.FocusEvent<HTMLInputElement>`.
1. Let `value = event.target.value` and `formatted = formatBelarusPhone(value)`.
2. If `formatted !== value`, call `setValue('phone', formatted, { shouldValidate: isSubmitted })` (`isSubmitted` from `formState`).

### LeadForm / removeProduct
`setValue('productId', undefined)` then `clearErrors('productId')`. Trivial.

### LeadForm / startOver
1. `reset(LEAD_FORM_DEFAULTS)`.
2. `pendingFocusRef.current = 'name'`.
3. `setStatus('idle')`.

### LeadForm / focus effect
`useEffect` with deps `[status, setFocus]`:
1. If `status === 'success' || status === 'duplicate'`: `resultHeadingRef.current?.focus()`; stop.
2. If `status === 'error'`: `document.getElementById(SUBMIT_ID)?.focus()`; stop.
3. If `status === 'idle'`: let `target = pendingFocusRef.current`; set `pendingFocusRef.current = null`; if `target === 'submit'` call `document.getElementById(SUBMIT_ID)?.focus()`; else if `target !== null` call `setFocus(target)`.
4. Otherwise (`sending`) do nothing.

### LeadForm / render
1. `const hydrated = useHydrated();`
2. `const productId = useWatch({ control, name: 'productId' });` and `const product = productId ? getProductById(productId) : undefined;`
3. If `status` is `success` or `duplicate`, return the result block (Contracts / src/components/lead-form.tsx); otherwise return the form.

### Trivial (free implementation)
`useHydrated` (one `useSyncExternalStore` call, see D10); `subscribeNothing`.

## Examples

### Verified component skeleton (lint-clean with this project's ESLint config)

```tsx
const subscribeNothing = () => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNothing, () => true, () => false);
}

export function LeadForm() {
  const hydrated = useHydrated();
  const inFlightRef = useRef(false);
  const statusRef = useRef<LeadFormStatus>('idle');
  const [status, setStatusState] = useState<LeadFormStatus>('idle');
  const setStatus = useCallback((next: LeadFormStatus) => {
    statusRef.current = next;
    setStatusState(next);
  }, []);

  const {
    register, handleSubmit, control, reset, setValue, setError, clearErrors, setFocus,
    formState: { errors, isSubmitted },
  } = useForm<LeadFormValues, unknown, Lead>({
    resolver: zodResolver(leadSchema),
    defaultValues: LEAD_FORM_DEFAULTS,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldFocusError: true,
  });

  // …applyIntent, effects, onValid as in Algorithms…

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void handleSubmit(onValid)(event);
  };
  // …
}
```

### Radio group through Controller

```tsx
<Controller
  control={control}
  name="interest"
  render={({ field }) => (
    <RadioGroup
      name={field.name}
      value={field.value}
      onValueChange={field.onChange}
      aria-labelledby="lead-interest-legend"
      className="grid gap-3 sm:grid-cols-3"
    >
      {content.leadForm.interestOptions.map((option) => (
        <div key={option.value} className="flex items-center gap-3">
          <RadioGroupItem id={`lead-interest-${option.value}`} value={option.value} />
          <Label htmlFor={`lead-interest-${option.value}`} className="text-body font-normal">
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  )}
/>
```

Do not pass `field.ref` anywhere: Radix root is a `div` and cannot take focus.

### Component test file header (both component test files)

```tsx
// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { LeadForm } from '@/components/lead-form';
import { requestLeadIntent, takePendingLeadIntent } from '@/lib/lead-intent';
import { submitLead, type SubmitLeadResult } from '@/lib/submit-lead';

vi.mock('@/lib/submit-lead', () => ({ submitLead: vi.fn() }));
vi.mock('sonner', () => ({ toast: { error: vi.fn() } }));

// Radix RadioGroup measures itself with ResizeObserver, которого нет в jsdom.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

afterEach(() => {
  cleanup();
  takePendingLeadIntent(); // не даём отложенному намерению протечь в следующий тест
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Имя'), 'Аня');
  await user.type(screen.getByLabelText('Телефон'), '29 123-45-67');
}
```

Import only what the file uses (unused imports fail `pnpm lint --max-warnings 0`). Typical calls:
- in-flight request: `const d = Promise.withResolvers<SubmitLeadResult>(); vi.mocked(submitLead).mockReturnValue(d.promise);` … `await act(async () => { d.resolve({ kind: 'ok' }); });`
- fixed result: `vi.mocked(submitLead).mockResolvedValue({ kind: 'failed', reason: 'network' });`
- intent: `act(() => { requestLeadIntent({ interest: 'order', productId: 'colombia' }); });`
- radio state: `screen.getByRole('radio', { name: 'Разовый заказ' }).getAttribute('aria-checked') === 'true'`
- arrow key in Radix (jsdom needs the key held): `screen.getByRole('radio', { name: 'Разовый заказ' }).focus(); await user.keyboard('{ArrowDown>}'); await waitFor(() => expect(screen.getByRole('radio', { name: 'Вопрос' }).getAttribute('aria-checked')).toBe('true')); await user.keyboard('{/ArrowDown}');`
- prerender check: `import { renderToStaticMarkup } from 'react-dom/server'; const html = renderToStaticMarkup(<LeadForm />); expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled=""/);`

### submitLead test patterns (Node environment)

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Lead } from '@/lib/lead-schema';
import { SUBMIT_TIMEOUT_MS, submitLead } from '@/lib/submit-lead';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const lead: Lead = { name: 'Аня', phone: '+375291234567', interest: 'order', comment: '' };

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

// timeout: fetch that never answers but rejects on abort
const hangingFetch = vi.fn((...args: Parameters<typeof fetch>) => {
  const { promise, reject } = Promise.withResolvers<Response>();
  args[1]?.signal?.addEventListener('abort', () =>
    reject(new DOMException('The operation was aborted.', 'AbortError')),
  );
  return promise;
});
// vi.useFakeTimers(); vi.stubGlobal('fetch', hangingFetch);
// const pending = submitLead(lead); await vi.advanceTimersByTimeAsync(SUBMIT_TIMEOUT_MS);
// expect(await pending).toEqual({ kind: 'failed', reason: 'timeout' }); expect(vi.getTimerCount()).toBe(0);
```

Reference both parameters of a `vi.fn` implementation or omit them (`@typescript-eslint/no-unused-vars` warns on `_`-prefixed parameters too). Read the call arguments with `vi.mocked(fetch).mock.calls[0]` or `hangingFetch.mock.calls[0]`.

### Existing code to imitate
- Client component with a lead intent: `src/components/lead-intent-link.tsx:1-30`.
- JSDoc style in Russian on exported functions: `src/lib/lead-intent.ts:16-44`, `src/lib/format.ts:1-14`.
- Content keys and `satisfies`: `src/data/content.ts:40-45`.
- Phone link: `src/components/sections/lead-section.tsx:32-37`.

## Conventions

- Files: kebab-case (`lead-form.tsx`, `submit-lead.ts`); tests next to the module as `<name>.test.ts(x)`; the second component test file is `lead-form.submit.test.tsx`. The `tests/` directory from the generic stack profile is NOT used: the project keeps tests next to sources.
- Imports through `@/…`; single quotes, semicolons, trailing commas, width 100 (`.prettierrc`). Format touched files with `pnpm exec prettier --write <files>`.
- Exported functions, types and the component get a JSDoc `/** … */` in Russian (project style); inline `//` comments only where the reason is not obvious.
- No `any`, no `@ts-ignore`, no `as unknown as`; narrow `unknown` with `typeof` / `Array.isArray` checks.
- Errors are not swallowed: `submitLead` converts every failure to a `failed` result by design; `LeadForm` shows every failure.
- Every test that checks a spec scenario has a marker line `// @scenario: <exact scenario name>` directly above `it(...)`. One `it` may cover one scenario; a scenario may be covered by several tests in different files.
- Tests assert the observable result named in the scenario's THEN (text, attribute, focus, call arguments), never only "does not throw". `.skip`, `.only`, `.todo` are forbidden.
- Lint must pass with zero warnings: `pnpm lint --max-warnings 0`.

## Don'ts

- Do not add dependencies other than those in Contracts / package.json; in particular no `libphonenumber-js`, input-mask libraries, `@testing-library/jest-dom`, `@vitejs/plugin-react`, `happy-dom`, `msw`.
- Do not modify `src/lib/lead-intent.ts`, `src/lib/get-products.ts`, `src/data/products.json`, `src/data/site.ts`, `src/components/ui/*`, `src/app/layout.tsx`, `next.config.ts`, `eslint.config.mjs`, `tsconfig.json`, `.env.example`, `src/components/product-card.tsx`, `src/components/sections/subscription.tsx`.
- In `src/components/sections/lead-section.tsx` change only the JSDoc line of `children`.
- Do not create `src/app/api/lead/route.ts` or any temporary API stub (task 06).
- Do not call `useEffect(() => setX(...))` for hydration or derived state; do not write `onSubmit={handleSubmit(onValid)}`; do not use `watch()` from `useForm` (`react-hooks/incompatible-library`) — use `useWatch`.
- Do not add `eslint-disable` comments or change lint rules.
- Do not use `AbortSignal.timeout`, `navigator.onLine`, `localStorage` or `sessionStorage`.
- Do not use `method`/`action` attributes on the form; do not render `<input type="hidden">` for `productId`.
- Do not show a success toast; only failures produce a toast.
- Do not use request-time APIs (`cookies()`, `headers()`, `new Date()`) anywhere in the route `/`.
- Do not reuse code from the deleted leftover files.

## Edge Cases

| Scenario (spec) | Handled in | Result |
|---|---|---|
| Initial form state | `lead-form.tsx` / `LEAD_FORM_DEFAULTS`, render | empty texts, «Разовый заказ» checked, button «Отправить заявку» |
| Labels focus their fields | `lead-form.tsx` / `Label htmlFor` + `Input id` | click on «Телефон» focuses `#lead-phone` (`type=tel`, `autocomplete=tel`, placeholder) |
| Radio group keyboard control | Radix `RadioGroup` in `lead-form.tsx` | ArrowDown checks and focuses «Вопрос» |
| Notations of one number | `phone.ts` / `normalizeBelarusPhone`; `lead-schema.ts` / `phone` | `+375291234567` |
| All operator codes | `phone.ts` / `normalizeBelarusPhone` step 8 | codes 25, 33, 44 normalized |
| Empty phone | `phone.ts` step 2 → `null`; `lead-schema.ts` phone step 1 | «Укажите телефон — по нему перезвонит менеджер» |
| Landline number | `phone.ts` step 8 | `null` → «Введите номер в формате +375 29 123-45-67» |
| Wrong digit count | `phone.ts` steps 6–7 | `null` → phoneInvalid |
| Foreign number | `phone.ts` step 6 | `null` → phoneInvalid |
| Forbidden characters | `phone.ts` steps 3–4, 6 | `null` → phoneInvalid |
| Valid number is reformatted | `phone.ts` / `formatBelarusPhone`; `lead-form.tsx` / `onPhoneBlur` | field shows `+375 29 123-45-67` |
| Invalid number is left as typed | `formatBelarusPhone` step 2; `onPhoneBlur` step 2 | value unchanged |
| Empty name | `lead-schema.ts` / `name` | nameRequired |
| Name of 60 characters | `lead-schema.ts` / `name` | accepted |
| Name of 61 characters | `lead-schema.ts` / `name` | nameTooLong |
| Comment of 500 characters | `lead-schema.ts` / `comment` | accepted |
| Comment of 501 characters | `lead-schema.ts` / `comment` | commentTooLong |
| Comment omitted | `lead-schema.ts` / `comment` `.default('')` | `comment === ''` |
| Unknown interest | `lead-schema.ts` / `interest` | interestInvalid on `interest` |
| Unknown product id | `lead-schema.ts` / `productId` | productInvalid on `productId` |
| Extra keys are dropped | `lead-schema.ts` / `z.object` strip | no extra key in output |
| Invalid phone is not sent | `useForm` resolver, `shouldFocusError` | `submitLead` not called, error under phone, `aria-invalid`, focus |
| Several invalid fields | resolver + `shouldFocusError` | two errors, focus on «Имя» |
| Error clears after correction | `reValidateMode: 'onChange'` | error paragraph removed, `aria-invalid` removed |
| Request body with product | `lead-schema.ts` output + `submit-lead.ts` step 3; `lead-form.tsx` passes `Lead` | exact JSON body with `productId: "colombia"` |
| Request body without product | same | body without `productId` key |
| Double click sends one request | `lead-form.tsx` / `onValid` steps 1–2 | one `submitLead` / `fetch` call |
| Button while sending | render (`disabled`, `content.leadForm.sending`) | disabled «Отправляем…» |
| Success response | `submit-lead.ts` / `interpretResponse` step 3 | `{ kind: 'ok' }` |
| Duplicate response | `interpretResponse` step 4 | `{ kind: 'duplicate' }` |
| Validation response | `interpretResponse` step 5 | `{ kind: 'invalid', fieldErrors: { phone: 'Номер не принят' } }` |
| Unexpected responses are failures | `interpretResponse` steps 1, 5.1, 5.3, 6; `submitLead` step 4 | `{ kind: 'failed', reason: 'server' }` |
| Success block | `onValid` `'ok'`; result block; focus effect step 1 | heading + text with formatted phone, heading focused |
| Duplicate block | `onValid` `'duplicate'`; result block; focus effect step 1 | duplicate texts, heading focused |
| Server rejects the phone | `onValid` `'invalid'`; focus effect step 3 | message under phone, phone focused, values kept |
| Server rejects the product | `onValid` `'invalid'`; product area; focus effect step 3 | message in product area, submit focused |
| Network failure | `submitLead` step 3; `onValid` `'failed'` | network text, toast, values kept |
| Request timeout | `submitLead` steps 1, 3; `onValid` `'failed'` | aborted at 15 000 ms, timeout text |
| Server failure | `interpretResponse` step 6; `onValid` `'failed'`; focus effect step 2 | server text, button enabled and focused |
| Retry after failure | form keeps values; `onValid` | second identical request, alert gone, success block |
| Alert is announced | render of the alert block | `role="alert"` |
| Start over | `startOver`; focus effect step 3 | initial form, «Имя» focused |
| Product intent | `applyIntent` step 4; product area | «Разовый заказ» checked, «Вы выбрали: Колумбия Уила» |
| Subscription intent | `applyIntent` step 4 | «Подписка» checked, «Вы выбрали: Подписка на кофе» |
| Intent keeps typed values | `applyIntent` step 4 (only `interest`, `productId` set) | name and phone unchanged |
| Intent sent before the form mounted | intent effect steps 1–2 | pending intent applied |
| Intent while sending | `applyIntent` step 2 | ignored |
| Intent after success | `applyIntent` step 3 | fresh form with drip-pack selected |
| Remove product | `removeProduct`; `lead-schema.ts` optional `productId` | badge gone, body without `productId` |
| Prerendered form | `useHydrated` server snapshot; `<noscript>`; `page.tsx` | HTML has labels, disabled submit, noscript text |
| Button enabled after hydration | `useHydrated` client snapshot | button enabled |
| Narrow screen | classes `grid`, `md:grid-cols-2`, `w-full`, `text-base` inputs | one column, full-width button, 16 px inputs |
| Wide screen | `max-w-2xl`, `md:grid-cols-2` | two columns, ≤ 672 px |
| Без формы (landing-page) | `lead-section.tsx` unchanged rendering | shell texts without placeholder |
| С формой (landing-page) | `lead-section.tsx` slot | form between steps and call line |
| Форма заявки на главной странице (landing-page) | `page.tsx` | `<form>` inside `#lead-form` in HTML |
| JavaScript отключён (landing-page) | unchanged sections | all content visible |
| Форма заявки без JavaScript (landing-page) | `useHydrated` + `<noscript>` | fields visible, button disabled, call text, no URL submission |
| Tests pass (dev-workflow) | `package.json` `test`, `vitest.config.mts` | exit code 0 |
| Failing test breaks the run (dev-workflow) | Vitest | non-zero exit, failing test named |
| Single test file (dev-workflow) | `vitest run <file>` | only that file runs |
