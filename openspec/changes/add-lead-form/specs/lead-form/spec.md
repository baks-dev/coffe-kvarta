# Spec Delta

## Purpose

The lead form in the `#lead-form` section of the home page: it collects a name, a Belarusian mobile number, the visitor's interest and a comment, validates them before sending, sends exactly one request per submission to `POST /api/lead` and tells the visitor what happened and what to do next.

## ADDED Requirements

### Requirement: Form fields
The form SHALL contain, in this order: a text field labelled «Имя», a phone field labelled «Телефон» with the hint «Белорусский мобильный: +375 29 123-45-67, 8 029 123-45-67 или 29 123-45-67», a radio group with the legend «Что интересует» and the options «Подписка», «Разовый заказ», «Вопрос», a multi-line field labelled «Комментарий» with the hint «Необязательно. Например, удобное время для звонка.», and a submit button «Отправить заявку».

#### Scenario: Initial form state
- **WHEN** the home page is opened and no lead intent has been sent
- **THEN** «Имя», «Телефон» and «Комментарий» are empty, the radio «Разовый заказ» is checked, «Подписка» and «Вопрос» are not checked, and the submit button reads «Отправить заявку»

#### Scenario: Labels focus their fields
- **WHEN** the visitor clicks the label «Телефон»
- **THEN** focus moves to the phone input, whose `type` is `tel`, `autocomplete` is `tel` and `placeholder` is `+375 29 123-45-67`

#### Scenario: Radio group keyboard control
- **WHEN** focus is on the checked radio «Разовый заказ» and the visitor presses the Down arrow key
- **THEN** «Вопрос» becomes checked and focused

### Requirement: Accepted phone notations
The phone value SHALL be accepted when, after trimming surrounding whitespace, it contains only digits, spaces, `(`, `)`, `-` and at most one `+` as the first character, and its digits form a Belarusian mobile number with operator code 25, 29, 33 or 44 in one of the notations: `+375` + 9 digits, `375` + 9 digits, `80` + 9 digits, or 9 digits without prefix. An accepted value MUST be normalized to `+375` followed by 9 digits.

#### Scenario: Notations of one number
- **WHEN** the phone value is each of `+375 29 123-45-67`, `+375291234567`, `+375 (29) 123-45-67`, `375291234567`, `80291234567`, `8 029 123-45-67`, `8 (029) 123 45 67`, `29 123-45-67`, `291234567`, `  +375 29 123-45-67  `
- **THEN** each value is accepted and normalized to `+375291234567`

#### Scenario: All operator codes
- **WHEN** the phone value is `+375 25 765-43-21`, `+375 33 456-78-90` or `+375 44 999-99-99`
- **THEN** the values are normalized to `+375257654321`, `+375334567890` and `+375449999999` respectively

### Requirement: Rejected phone input
An empty or whitespace-only phone value SHALL be rejected with the message «Укажите телефон — по нему перезвонит менеджер». Any other value that does not satisfy «Accepted phone notations» MUST be rejected with the message «Введите номер в формате +375 29 123-45-67».

#### Scenario: Empty phone
- **WHEN** the phone value is an empty string or `   `
- **THEN** it is rejected with «Укажите телефон — по нему перезвонит менеджер»

#### Scenario: Landline number
- **WHEN** the phone value is `+375 17 123-45-67` or `8 017 123-45-67`
- **THEN** it is rejected with «Введите номер в формате +375 29 123-45-67»

#### Scenario: Wrong digit count
- **WHEN** the phone value is `+375 29 123-45-6`, `+375 29 123-45-678` or `0291234567`
- **THEN** each is rejected with «Введите номер в формате +375 29 123-45-67»

#### Scenario: Foreign number
- **WHEN** the phone value is `+7 900 123-45-67`
- **THEN** it is rejected with «Введите номер в формате +375 29 123-45-67»

#### Scenario: Forbidden characters
- **WHEN** the phone value is `29 123-45-6X`, `++375291234567`, `375+291234567` or `+80291234567`
- **THEN** each is rejected with «Введите номер в формате +375 29 123-45-67»

### Requirement: Phone reformatting on blur
When the phone field loses focus and its value is accepted, the form SHALL replace the value with the display format `+375 XX XXX-XX-XX`. A value that is not accepted MUST stay exactly as typed.

#### Scenario: Valid number is reformatted
- **WHEN** the visitor types `80291234567` into «Телефон» and moves focus to the next field
- **THEN** the field shows `+375 29 123-45-67`

#### Scenario: Invalid number is left as typed
- **WHEN** the visitor types `+375 17 1234567` into «Телефон» and moves focus to the next field
- **THEN** the field still shows `+375 17 1234567`

### Requirement: Name and comment rules
The name SHALL be trimmed and MUST contain 1 to 60 characters; otherwise it is rejected with «Напишите, как к вам обращаться» (empty) or «Имя не длиннее 60 символов» (too long). The comment SHALL be optional, trimmed, and MUST contain at most 500 characters; otherwise it is rejected with «Комментарий не длиннее 500 символов». A missing comment MUST become an empty string.

#### Scenario: Empty name
- **WHEN** the name value is an empty string or `   `
- **THEN** it is rejected with «Напишите, как к вам обращаться»

#### Scenario: Name of 60 characters
- **WHEN** the name value is 60 letters «А»
- **THEN** it is accepted unchanged

#### Scenario: Name of 61 characters
- **WHEN** the name value is 61 letters «А»
- **THEN** it is rejected with «Имя не длиннее 60 символов»

#### Scenario: Comment of 500 characters
- **WHEN** the comment value is 500 letters «к»
- **THEN** it is accepted unchanged

#### Scenario: Comment of 501 characters
- **WHEN** the comment value is 501 letters «к»
- **THEN** it is rejected with «Комментарий не длиннее 500 символов»

#### Scenario: Comment omitted
- **WHEN** a lead without a `comment` key is validated
- **THEN** it is accepted and its comment is an empty string

### Requirement: Interest and product rules
The interest SHALL be one of `subscription`, `order`, `question`; any other value MUST be rejected with «Выберите, что вас интересует». The product id SHALL be optional; when present it MUST be the id of a product from `src/data/products.json`, otherwise it is rejected with «Выбранный товар не найден». Keys other than `name`, `phone`, `interest`, `comment`, `productId` MUST be dropped.

#### Scenario: Unknown interest
- **WHEN** a lead with `interest` equal to `wholesale` is validated
- **THEN** it is rejected with «Выберите, что вас интересует» for the field `interest`

#### Scenario: Unknown product id
- **WHEN** a lead with `productId` equal to `latte` is validated
- **THEN** it is rejected with «Выбранный товар не найден» for the field `productId`

#### Scenario: Extra keys are dropped
- **WHEN** a valid lead with an extra key `isAdmin: true` is validated
- **THEN** the validated lead has no `isAdmin` key

### Requirement: Client-side validation before sending
The form SHALL validate all fields when the visitor submits it and MUST NOT send a request while any field is invalid. Each error MUST be shown under its field, the field MUST get `aria-invalid="true"` and an `aria-describedby` that references the error text, and focus MUST move to the first invalid field. After the first submit, an error MUST disappear as soon as the field value becomes valid.

#### Scenario: Invalid phone is not sent
- **WHEN** the visitor enters «Аня» and `+375 17 123-45-67` and presses «Отправить заявку»
- **THEN** no request is sent, «Введите номер в формате +375 29 123-45-67» is shown under «Телефон», the phone input has `aria-invalid="true"` and is focused

#### Scenario: Several invalid fields
- **WHEN** the visitor leaves «Имя» and «Телефон» empty and presses «Отправить заявку»
- **THEN** no request is sent, «Напишите, как к вам обращаться» and «Укажите телефон — по нему перезвонит менеджер» are shown under their fields, and focus is on «Имя»

#### Scenario: Error clears after correction
- **WHEN** the phone error is shown and the visitor changes the value to `+375 29 123-45-67`
- **THEN** the phone error text disappears and the input no longer has `aria-invalid="true"`

### Requirement: Lead request format
A valid submission SHALL send one `POST` request to `/api/lead` with the header `Content-Type: application/json` and a JSON body containing the validated lead: `name`, `phone` in the form `+375XXXXXXXXX`, `interest`, `comment`, and `productId` only when a product is selected.

#### Scenario: Request body with product
- **WHEN** the visitor chose «Колумбия Уила» via «Хочу», entered `  Аня  `, `8 029 123-45-67`, the comment `  Позвоните после 18:00 ` and submitted
- **THEN** the request body is `{"name":"Аня","phone":"+375291234567","interest":"order","comment":"Позвоните после 18:00","productId":"colombia"}`

#### Scenario: Request body without product
- **WHEN** the visitor entered «Аня», `29 123-45-67`, selected «Вопрос», left the comment empty and submitted
- **THEN** the request body is `{"name":"Аня","phone":"+375291234567","interest":"question","comment":""}` and has no `productId` key

### Requirement: Single request per submission
The form SHALL send at most one request at a time. From the moment a valid submission starts until its outcome is shown, the submit button MUST be disabled and read «Отправляем…», and further submit attempts (clicks, Enter) MUST NOT send requests.

#### Scenario: Double click sends one request
- **WHEN** the visitor fills the form validly and double-clicks «Отправить заявку» while the server has not answered
- **THEN** exactly one request is sent

#### Scenario: Button while sending
- **WHEN** a request is in flight
- **THEN** the submit button is disabled and reads «Отправляем…»; after the outcome is shown, no request is in flight

### Requirement: Server response contract
The form SHALL interpret the response of `POST /api/lead` only as follows: HTTP 200 with body `{"status":"ok"}` (extra keys allowed) is success; HTTP 200 with `{"status":"duplicate"}` is a duplicate; HTTP 400 with `{"status":"invalid","fieldErrors":{…}}` containing at least one string message for `name`, `phone`, `interest`, `comment` or `productId` is a server validation error. Every other response MUST be treated as a server failure.

#### Scenario: Success response
- **WHEN** the server answers HTTP 200 with `{"status":"ok","id":"lead_1"}`
- **THEN** the outcome is success

#### Scenario: Duplicate response
- **WHEN** the server answers HTTP 200 with `{"status":"duplicate"}`
- **THEN** the outcome is duplicate

#### Scenario: Validation response
- **WHEN** the server answers HTTP 400 with `{"status":"invalid","fieldErrors":{"phone":"Номер не принят"}}`
- **THEN** the outcome is a server validation error with the message «Номер не принят» for `phone`

#### Scenario: Unexpected responses are failures
- **WHEN** the server answers HTTP 500 with `{"status":"error"}`, HTTP 404 with an HTML body, HTTP 200 with `{"status":"queued"}`, HTTP 200 with a body that is not JSON, or HTTP 400 with `{"status":"invalid","fieldErrors":{"email":"x"}}`
- **THEN** each outcome is a server failure

### Requirement: Success outcome
On success the form SHALL be replaced by a block with the heading «Спасибо, заявка у нас» and the text «Менеджер перезвонит на номер +375 XX XXX-XX-XX в рабочее время: пн–пт 8:00–20:00, сб–вс 10:00–18:00.» with the submitted number, plus the button «Отправить ещё одну заявку». Focus MUST move to the heading.

#### Scenario: Success block
- **WHEN** a lead with phone `80291234567` is sent and the server answers with success
- **THEN** the block shows «Спасибо, заявка у нас» and «Менеджер перезвонит на номер +375 29 123-45-67 в рабочее время: пн–пт 8:00–20:00, сб–вс 10:00–18:00.», the heading is focused, and the form fields are no longer shown

### Requirement: Duplicate outcome
On a duplicate response the form SHALL be replaced by a block with the heading «Мы уже получили вашу заявку», the text «Заявка с номера +375 XX XXX-XX-XX пришла меньше 10 минут назад, повторно отправлять не нужно. Менеджер перезвонит в рабочее время.» and the button «Отправить ещё одну заявку». Focus MUST move to the heading.

#### Scenario: Duplicate block
- **WHEN** a lead with phone `+375291234567` is sent and the server answers with duplicate
- **THEN** the block shows «Мы уже получили вашу заявку» and «Заявка с номера +375 29 123-45-67 пришла меньше 10 минут назад, повторно отправлять не нужно. Менеджер перезвонит в рабочее время.», and the heading is focused

### Requirement: Server validation errors
On a server validation error the form SHALL stay editable with all values kept, show each server message under its field as for client-side errors, and enable the submit button. Focus MUST move to the first of «Имя», «Телефон», «Комментарий» that has an error; when none of them has one, focus MUST move to the submit button. A `productId` message MUST be shown in the product area above the fields.

#### Scenario: Server rejects the phone
- **WHEN** the server answers HTTP 400 with `{"status":"invalid","fieldErrors":{"phone":"Номер не принят"}}`
- **THEN** «Номер не принят» is shown under «Телефон», the phone input is focused, all entered values are kept and the button reads «Отправить заявку»

#### Scenario: Server rejects the product
- **WHEN** the server answers HTTP 400 with `{"status":"invalid","fieldErrors":{"productId":"Выбранный товар не найден"}}`
- **THEN** «Выбранный товар не найден» is shown in the product area and the submit button is focused

### Requirement: Submission failure
On a network error, no response within 15 seconds (the request is aborted), or a server failure, the form SHALL keep all values, enable the submit button, focus it, show a toast «Не удалось отправить заявку» and an alert block above the button with the title «Не удалось отправить заявку», the reason text and the line «Или позвоните: +375 (29) 123-45-67 — примем заявку по телефону.», where the number is a `tel:+375291234567` link.

#### Scenario: Network failure
- **WHEN** the request fails because the device is offline
- **THEN** the alert shows «Похоже, пропал интернет. Проверьте подключение и отправьте заявку ещё раз.», the toast «Не удалось отправить заявку» appears, and «Имя», «Телефон», «Что интересует» and «Комментарий» keep their values

#### Scenario: Request timeout
- **WHEN** the server does not answer within 15 000 ms
- **THEN** the request is aborted and the alert shows «Сервер не ответил за 15 секунд. Отправьте заявку ещё раз.»

#### Scenario: Server failure
- **WHEN** the server answers HTTP 500
- **THEN** the alert shows «На нашей стороне что-то пошло не так. Отправьте заявку ещё раз.», and the submit button is enabled and focused

#### Scenario: Retry after failure
- **WHEN** a submission failed and the visitor presses «Отправить заявку» again and the server answers with success
- **THEN** a second request with the same body is sent, the alert disappears and the success block is shown

#### Scenario: Alert is announced
- **WHEN** the failure alert appears
- **THEN** its container has `role="alert"`

### Requirement: New lead after an outcome
The button «Отправить ещё одну заявку» SHALL show the form again with empty «Имя», «Телефон», «Комментарий», «Разовый заказ» checked and no selected product, and MUST move focus to «Имя».

#### Scenario: Start over
- **WHEN** the success block is shown and the visitor presses «Отправить ещё одну заявку»
- **THEN** the form is shown in its initial state and «Имя» is focused

### Requirement: Prefill from lead intent
On a lead intent the form SHALL check the intent's interest and select its product, keeping the typed name, phone and comment. A selected product MUST be shown as «Вы выбрали: <product name>» with a button «Убрать» (accessible name «Убрать выбор: <product name>») that clears the product. An intent sent before the form subscribed MUST be applied once the form mounts. An intent MUST be ignored while a request is in flight; after a success or duplicate outcome it MUST open the form in its initial state with the intent applied.

#### Scenario: Product intent
- **WHEN** the visitor presses «Хочу» on «Колумбия Уила»
- **THEN** «Разовый заказ» is checked and «Вы выбрали: Колумбия Уила» is shown

#### Scenario: Subscription intent
- **WHEN** the visitor presses the subscription CTA, which sends `{ interest: 'subscription', productId: 'subscription' }`
- **THEN** «Подписка» is checked and «Вы выбрали: Подписка на кофе» is shown

#### Scenario: Intent keeps typed values
- **WHEN** the visitor typed «Аня» and `29 123-45-67`, then pressed «Хочу» on «Бразилия Серрадо»
- **THEN** «Имя» is «Аня», «Телефон» is `29 123-45-67` and «Вы выбрали: Бразилия Серрадо» is shown

#### Scenario: Intent sent before the form mounted
- **WHEN** the intent `{ interest: 'order', productId: 'ethiopia' }` was sent while no form was mounted, and then the form mounts
- **THEN** «Разовый заказ» is checked and «Вы выбрали: Эфиопия Иргачеффе» is shown

#### Scenario: Intent while sending
- **WHEN** a request is in flight and the intent `{ interest: 'subscription', productId: 'subscription' }` arrives
- **THEN** the intent is ignored and the radio and product selection stay unchanged

#### Scenario: Intent after success
- **WHEN** the success block is shown and the intent `{ interest: 'order', productId: 'drip-pack' }` arrives
- **THEN** the form is shown with empty «Имя», «Телефон», «Комментарий», «Разовый заказ» checked and «Вы выбрали: Дрип-пакеты ассорти»

#### Scenario: Remove product
- **WHEN** «Вы выбрали: Колумбия Уила» is shown and the visitor presses «Убрать»
- **THEN** the badge disappears and the next request body has no `productId` key

### Requirement: Form before client code runs
The form markup SHALL be part of the prerendered HTML of `/`. Until the client code has run, the submit button MUST be disabled so the browser never submits the form natively. A `<noscript>` element MUST show «Чтобы отправить заявку, включите JavaScript или позвоните нам: +375 (29) 123-45-67.» with the number as a `tel:+375291234567` link.

#### Scenario: Prerendered form
- **WHEN** `pnpm build` and `pnpm start` are run and the HTML of `/` is fetched with `curl`
- **THEN** the HTML contains the labels «Имя», «Телефон», «Что интересует», «Комментарий», a `<button type="submit"` with the `disabled` attribute and the `<noscript>` text «Чтобы отправить заявку, включите JavaScript или позвоните нам:»

#### Scenario: Button enabled after hydration
- **WHEN** the page is opened in a browser with JavaScript enabled and the client code has run
- **THEN** the button «Отправить заявку» is enabled

### Requirement: Form layout
The form SHALL be at most 672 px wide inside the section. Below 768 px viewport width all fields MUST be in one column and the submit button MUST span the full form width; from 768 px «Имя» and «Телефон» MUST be side by side. Field text MUST be at least 16 px.

#### Scenario: Narrow screen
- **WHEN** the page is opened at 360 px width
- **THEN** «Имя» and «Телефон» are stacked, the submit button is as wide as the form, input `font-size` is at least 16 px and `document.documentElement.scrollWidth === document.documentElement.clientWidth` is `true`

#### Scenario: Wide screen
- **WHEN** the page is opened at 1440 px width
- **THEN** «Имя» and «Телефон» are on one row and the form is no wider than 672 px
