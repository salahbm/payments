# Payment Dashboard Submission

This repository is my implementation of the merchant payment-history
assignment. It covers login, Sandbox/Production switching, transaction
list/detail views, and near real-time refresh against the provided mock server.

## How To Run

Run the provided mock server first:

```bash
cd mock-server
npm install
node server.js
```

The mock server should be available at:

```text
http://localhost:4000
```

Run this app in another terminal:

```bash
bun install
cp .env.example .env.local
```

Set the mock API URL:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000 bun run dev
```

Open:

```text
http://localhost:3000/en/sign-in
```

Test account:

```text
demo@hopae.com / password123
```

Useful scripts:

```bash
bun run type-check
bun run lint:check
bun run test
bun run test:e2e
```

## Implemented Screens

- Login: `/en/sign-in`
- Dashboard overview: `/en`
- Transaction list: `/en/transactions`
- Transaction detail: `/en/transactions/:id`
- Preferences: `/en/preferences`

## Architecture

The app uses a small BFF layer through Next.js route handlers:

```text
Browser UI
  -> Next.js route handlers under /api/*
    -> Hopae mock server at NEXT_PUBLIC_API_BASE_URL
```

Important folders:

```text
src/app/                 Thin App Router pages and BFF route handlers
src/views/               Screen-level UI and business presentation
src/hooks/transactions/  TanStack Query hooks for list/detail data
src/hooks/auth/          Sign-in/sign-out mutations and validation
src/store/               Persisted client stores for user/env/sidebar state
src/lib/agent.ts         Shared fetch wrapper for app and backend agents
src/messages/            next-intl translation dictionaries
tests/e2e/               Playwright browser tests
```

## Main Libraries And Why

- Next.js App Router: gives route handlers for BFF endpoints, localized routing, SSR-ready page structure, and a clean protected-route proxy.
- React + TypeScript: strong typing for transaction, auth, and API contracts while keeping UI composition straightforward.
- TanStack Query: request caching, loading/error states, query invalidation, infinite cursor fetching, and polling for near real-time updates.
- TanStack Table: column definitions, sorting, visibility controls, and reusable table state.
- Zustand: small global stores without provider nesting. Used for logged-in UI state and selected environment.
- Zustand persist: keeps the environment and user UI state stable across reloads.
- React Hook Form + Zod: form state and runtime validation for sign-in and filters.
- next-intl: locale-prefixed routes and translated UI strings.
- shadcn/Radix primitives: accessible UI building blocks while keeping styling local and customizable.
- Sonner + custom alert provider: non-blocking toast feedback for normal errors, blocking alerts for high-impact flows such as Production switching.
- AG Charts: dashboard charting to demonstrate frontend data visualization with real transaction-derived data.
- Vitest + React Testing Library: fast unit/component tests.
- Playwright: browser-level sign-in and navigation coverage.

## Why BFF Instead Of Direct Backend Calls

Login goes through `POST /api/auth/sign-in` instead of calling the mock server directly from the browser.

I chose this mainly to keep the token in an httpOnly cookie. The browser never
needs to read the token directly, while the route handlers can attach
`Authorization` when they forward requests to the mock server. It also gives the
client one same-origin API surface and lets the BFF smooth over small backend
inconsistencies, like `env` being a query param on the list endpoint but
`X-Environment` on the detail endpoint.

I still keep `agent.ts` because there are two useful clients:

- `app`: browser-safe same-origin client for `/api/*` BFF calls.
- `api`: server-side client used inside route handlers to call the mock backend.

## Environment State

The selected Sandbox/Production environment lives in persisted Zustand state:

```text
src/store/environment-store.ts
localStorage key: environment-store
default: sandbox
```

I treated environment as a dashboard-level preference, not just a table filter.
The header, list, detail page, and dashboard charts all need to agree on it, and
it should survive a reload so the user does not accidentally bounce back to
Sandbox or Production mid-workflow.

The tradeoff is that a URL-based env would make bookmarking and sharing a
specific environment view easier. I kept it out of the URL because the env
changes the meaning of the whole console, not only one route. Shared transaction
links stay cleaner, and the global switcher remains the source of truth.

Production switching asks for confirmation because every number and action
changes meaning in Production. On a transaction detail page, switching env sends
the user back to the list because transaction IDs are environment-specific in the
mock data.

Also, in the wireframe env-switch UI is placed on the header, so my the first intuation
was this is global setting, not per-page filter. That is the one of the reasons I
kept it out of the URL and used Zustand persist instead.

## Near Real-Time Updates

The transaction list and detail page use TanStack Query polling:

```text
src/hooks/transactions/use-get-transactions.ts
src/hooks/transactions/use-get-transaction.ts
interval: 10 seconds
```

I used polling because the mock server is HTTP-only and the requirement asks for
updates within tens of seconds. SSE or websockets would be a good next step for a
production console, but for this assignment a 10-second interval is enough and
works cleanly with TanStack Query’s cache and loading states.

The UI shows “syncing” and “last synced” text so the user can tell the table is
alive without the page interrupting them.

### Real-Time UX Behavior

After each successful poll, the table updates in place. New transactions from
the first page appear at the top, and pending rows update when their status
changes. I avoided forced scroll-to-top behavior because someone reviewing older
transactions should not lose their place just because the mock server added a new
row.

### Cache And Pagination Strategy

The list uses `useInfiniteQuery` with the current `{ environment, limit }` in
the query key. On each poll, TanStack Query refreshes the loaded pages and the UI
renders directly from that cache. I did not keep a second manual copy of the
transaction list.

There is one important limitation: the mock server prepends (adds to the beginning) new transactions, so
cursor windows can shift while a user has several pages loaded. Refetching loaded
pages keeps the visible data fresh enough for this assignment, but a production
version should use a stronger merge strategy: stable cursors, a transaction
version field, or an event stream that lets the client merge changes by ID.

### Detail Refresh Behavior

The detail page uses the same 10-second polling interval. If the transaction
moves from `pending` to `succeeded` or `failed`, the status badge, metadata, and
timeline refresh in place. The user stays on the record they are inspecting.

### Token Expiration Behavior

The mock login response does not include expiry metadata, so I used an 8-hour
httpOnly cookie as a local decision. If the cookie is gone, protected navigation
sends the user back to sign-in; API calls without a valid cookie fail through the
normal client-error path. In a real system I would prefer backend-provided expiry
plus a dedicated “session expired, please sign in again” flow.

## API Spec Issues And Improvements

Things I noticed:

- Auth response should ideally include token expiry or session metadata. I used an 8-hour httpOnly cookie as an explicit local decision.
- Transaction list and detail use different environment conventions: list uses `env`, detail uses `X-Environment`. The BFF normalizes this (in real world I would suggest using the same mechanism across endpoints).
- Search, status filters, date filtering, and Excel export are not provided by the backend, so they are implemented client-side over loaded rows.
- Cursor pagination exists, but there is no total count or random access. The UI uses infinite scrolling rather than page numbers; page-number pagination would be better if admins needed random access to specific result pages.
- Transactions do not expose a revision field. Because of that, the client cannot
  cheaply ask “what changed since the last sync” or confidently highlight changed
  rows. I kept the mock API shape as-is and let polling refresh the query cache.

Suggested backend improvements:

- Use one environment mechanism across endpoints, preferably a validated query param or header consistently.
- Add server-side search/filter parameters for large datasets.
- Return `total_count` if the product needs exact count display.
- Return token expiry from login.
- Add a transaction revision field so clients can diff changed rows accurately.
- Consider SSE or websocket feed endpoints for production-grade live dashboards.

## Decisions Beyond The Spec

- BFF route handlers: used to keep tokens httpOnly and normalize backend API shape.
- Persisted environment: selected env survives reloads and stays consistent across screens.
- Production confirmation: prevents accidental switch to live data.
- Infinite scroll: better fit for cursor APIs than page-number pagination.
- Detail polling: the detail screen also refreshes every 10 seconds so status/timeline changes appear while viewing it.
- Global error handling: large auth/session errors can use alerts; normal form/API errors use toast feedback.
- Excel download: included to make transaction review more useful for an admin workflow.
- Dashboard charts: included to demonstrate aggregate transaction insight and frontend visualization skill.

## Testing

Unit/component tests:

- Sign-in form submit and validation behavior.
- API error parsing.
- UI primitive button behavior.

E2E tests:

- Protected route redirects to sign-in.
- Successful sign-in navigates to dashboard.
- Failed sign-in shows clear feedback.
- Health endpoint smoke check.

Run:

```bash
bun run test
bun run test:e2e
```

## If I Had More Time

- Add backend-supported filtering/search instead of client-side filtering over loaded rows.
- Add SSE/websocket support if the backend exposes a transaction event stream.
- Add a “new transactions available” banner for users scrolled away from the top of the list.
- Add audit log entries for refund/capture/void actions.
- Add more robust loading skeletons for each dashboard card.
- Add table state persistence for hidden columns and sorting.
- Add more E2E coverage for environment switching and transaction detail refresh.

## Intentionally Simplified Or Omitted

- Refund/capture/void actions are presented as mocked UI actions because the provided API does not expose mutation endpoints for them.
- Auth uses the assignment login endpoint and local user store; there is no `/me` endpoint or full session refresh flow.
- Polling is used instead of websockets/SSE to keep the solution aligned with the provided HTTP mock server.
- Cache updates rely on TanStack Query refetching loaded pages instead of a custom event-stream merge layer.
- Client-side filters are scoped to currently loaded transactions because the
  API does not expose filter parameters.

---

## Starter Template Notes

This app was built from my Next.js starter. The starter includes production
tooling such as Sentry, Lighthouse CI, Docker, Ladle, Commitizen, and release
automation. Those tools are available in the repository, but the assignment work
is described in the sections above.

You can read more about the template tooling in [docs/production-tooling.md](docs/production-tooling.md).

## Scripts

```bash
bun run dev           # Start Next.js dev server
bun run build         # Create a production build
bun run build:analyze # Generate Turbopack bundle analysis files
bun run start         # Start the production server
bun run lint          # Run ESLint with auto-fix
bun run lint:check    # Run ESLint without auto-fix
bun run format        # Format files with Prettier
bun run format:check  # Check formatting
bun run test          # Run unit/component tests
bun run test:watch    # Run unit/component tests in watch mode
bun run test:e2e      # Run Playwright smoke tests
bun run test:e2e:ui   # Run Playwright UI mode
bun run ui            # Start Ladle for UI stories
bun run ui:build      # Build Ladle stories
bun run lhci          # Run Lighthouse CI against production server
bun run type-check    # Run TypeScript without emitting files
bun run pre-commit    # Run lint-staged tasks
```

Release helpers:

```bash
bun run commit
bun run release
bun run release:patch
bun run release:minor
bun run release:major
```

## Project Structure

```text
src/app/              App Router routes and route handlers
src/components/       Shared and feature-level React components
src/components/ui/    Local UI primitives
src/constants/        App routes, cookies, brand, fonts, and static constants
src/hooks/            Reusable React hooks
src/i18n/             next-intl routing and request config
src/lib/              Shared utilities and data helpers
src/messages/         Translation messages for en, ru, and kr
src/providers/        Root app providers
src/styles/           Tailwind CSS entrypoint and global styles
src/types/            Shared TypeScript types
src/env.ts            Typed environment schema
src/instrumentation.ts Sentry runtime instrumentation
src/proxy.ts          Next.js proxy for auth and locale routing
tests/e2e/            Playwright smoke tests
docs/                 Architecture and production notes
```

## Environment Variables

Environment variables are defined and validated in `src/env.ts` with `@t3-oss/env-nextjs`.

Copy `.env.example` when you need local runtime values:

```bash
cp .env.example .env.local
```

When adding a new variable:

1. Add it to `src/env.ts`.
2. Include it in `runtimeEnv` or `experimental__runtimeEnv`.
3. Import `env` from `@/env` instead of reading `process.env` directly.

`next.config.ts` imports `src/env.ts`, so environment validation runs during Next.js config loading and production builds.

Current env keys:

```text
NODE_ENV
TIMEOUT
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_API_BASE_URL
SENTRY_DSN
NEXT_PUBLIC_SENTRY_DSN
SENTRY_ORG
SENTRY_PROJECT
SENTRY_AUTH_TOKEN
```

## Styling

Tailwind CSS 4 is configured through `src/styles/globals.css`.

Important notes:

- `postcss.config.mjs` uses `@tailwindcss/postcss`.
- `.prettierrc` uses `tailwindStylesheet` and points to `src/styles/globals.css`.
- There is no `tailwind.config.js` or `tailwind.config.ts`; app-specific theme tokens and utilities live in CSS.
- `tw-animate-css` is imported from the global stylesheet.

## Testing

Unit and component tests use Vitest with React Testing Library.

```bash
bun run test
```

E2E smoke tests use Playwright. Install the Chromium browser once on a local machine:

```bash
bunx playwright install chromium
bun run test:e2e
```

UI primitive stories use Ladle:

```bash
bun run ui
```

Lighthouse CI audits the localized sign-in page against a production server:

```bash
bun run build
bun run lhci
```

Bundle analysis uses Next.js 16's Turbopack analyzer:

```bash
bun run build:analyze
```

The analysis output is written to `.next/diagnostics/analyze`.

## Internationalization

`next-intl` is configured in `src/i18n/routing.ts`.

Supported locales:

- `en`
- `kr`

Locale prefixes are always included in URLs, and the selected language is stored with the configured language cookie.

## Code Quality

This project uses:

- ESLint
- Prettier
- TypeScript strict mode
- Husky
- lint-staged
- commitlint
- Commitizen
- standard-version
- GitHub Actions CI
- Dependabot
- Dependency Review
- CodeQL

Use `bun run commit` for an interactive Conventional Commits flow.

## GitHub Automation

The repository includes:

- `.github/workflows/ci.yml`: format, lint, type-check, unit tests, build, Playwright, and Lighthouse
- `.github/workflows/codeql.yml`: scheduled and PR CodeQL analysis
- `.github/workflows/dependency-review.yml`: dependency review on pull requests
- `.github/workflows/preview.yml`: optional Vercel preview deployments when Vercel secrets are configured
- `.github/workflows/release.yml`: manual standard-version release workflow
- `.github/dependabot.yml`: weekly dependency and GitHub Actions updates

For Vercel preview deployments, configure these repository secrets:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

For Sentry release uploads, configure:

```text
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
```

## Observability and Health

- Sentry is initialized through `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, and `src/instrumentation.ts`.
- `/api/health` returns a simple JSON health response for runtime checks.
- `robots.txt` and `sitemap.xml` are generated through App Router metadata routes. -> Actually does not needed for admin dashboard as it is not public.
- Security headers are configured in `next.config.ts`.

## Documentation Files

- `MAKE.md`: build and development workflow notes
- `CONTRIBUTING.md`: contribution guidelines
- `docs/architecture.md`: architecture notes and runtime boundaries
- `docs/production-tooling.md`: explanation of production tooling choices
- `SECURITY.md`: security policy
- `LICENSE`: project license
- `VERSION`: current project version marker

## Deployment

Build the app before deploying:

```bash
bun run build
```

The project is compatible with Vercel and other Next.js hosting targets. See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for platform-specific details.

Docker support is included for non-Vercel deployments:

```bash
docker build -t nextjs-starter .
docker run -p 3000:3000 nextjs-starter
```
