# ShopSmart Documentation

Welcome. These docs are organized by **what you're trying to do**, not alphabetically. If you're new, follow the path top to bottom.

---

## 🚀 Start Here (read in this order)

| Doc | What you'll learn |
|-----|-------------------|
| [getting-started.md](./getting-started.md) | What tools you need, how to install them, how to run ShopSmart on your laptop |
| [architecture.md](./architecture.md) | How the project is structured: frontend, backend, database, infrastructure |
| [environment-variables.md](./environment-variables.md) | Every config value the app reads, and what to set it to |

---

## 📦 Build & Deploy

| Doc | What you'll learn |
|-----|-------------------|
| [deployment.md](./deployment.md) | All four deploy targets: local Docker, production Docker, Render.com, AWS ECS Fargate (full step-by-step) |
| [cicd.md](./cicd.md) | What the GitHub Actions pipeline does at every step, and how to trigger / debug it |
| [infrastructure.md](./infrastructure.md) | The Terraform code that builds the AWS environment (VPC, ECR, ECS, ALB, IAM) |

---

## 🎬 Demo & Viva

| Doc | What you'll learn |
|-----|-------------------|
| [demo-reset.md](./demo-reset.md) | How to reset AWS to an empty state and rebuild it live with the pipeline (~5 min). Perfect for a viva. |
| [viva-cheatsheet.md](./viva-cheatsheet.md) | Beginner-friendly explanations of VPC, EC2, Docker, ECR, ECS, EKS, Load Balancers, Vercel, Render — with a Q&A bank. |

---

## 🛠 Reference (look up as needed)

| Doc | What you'll find |
|-----|------------------|
| [api-reference.md](./api-reference.md) | Every REST endpoint, request body, response shape |
| [frontend.md](./frontend.md) | React pages, components, contexts, hooks |
| [database.md](./database.md) | Prisma schema, migrations, seed data |
| [testing.md](./testing.md) | Unit, integration, and Playwright E2E test setup |

---

## 🆘 Stuck?

| Doc | When to read |
|-----|--------------|
| [troubleshooting.md](./troubleshooting.md) | First place to look when something's broken — covers local dev, Docker, Terraform, the pipeline, and live AWS issues |

---

## Other

| Doc | Purpose |
|-----|---------|
| [lab-notes/](./lab-notes/README.md) | Course-specific helpers (not used in production) |

---

## New to DevOps in general?

If terms like "VPC", "container", "load balancer", or "CI/CD pipeline" are unclear, start with [viva-cheatsheet.md](./viva-cheatsheet.md). It's written for absolute beginners and covers every concept used in this project.
