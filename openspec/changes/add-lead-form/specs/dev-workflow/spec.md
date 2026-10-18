## ADDED Requirements

### Requirement: Unit and component tests
The project SHALL provide the command `pnpm test`, which runs every `src/**/*.test.ts` and `src/**/*.test.tsx` file once without watch mode. The command MUST exit with code 0 when all tests pass and with a non-zero code when any test fails.

#### Scenario: Tests pass
- **WHEN** the developer runs `pnpm test` on a tree where all tests pass
- **THEN** the command prints the test summary and exits with code 0

#### Scenario: Failing test breaks the run
- **WHEN** an assertion in `src/lib/phone.test.ts` fails and the developer runs `pnpm test`
- **THEN** the command exits with a non-zero code and names the failing test

#### Scenario: Single test file
- **WHEN** the developer runs `pnpm test src/lib/phone.test.ts`
- **THEN** only the tests of that file run
