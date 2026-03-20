# ShopSmart - E-commerce Platform

ShopSmart is a premium, minimalist e-commerce platform built with React, Express, and Prisma/SQLite. It features a cinematic dark theme and a robust CI/CD pipeline.

## Architecture & Design Decisions

### Infrastructure & Modules

- **Docker**: Full containerization with `Dockerfile`s for client/server and `docker-compose.yml`.
- **Github_to_AWS**: Static deployment modules for AWS EC2.
- **lab4**: Performance and health check scripts for EC2.
- **static**: Static landing page for GitHub Pages.
- **webhooks**: Demo webhook server for event-driven workflows.

## Directory Structure

```
.
├── .github/workflows/  # CI/CD Workflows
├── Github_to_AWS/      # Static HTML for deployment
├── lab4/               # Health check scripts
├── static/             # Static site
├── webhooks/           # Webhook demo server
├── shopsmart/ (client/server root)
├── e2e/                # Playwright E2E tests
└── docker-compose.yml
```

## How to Run

### Docker (Recommended)

```bash
npm run docker:build
npm run docker:up
```

### Local Development

```bash
npm run setup
npm run dev
```

### Testing

```bash
# Unit/Integration
npm test
# E2E
npx playwright test e2e/
# Linting
npm run lint
```
