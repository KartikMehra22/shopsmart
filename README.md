# ShopSmart - E-commerce Platform

ShopSmart is a premium, minimalist e-commerce platform built with React, Express, and Prisma/SQLite. It features a cinematic dark theme and a robust CI/CD pipeline.

## Architecture & Design Decisions

### Frontend
- **React (Functional Components)**: Leveraging hooks for state and lifecycle management.
- **Vite**: Ultra-fast build tool and dev server.
- **Plain CSS**: Custom design system using CSS variables (tokens) for a premium dark-themed experience. No heavy frameworks like Tailwind, ensuring maximum performance and control.
- **MSW (Mock Service Worker)**: Used for network-level mocking during tests, allowing decoupled frontend development.

### Backend
- **Express.js**: Lightweight framework for the RESTful API.
- **Prisma & SQLite**: Prisma is used as the ORM to interact with a SQLite database, providing type-safety and easy migrations.
- **Jest & Supertest**: Used for robust API integration testing.

### DevOps & Infrastructure
- **GitHub Actions**: Automated CI/CD pipeline that runs linting, unit tests, and integration tests on every push and PR.
- **AWS EC2**: The application is deployed automatically to an EC2 instance using SSH-based GitHub Actions.
- **Dependabot**: Configured for automated dependency security updates.

## Workflow
1. **Local Development**: Code changes are tested locally using Vitest and Jest.
2. **Pull Request**: Triggers the CI pipeline to ensure code quality and prevent regressions.
3. **Merging**: Merges to `main` trigger the Deployment workflow.
4. **Deployment**: Deploys the latest build to AWS EC2 and restarts the services.

## Challenges
- **Prisma 7.5 Migration**: Navigating the breaking changes in datasource configuration (moving from `schema.prisma` to `prisma.config`).
- **ESLint 9 Flat Config**: Migrating from the legacy `.eslintrc` to the new flat configuration format while maintaining compatibility with React plugins.

## How to Run

### Setup
```bash
git clone ...
cd shopsmart
./scripts/setup.sh
```

### Development
```bash
# Frontend
cd client && npm run dev
# Backend
cd server && npm run dev
```

### Testing
```bash
# Unit/Integration
npm test
# Linting
npm run lint
```
