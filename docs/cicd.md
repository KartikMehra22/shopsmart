# CI/CD Pipeline

ShopSmart uses **GitHub Actions** for its fully automated CI/CD pipeline. The pipeline is defined in `.github/workflows/cicd.yml`.

---

## Trigger Conditions

| Event | Jobs that run |
|---|---|
| `push` to `main` | All jobs: `test → terraform → build_push → deploy` |
| `pull_request` to `main` | `test` + `terraform` (plan only, no apply) |
| `workflow_dispatch` | All jobs (manual trigger) |

Concurrency is controlled with `cancel-in-progress: true` so only the latest run on a branch is active at any time.

---

## Pipeline Overview

```
push to main
      │
      ▼
┌─────────────┐
│   test      │  Lint, unit tests, integration tests
└──────┬──────┘
       │ needs: test
       ▼
┌─────────────┐
│  terraform  │  fmt → init → validate → plan → (apply on push/main)
└──────┬──────┘
       │ needs: terraform  (only on push/main)
       ▼
┌─────────────┐
│ build_push  │  Docker build → tag → push to ECR
└──────┬──────┘
       │ needs: terraform + build_push  (only on push/main)
       ▼
┌─────────────┐
│   deploy    │  ECS task definition update → service rollout → smoke test
└─────────────┘
```

---

## Jobs

### `test`

Runs on every push and pull request.

**Steps:**

1. **Checkout** source code
2. **Setup Node 20** and **pnpm 9** with dependency caching
3. **Install dependencies** — root, `client/`, `server/`
4. **Lint client** — `pnpm -C client run lint` (zero warnings allowed)
5. **Lint server** — `pnpm -C server run lint` (zero warnings allowed)
6. **Generate Prisma client** — `pnpm prisma generate`
7. **Prepare CI database** — fresh SQLite at `server/prisma/ci.db`, runs migrations and seed
8. **Server tests** — Jest with `DATABASE_URL=file:./prisma/ci.db`, outputs JUnit XML
9. **Client tests** — Vitest with JUnit reporter
10. **Upload JUnit reports** — both `server/junit.xml` and `client/junit.xml` saved as workflow artifacts

**Environment variables used:**
- `DATABASE_URL=file:./prisma/ci.db`
- `JEST_JUNIT_OUTPUT_FILE=./junit.xml`

---

### `terraform`

Runs after `test` passes.

**Steps:**

1. **Checkout** source code
2. **Configure AWS credentials** from repository secrets
3. **Setup Terraform 1.7.5**
4. **`terraform fmt -check`** — fails if code is not formatted
5. **`terraform init`** — initialises the S3 backend
6. **`terraform validate`** — validates configuration
7. **`terraform plan`** — generates plan with `-var=use_lab_role=true`; uploads `tfplan` artifact
8. **`terraform apply`** *(push to main only)* — applies the plan non-interactively
9. **Capture outputs** *(push to main only)* — reads ECR URL, ECS cluster/service names, S3 bucket, ALB DNS from Terraform and exports them as job outputs

**AWS Secrets required** (in GitHub repository settings):

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_SESSION_TOKEN` | AWS Academy session token |

---

### `build_push`

Runs after `terraform` succeeds, only on `push` to `main`.

**Steps:**

1. **Checkout** source code
2. **Configure AWS credentials**
3. **Login to ECR** — `aws-actions/amazon-ecr-login@v2`
4. **Build, tag, and push Docker image** — two tags: `<git-sha>` and `latest`

The ECR repository URL is read from the `terraform` job output.

---

### `deploy`

Runs after `terraform` and `build_push` succeed, only on `push` to `main`.

**Steps:**

1. **Checkout** source code
2. **Configure AWS credentials**
3. **Fetch current ECS task definition** — downloads the current JSON using `aws ecs describe-task-definition`
4. **Render new task definition** — replaces the container image URI with the newly built SHA tag
5. **Deploy to ECS** — registers the new task definition and updates the service, waits for stability
6. **Smoke test** — polls `http://<ALB-DNS>/api/health` every 3 seconds for up to 90 seconds; exits 1 if never healthy

---

## Dependabot

`.github/dependabot.yml` is configured for weekly **npm** and **GitHub Actions** dependency updates. Pull requests are automatically opened for minor and patch updates.

> **Do not auto-merge these major version bumps** without manual testing:
> - Express 4 → 5
> - Prisma 6 → 7
> - Vite 5 → 8
> - React 18 → 19

Minor and patch updates (e.g. `cors`, `nodemon`, ESLint releases) are safe to merge.

---

## Adding a New Secret

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret**.
3. Reference it in the workflow as `${{ secrets.YOUR_SECRET_NAME }}`.
