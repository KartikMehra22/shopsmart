# ShopSmart

A full-stack e-commerce demo built with **React + Express + Prisma**, packaged with **Docker**, provisioned on **AWS ECS Fargate** via **Terraform**, and deployed by a **GitHub Actions** CI/CD pipeline.

It's an end-to-end DevOps reference project: write code → push to `main` → Docker image is built → AWS infrastructure is updated → app rolls out behind a load balancer.

---

## What's in this repo?

| Layer | Tech | Where |
|-------|------|-------|
| Frontend | React 18, Vite, CSS Modules | `client/` |
| Backend | Node.js, Express 4, Prisma ORM | `server/` |
| Database | SQLite (dev) — PostgreSQL-ready | `server/prisma/` |
| Containers | Docker (multi-stage), Docker Compose | `Dockerfile`, `docker-compose*.yml` |
| Infrastructure | Terraform → AWS ECS Fargate, ALB, ECR, S3, IAM | `infra/` |
| CI/CD | GitHub Actions | `.github/workflows/cicd.yml` |
| Tests | Jest, Supertest, Vitest, Playwright | `server/`, `client/`, `e2e/` |

---

## Run it locally in 60 seconds

> Need: Node 20+, pnpm 9+. (Optional: Docker, Terraform.)

```bash
# 1. Install everything
pnpm run setup

# 2. Configure environment
cp .env.example .env

# 3. Set up the database
cd server && pnpm prisma migrate deploy && pnpm prisma db seed && cd ..

# 4. Start dev servers
pnpm run dev
```

| Service | URL |
|---------|-----|
| React frontend | http://localhost:5173 |
| Express API | http://localhost:5001 |
| API health check | http://localhost:5001/api/health |

Full instructions and tool explanations: [docs/getting-started.md](./docs/getting-started.md).

---

## Deploy to AWS

After one-time setup, every push to `main` deploys automatically.

```bash
git push origin main
```

For the first deploy (and the AWS Academy / GitHub secrets walkthrough), see [docs/deployment.md §4](./docs/deployment.md#4-aws-ecs-fargate-via-github-actions).

---

## Live demo / viva

Want to reset AWS to an empty state and watch the pipeline rebuild everything in ~5 minutes?

```bash
bash scripts/aws-nuke-data.sh --yes
gh workflow run cicd.yml --ref main
```

Full guide: [docs/demo-reset.md](./docs/demo-reset.md). Conceptual cheat sheet (VPC, Docker, ECR, ECS, EKS, etc.): [docs/viva-cheatsheet.md](./docs/viva-cheatsheet.md).

---

## Documentation

The full technical docs live in [`docs/`](./docs/README.md), organized by what you're trying to do:

| Section | Docs |
|---------|------|
| **Start here** | [Getting Started](./docs/getting-started.md) · [Architecture](./docs/architecture.md) · [Environment Variables](./docs/environment-variables.md) |
| **Build & Deploy** | [Deployment](./docs/deployment.md) · [CI/CD Pipeline](./docs/cicd.md) · [Infrastructure (Terraform)](./docs/infrastructure.md) |
| **Demo & Viva** | [Demo & Reset Guide](./docs/demo-reset.md) · [Viva Cheat Sheet](./docs/viva-cheatsheet.md) |
| **Reference** | [API Reference](./docs/api-reference.md) · [Frontend](./docs/frontend.md) · [Database](./docs/database.md) · [Testing](./docs/testing.md) |
| **Stuck?** | [Troubleshooting](./docs/troubleshooting.md) |

---

## Common commands

```bash
pnpm run dev              # Start client + server locally
pnpm run test             # Run all unit + integration tests
pnpm run lint             # Lint client + server
pnpm run docker:up        # Run the dev stack in Docker
npx playwright test       # Run end-to-end tests
```

---

## New to DevOps?

If terms like "VPC", "container", "load balancer", or "CI/CD" feel unfamiliar, start with the [viva cheat sheet](./docs/viva-cheatsheet.md) — it's written for absolute beginners and covers every concept used here.
