# ShopSmart

A premium, minimalist e-commerce platform built with **React**, **Express**, and **Prisma/SQLite**, featuring a cinematic dark theme and a fully automated CI/CD pipeline deploying to **AWS ECS Fargate**.

---

## Quick Start

```bash
# 1. Install dependencies
pnpm run setup

# 2. Configure environment
cp .env.example .env
# Edit .env (see docs/environment-variables.md)

# 3. Prepare the database
cd server && pnpm prisma migrate deploy && pnpm prisma db seed && cd ..

# 4. Start development servers
pnpm run dev
```

| Service | URL |
|---|---|
| React SPA | http://localhost:5173 |
| Express API | http://localhost:5001 |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, CSS Modules |
| Backend | Node.js, Express 4, Prisma ORM |
| Database | SQLite (dev) / PostgreSQL-ready |
| Containerisation | Docker (multi-stage), Docker Compose |
| Infrastructure | Terraform, AWS ECS Fargate, ALB, ECR |
| CI/CD | GitHub Actions |
| Testing | Jest, Supertest, Vitest, Playwright |

---

## Documentation

Full documentation lives in [`docs/`](./docs/README.md):

| Doc | Description |
|---|---|
| [Architecture](./docs/architecture.md) | System design, component map, and AWS infrastructure diagram |
| [Getting Started](./docs/getting-started.md) | Prerequisites, setup, and dev workflow |
| [API Reference](./docs/api-reference.md) | All REST endpoints with request/response schemas |
| [Frontend](./docs/frontend.md) | Pages, components, contexts, and hooks |
| [Database](./docs/database.md) | Prisma schema, migrations, and seed data |
| [CI/CD](./docs/cicd.md) | GitHub Actions pipeline walkthrough |
| [Infrastructure](./docs/infrastructure.md) | Terraform AWS resources |
| [Deployment](./docs/deployment.md) | Docker, Render, and AWS deployment guides |
| [Testing](./docs/testing.md) | Unit, integration, and E2E testing |
| [Environment Variables](./docs/environment-variables.md) | All environment variables explained |

---

## Common Commands

```bash
pnpm run dev              # Start client + server
pnpm run test             # Run all tests
pnpm run lint             # Lint client + server
pnpm run docker:up        # Start Docker dev stack
npx playwright test       # Run E2E tests
```
