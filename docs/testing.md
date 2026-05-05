# Testing Guide

ShopSmart has three levels of testing:

| Layer | Tool | Location | Command |
|---|---|---|---|
| Unit + Integration (server) | Jest + Supertest | `server/server.test.js` | `pnpm -C server test` |
| Unit + Component (client) | Vitest + Testing Library | `client/src/**/*.test.*` | `pnpm -C client test` |
| End-to-End | Playwright | `e2e/` | `npx playwright test` |

Run all tests from the repo root:

```bash
pnpm run test
```

---

## Server Tests (Jest + Supertest)

File: `server/server.test.js`

Tests the Express API using **Supertest** (makes real HTTP requests to the Express app without a live server port).

The server is exported via `module.exports = app` and imported by the test file. `NODE_ENV=test` prevents the server from actually listening on a port.

**What is tested:**
- `GET /api/health` → `200 { status: 'ok' }`
- `GET /api/products` → `200` with an array
- `GET /api/categories` → `200` with an array

### Running server tests

```bash
cd server

# Standard run
pnpm test

# With JUnit XML output (used in CI)
JEST_JUNIT_OUTPUT_FILE=./junit.xml pnpm test -- --ci --reporters=default --reporters=jest-junit
```

### CI database

CI creates a fresh SQLite database before each run:

```bash
DATABASE_URL=file:./prisma/ci.db pnpm prisma migrate deploy
DATABASE_URL=file:./prisma/ci.db pnpm prisma db seed
```

Tests then run with `DATABASE_URL=file:./prisma/ci.db`.

---

## Client Tests (Vitest + Testing Library)

Files: `client/src/**/*.test.jsx`, `client/src/**/*.test.js`

Built with:
- **Vitest** — test runner (Vite-native, compatible with Jest API)
- **@testing-library/react** — component rendering
- **@testing-library/jest-dom** — additional matchers (`toBeInTheDocument`, etc.)
- **MSW (Mock Service Worker)** — API mocking (mocks in `client/src/mocks/`)
- **jsdom** — browser DOM simulation in Node.js

### Running client tests

```bash
cd client

# Watch mode (development)
pnpm test

# Single run (CI)
pnpm test -- --run

# With JUnit output (CI)
pnpm test -- --run --reporter=junit --outputFile=./junit.xml
```

---

## End-to-End Tests (Playwright)

Files: `e2e/shopsmart.spec.js`, `e2e/e2e.spec.js`

Playwright spins up both the backend and frontend automatically before running tests, using a dedicated SQLite database.

### Configuration (`playwright.config.cjs`)

| Setting | Value |
|---|---|
| Test directory | `./e2e` |
| Backend URL | `http://127.0.0.1:5001/api/health` |
| Frontend URL | `http://127.0.0.1:5173` |
| E2E database | `server/prisma/test-e2e.db` (freshly created per run) |
| Retries (CI) | 1 |
| Workers (CI) | 1 (serial) |
| Traces | On first retry |

The `webServer` configuration automatically:
1. Resets and re-seeds the E2E database
2. Starts the Express server
3. Starts the Vite dev server
4. Waits for both to be healthy before running tests

### Running E2E tests

```bash
# Make sure pnpm deps are installed first
pnpm run setup

# Run E2E tests
npx playwright test

# With UI mode (interactive)
npx playwright test --ui

# View trace on failure
npx playwright show-trace
```

### What is tested (`shopsmart.spec.js`)

| Test | Description |
|---|---|
| Load products and add to cart | Visits `/`, checks page title contains "ShopSmart", waits for product cards to be visible, clicks "Add to Cart" on the first card, asserts "Added to Cart" toast appears |
| Health check | Visits `/api/health`, asserts the response body contains `ok` |

---

## Test Architecture Summary

```
Unit/Integration (server)
  Jest
   └─ Supertest → Express app (in-process, no port)
   └─ Prisma → SQLite ci.db (seeded)

Component Tests (client)
  Vitest + jsdom
   └─ @testing-library/react
   └─ MSW → mocked /api/* responses

E2E Tests
  Playwright (Chromium)
   └─ Full browser → Vite dev server (:5173)
   └─              → Express server (:5001)
   └─              → SQLite test-e2e.db (seeded)
```

---

## Linting

```bash
# Lint both client and server
pnpm run lint

# Lint client only
pnpm -C client run lint

# Lint server only
pnpm -C server run lint
```

Zero ESLint warnings are allowed (`--max-warnings 0`). Both client and server use Prettier for formatting, enforced in CI via `prettier --check`.

---

## Code Formatting

```bash
# Format all files
pnpm run format

# Check formatting without writing (used in reviews)
pnpm run format:check
```

Prettier config is in `.prettierrc` at the repo root.
