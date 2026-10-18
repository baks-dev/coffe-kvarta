# Proposal

## Why

The landing page exists to collect leads, but the `#lead-form` section (`src/components/sections/lead-section.tsx`) renders only the steps and the phone line: `src/app/page.tsx` passes no form into its slot, so a visitor from an Instagram ad has no way to leave a request. The «Хочу» buttons and the subscription CTA already publish a lead intent through `src/lib/lead-intent.ts`, but nobody subscribes to it. The brief requires that an invalid Belarusian number is rejected with a clear hint, that a double click does not create a second lead, and that a failed submission is visible together with what to do next. Task 05 delivers the client side of that; tasks 06 (API), 07 (attribution) and 08 (Telegram) build on the schema and request contract fixed here.

## What Changes

- Add a lead form to the `#lead-form` section with the fields «Имя», «Телефон», «Что интересует» (radio group: «Подписка», «Разовый заказ», «Вопрос») and «Комментарий». «Имя» and «Телефон» are required, «Разовый заказ» is selected by default.
- Accept a Belarusian mobile number (operator codes 25, 29, 33, 44) in common notations (`+375 29 123-45-67`, `8 029 123-45-67`, `29 123-45-67` and others) and normalize it to `+375XXXXXXXXX`; reject landline, foreign, short, long and malformed numbers with the message «Введите номер в формате +375 29 123-45-67». A permanent hint under the field lists accepted notations; a valid number is reformatted to `+375 29 123-45-67` when the field loses focus. No input mask.
- Validate name (required, up to 60 characters) and comment (optional, up to 500 characters) before sending; invalid input never reaches the network and errors appear under the fields.
- Add one validation schema shared by the client and the future `POST /api/lead` handler, and fix the request body and response contract of `POST /api/lead` that task 06 must implement.
- Send exactly one request per submission: a synchronous in-flight guard plus a disabled «Отправляем…» button.
- Show the outcome: a success block, a «we already have your lead» block for a duplicate response, server-side field errors under the fields, and for any failure (network, 15-second timeout, server error, unexpected body) an alert with a reason-specific text, the workshop phone and a toast «Не удалось отправить заявку», keeping everything the visitor typed.
- Prefill the form from lead intents: the product from «Хочу» or the subscription CTA selects the matching interest and is shown as a removable «Вы выбрали: …» badge; the product id is sent with the lead.
- Keep the page static: the form is in the prerendered HTML, its submit button is disabled until the client code runs, and a `<noscript>` message offers the phone number.
- Add a unit and component test stack (Vitest, Testing Library, jsdom) and the `pnpm test` command.

## Capabilities

### New Capabilities

- `lead-form`: the lead form on the home page — fields, phone and text validation, the request it sends to `POST /api/lead`, how it reports each server outcome, double-submit protection, prefill from lead intents and behaviour before client code runs.

### Modified Capabilities

- `landing-page`: «Оболочка секции заявки» now requires the home page to pass the lead form into the section slot; «Работа без JavaScript» now allows the lead form to run client code and describes what the form shows with JavaScript disabled.
- `dev-workflow`: adds a requirement for the `pnpm test` command that runs the unit and component tests once.

## Out of Scope

- The `POST /api/lead` route handler, storage, the 10-minute server-side deduplication, rate limiting and the honeypot field (task 06). Until task 06 lands, a submission from the running site ends in the failure state because the route returns 404.
- Ad attribution: UTM parameters, click ids, referrer and page URL (task 07).
- Telegram notification (task 08).
- Analytics goals for a submitted lead (task 09).
- Scroll and appear animations (task 10).
- End-to-end browser tests with Playwright and running tests in CI (tasks 11 and 12).
- An input mask for the phone field, landline numbers and non-Belarusian numbers.
- Client-side memory of previous submissions; duplicate detection is the server's job.
- Changes to the lead intent module `src/lib/lead-intent.ts`, the product cards and the subscription section.

## Impact

- Capabilities: `lead-form` (new), `landing-page` (modified), `dev-workflow` (modified).
- New files: `vitest.config.mts`, `src/lib/lead-schema.ts`, `src/lib/lead-schema.test.ts`, `src/lib/submit-lead.ts`, `src/lib/submit-lead.test.ts`, `src/components/lead-form.tsx`, `src/components/lead-form.test.tsx`, `src/components/lead-form.submit.test.tsx`. The working tree already contains untracked `src/lib/phone.ts`, `src/lib/phone.test.ts`, `vitest.config.ts` and empty `src/lib/lead-schema.ts`, `src/lib/lead-schema.test.ts`, `src/lib/submit-lead.ts`, `src/lib/submit-lead.test.ts` from an abandoned attempt; this change rewrites all of them from scratch.
- Rewritten from scratch: `src/lib/phone.ts`, `src/lib/phone.test.ts`. Deleted: `vitest.config.ts` (replaced by `vitest.config.mts`).
- Modified files: `package.json`, `pnpm-lock.yaml`, `src/data/content.ts` (new `leadForm` texts), `src/app/page.tsx` (form passed into `LeadSection`), `src/components/sections/lead-section.tsx` (JSDoc of `children` only), `README.md` (assumptions and the `test` command).
- Dependencies: runtime `react-hook-form` 7.90.0 and `@hookform/resolvers` 5.9.2; dev `jsdom` 30.1.3, `@testing-library/react` 16.3.3, `@testing-library/dom` 10.4.2, `@testing-library/user-event` 14.6.8; `vitest` 5.0.5 is kept.
- API contract: request and response format of `POST /api/lead`, binding for task 06.
- Single package (no workspaces), no build flags. Route `/` stays fully static (`cacheComponents: true` in `next.config.ts`).
