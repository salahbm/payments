# Overview

This project is developed by myself, to bootstap developing time and serve as a starting point for future projects. You can see the commit history to understand the development process and decisions. [https://github.com/salahbm/nextjs-starter.git](https://github.com/salahbm/nextjs-starter.git)
Also you can read more about this project on [docs/production-tooling.md](docs/production-tooling.md)

## Stack

- [Next.js 16](https://nextjs.org/) App Router
- [React 19](https://react.dev/)
- [Bun](https://bun.sh/) for package management and scripts
- [Tailwind CSS 4](https://tailwindcss.com/) with CSS-first configuration
- [TypeScript 6](https://www.typescriptlang.org/)
- [next-intl](https://next-intl.dev/) for locale routing and translations
- [t3-env](https://env.t3.gg/) for typed environment variables
- [TanStack Query](https://tanstack.com/query/latest) and [TanStack Table](https://tanstack.com/table/latest)
- [React Hook Form](https://react-hook-form.com/) and [Zod](https://zod.dev/)
- [Radix UI](https://www.radix-ui.com/) primitives with local UI wrappers
- [Zustand](https://github.com/pmndrs/zustand) for state management
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Nuqs](https://nuqs.47ng.com/) for URL state management
- [Sentry](https://sentry.io/) instrumentation
- [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/), [Ladle](https://ladle.dev/), and [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

## Getting Started

Install dependencies:

```bash
bun install
```

Start the development server:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). Routes are locale-prefixed, so the app will serve pages such as `/en` and `/kr`.

### How To Run

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

### Implemented Screens

- Login: `/en/sign-in`
- Dashboard overview: `/en`
- Transaction list: `/en/transactions`
- Transaction detail: `/en/transactions/:id`
- Preferences: `/en/preferences`

### Architecture

The app uses a BFF-style architecture:

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

### Main Libraries And Why

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

### Why BFF Instead Of Direct Backend Calls

Login goes through `POST /api/auth/sign-in` instead of calling the mock server directly from the browser.

Reasons:

- The access token is stored in an httpOnly cookie, so client JavaScript cannot read or leak it.
- Next.js route handlers can read that cookie server-side and attach `Authorization` when forwarding requests.
- The client has one same-origin API surface, which avoids exposing backend details across the UI.
- The BFF normalizes API inconsistencies. For example, the list endpoint accepts `env` as a query param, while detail expects `X-Environment`; the frontend still passes env consistently.
- This mirrors common enterprise admin patterns where web clients talk to a frontend-owned backend layer for auth, audit, policy, rate limiting, and API composition.

I still keep `agent.ts` because there are two useful clients:

- `app`: browser-safe same-origin client for `/api/*` BFF calls.
- `api`: server-side client used inside route handlers to call the mock backend.

### Environment State

The selected Sandbox/Production environment is stored in persisted Zustand state:

```text
src/store/environment-store.ts
localStorage key: environment-store
default: sandbox
```

Why store it this way:

- Environment is a global dashboard preference, not just a table filter.
- Header, sidebar, transaction list, dashboard charts, and detail pages need the same value.
- It should survive reloads because merchants expect their selected environment to remain stable.
- Keeping it out of the URL avoids noisy URLs and accidental sharing of a Production view link as if env were part of the resource identity.

Production switching shows a confirmation prompt because switching environments can change the meaning of every visible number and action.

Detail page behavior: if the user switches environment while viewing `/transactions/:id`, the app navigates back to `/transactions`. Transaction IDs are environment-specific in the mock data, so staying on the same detail ID after switching can produce invalid requests like `txn_live_*` in Sandbox.

### Near Real-Time Updates

The transaction list and detail page use TanStack Query polling:

```text
src/hooks/transactions/use-get-transactions.ts
src/hooks/transactions/use-get-transaction.ts
interval: 10 seconds
```

Why polling:

- The assignment asks for updates within tens of seconds; 10-second polling satisfies that requirement (I believe).
- The provided mock server exposes HTTP endpoints, not webhooks, SSE, or websocket streams.
- Webhooks are server-to-server notifications, so they do not directly update a browser tab without adding another push channel.
- SSE/websockets would be reasonable for a real payment console, but would add server changes and connection lifecycle work that are not requested in this assignment.
- Polling integrates cleanly with TanStack Query cache updates, stale state, loading flags, and background refetch behavior.

The UI exposes sync state with “syncing” and “last synced” text so the user can tell the list is refreshing without the page jumping around.

### API Spec Issues And Improvements

Things I noticed:

- Auth response should ideally include token expiry or session metadata. I used an 8-hour httpOnly cookie as an explicit local decision.
- Transaction list and detail use different environment conventions: list uses `env`, detail uses `X-Environment`. The BFF normalizes this (in real world I would suggest using the same mechanism across endpoints).
- Search, status filters, date filtering, and Excel export are not provided by the backend, so they are implemented client-side over loaded rows ( wireframe inlcuded some filterings, so I have implemented them on the frontend).
- Cursor pagination exists, but there is no total count or random access. The UI uses infinite scrolling rather than page numbers. ( Having pagination would be better for large datasets as Admins need to navigate to specific pages).
- Detail updates can fail after environment switching because IDs are environment-specific. I redirect back to the list on env switch from detail.

Suggested backend improvements:

- Use one environment mechanism across endpoints, preferably a validated query param or header consistently.
- Add server-side search/filter parameters for large datasets.
- Return `total_count` if the product needs exact count display.
- Return token expiry from login.
- Consider SSE or websocket feed endpoints for production-grade live dashboards.

### Decisions Beyond The Spec

- BFF route handlers: used to keep tokens httpOnly and normalize backend API shape.
- Persisted environment: selected env survives reloads and stays consistent across screens.
- Production confirmation: prevents accidental switch to live data.
- Infinite scroll: better fit for cursor APIs than page-number pagination.
- Detail polling: the detail screen also refreshes every 10 seconds so status/timeline changes appear while viewing it.
- Env switch from detail redirects to list: avoids showing an ID from the wrong environment.
- Global error handling: large auth/session errors can use alerts; normal form/API errors use toast feedback.
- Excel download: included to make transaction review more useful for an admin workflow.
- Dashboard charts: included to demonstrate aggregate transaction insight and frontend visualization skill.

### Testing

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

### If I Had More Time

- Add backend-supported filtering/search instead of client-side filtering over loaded rows.
- Add SSE/websocket support if the backend exposes a transaction event stream.
- Add audit log entries for refund/capture/void actions.
- Add more robust loading skeletons for each dashboard card.
- Add table state persistence for hidden columns and sorting.
- Add more E2E coverage for environment switching and transaction detail refresh.

### Intentionally Simplified Or Omitted

- Refund/capture/void actions are presented as mocked UI actions because the provided API does not expose mutation endpoints for them.
- Auth uses the assignment login endpoint and local user store; there is no `/me` endpoint or full session refresh flow.
- Polling is used instead of websockets/SSE to keep the solution aligned with the provided HTTP mock server.
- Client-side filters are scoped to currently loaded transactions because the API does not expose filter parameters.

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
