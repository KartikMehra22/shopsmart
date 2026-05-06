# Architecture

## Overview

ShopSmart is a full-stack e-commerce platform with a **React SPA** frontend and a **Node.js / Express** backend, backed by a **SQLite** database via **Prisma ORM**. The entire stack is containerised with Docker and deployed to **AWS ECS Fargate** via a fully automated GitHub Actions CI/CD pipeline.

```
Browser (React SPA)
        │  HTTP  (Vite proxy → /api/*)
        ▼
Express Server  (:5001)
        │  Prisma Client
        ▼
SQLite Database  (file:./prisma/*.db)
```

In production the React build is served as static files from the same Express process (copied into `/app/server/public` by the multi-stage Dockerfile). A single container image exposes port `5001` to the internet via an AWS Application Load Balancer.

---

## Monorepo Layout

```
shopsmart/
├── client/                   # React + Vite SPA
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── cart/         # CartDrawer, CartItem
│   │   │   ├── layout/       # Navbar, Footer, Layout
│   │   │   ├── product/      # ProductCard
│   │   │   └── ui/           # Design-system primitives
│   │   ├── context/          # CartContext, ToastContext, WishlistContext
│   │   ├── hooks/            # useBreakpoint, useDebounce, useFocusTrap
│   │   ├── pages/            # Route-level page components
│   │   └── mocks/            # MSW service-worker mocks (tests)
│   └── tests/
├── server/                   # Express + Prisma backend
│   ├── server.js             # App entry-point
│   ├── prisma/
│   │   ├── schema.prisma     # Data model
│   │   ├── seed.js           # Initial data
│   │   └── migrations/       # Prisma migration history
│   └── server.test.js        # Supertest integration tests
├── e2e/                      # Playwright end-to-end tests
│   └── shopsmart.spec.js
├── infra/                    # Terraform (AWS ECS Fargate)
│   └── main.tf / network.tf / ecs.tf / alb.tf …
├── docs/                     # This documentation
│   └── lab-notes/            # Course helpers (not production)
├── .github/workflows/
│   └── cicd.yml              # GitHub Actions CI/CD pipeline
├── Dockerfile                # Multi-stage production image
├── docker-compose.yml        # Production compose
├── docker-compose.dev.yml    # Development compose
├── render.yaml               # Render.com deployment config
└── package.json              # Root workspace scripts
```

---

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                      Client (React SPA)                      │
│                                                              │
│  ┌───────────┐   ┌───────────────┐   ┌──────────────────┐   │
│  │  Pages    │──▶│   Contexts    │──▶│  Components      │   │
│  │  Home     │   │  CartContext  │   │  Navbar          │   │
│  │  Product  │   │  ToastContext │   │  CartDrawer      │   │
│  │  Cart     │   │  Wishlist     │   │  ProductCard     │   │
│  │  Login …  │   └───────────────┘   │  UI primitives   │   │
│  └─────┬─────┘                       └──────────────────┘   │
│        │ fetch /api/*                                        │
└────────┼─────────────────────────────────────────────────────┘
         │ (Vite dev proxy / same-origin in prod)
┌────────▼──────────────────────┐
│   Express Server (:5001)      │
│  GET /api/health              │
│  GET /api/products            │
│  GET /api/categories          │
│  GET /api/users  (mock)       │
│  GET /api/cart   (mock)       │
│  GET /api/orders (mock)       │
│  GET /api/reviews(mock)       │
│  GET /api/admin  (403)        │
└────────┬──────────────────────┘
         │ Prisma Client
┌────────▼──────────────────────┐
│   SQLite / Prisma ORM         │
│   Product  │  Category        │
└───────────────────────────────┘
```

---

## AWS Production Architecture

```
Internet
   │
   ▼
Application Load Balancer  (port 80)
   │  security-group: ALB-SG (0.0.0.0/0 → 80)
   ▼
ECS Fargate Service  (desired 1 task)
   │  security-group: Service-SG (ALB-SG → 5001)
   │  network: default VPC, public subnets
   ▼
ECS Task (512 CPU / 1024 MB)
   └─ Container: shopsmart  (image from ECR)
        ├─ port 5001 (Express)
        ├─ DATABASE_URL: file:/app/server/prisma/prod.db
        └─ Logs → CloudWatch /ecs/shopsmart (7-day retention)

Supporting resources
  ECR Repository   – Docker image registry
  S3 Bucket        – Application assets bucket
  IAM Roles        – ECS execution + task roles (or LabRole)
  Terraform State  – S3 bucket
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Monorepo with `pnpm` workspaces | Single `pnpm install` bootstraps all packages; lock files ensure reproducible builds |
| SQLite via Prisma | Zero-config for local dev and AWS Academy labs; swap `provider` to `postgresql` for production |
| Multi-stage Dockerfile | Client static build merged into server's `public/` directory — single container, no nginx |
| React lazy + Suspense | Code-split every route; `PageLoader` spinner shown during chunk fetch |
| Context API (not Redux) | Cart, Toast, Wishlist state is shallow enough that context avoids extra dependencies |
| CSS Modules | Scoped styles per component, zero class-name collisions, no utility framework dependency |
| Terraform on ECS Fargate | Serverless containers reduce EC2 management overhead; fits AWS Academy lab constraints |
