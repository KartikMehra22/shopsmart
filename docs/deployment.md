# Deployment Guide

ShopSmart supports three deployment targets:

| Target | When to use |
|---|---|
| **Local Docker** | Full-stack testing that mirrors production |
| **Render.com** | Quick cloud deployment, no AWS required |
| **AWS ECS Fargate** | Production-grade cloud deployment via CI/CD |

---

## 1. Local Docker (Development)

Uses `docker-compose.dev.yml`, which builds both client and server images locally and exposes them on separate ports.

```bash
# Build images
pnpm run docker:build

# Start stack
pnpm run docker:up

# View logs
pnpm run docker:logs

# Stop stack
pnpm run docker:down
```

| Service | URL |
|---|---|
| React SPA | http://localhost:3000 |
| Express API | http://localhost:5001 |

---

## 2. Production Docker

Uses `docker-compose.yml`. Both services pull from a built image and run with `NODE_ENV=production`. The client is served as static files embedded in the Express server's `public/` directory.

```bash
docker compose up -d
```

The production Dockerfile is a **multi-stage build**:

| Stage | Base Image | Purpose |
|---|---|---|
| `client-build` | `node:20-alpine` | Builds the React/Vite bundle (`client/dist`) |
| `server-build` | `node:20-alpine` | Installs server dependencies and generates Prisma client |
| `runner` | `node:20-alpine` | Final image: merges client build into server's `public/`, runs as non-root `app` user |

The container:
- Runs as a **non-root user** (`app`)
- Exposes port `5001`
- Includes a `HEALTHCHECK` polling `/api/health` every 30 seconds
- Runs `prisma migrate deploy` before starting the server

---

## 3. Render.com

`render.yaml` defines two Render services:

### Backend (Web Service)

```yaml
type: web
name: shopsmart-backend
buildCommand: cd server && pnpm install && pnpm run build
startCommand: cd server && npx prisma migrate deploy && pnpm start
envVars:
  - key: PORT
    value: 10000
```

### Frontend (Static Site)

```yaml
type: static
name: shopsmart-frontend
buildCommand: cd client && pnpm install && pnpm run build
staticPublishPath: client/dist
envVars:
  - key: VITE_API_URL
    fromService:
      type: web
      name: shopsmart-backend
      property: url
```

`VITE_API_URL` is automatically set to the backend service's public URL by Render.

**To deploy:**
1. Connect your GitHub repo on [render.com](https://render.com).
2. Render detects `render.yaml` and creates both services automatically.
3. Set `DATABASE_URL` in the backend service's environment settings.

---

## 4. AWS ECS Fargate (via GitHub Actions)

The primary production path. After one-time setup, every push to `main` automatically runs tests, provisions/updates AWS infrastructure, builds a Docker image, pushes it to ECR, and deploys to ECS.

See [cicd.md](./cicd.md) for what the pipeline does internally, and [infrastructure.md](./infrastructure.md) for the Terraform resources.

### 4.1 What you need

| Requirement | Where to get it |
|-------------|-----------------|
| An AWS account | Either a real one OR an **AWS Academy** lab account (this project assumes Academy) |
| AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN`) | AWS Academy lab UI → "AWS Details" |
| A GitHub repository with this code pushed to it | github.com → New repo → push |
| AWS CLI installed locally (only for first-time `terraform apply`) | `brew install awscli` / [docs](https://aws.amazon.com/cli/) |
| Terraform 1.7.5+ installed locally (only for first time) | [terraform.io](https://developer.hashicorp.com/terraform/install) |

> **About AWS Academy:** It's a free AWS lab environment used in courses. Sessions expire every ~3 hours, after which you must refresh credentials. If you have a real AWS account, you can ignore the `AWS_SESSION_TOKEN` everywhere — but you'll also need to remove `-var=use_lab_role=true` from the workflow.

### 4.2 Get your AWS credentials

**AWS Academy:**
1. Open your AWS Academy lab.
2. Click **AWS Details** in the lab UI.
3. Click **Show** next to "AWS CLI".
4. Copy the three values: `aws_access_key_id`, `aws_secret_access_key`, `aws_session_token`.

**Real AWS account:**
- Create an IAM user with programmatic access and `AdministratorAccess` (for first deploy; tighten later).
- Use that access key + secret. There is no session token.

### 4.3 Add credentials as GitHub Actions secrets

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret** and add each of these:

| Secret name | Value |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | (from step 4.2) |
| `AWS_SECRET_ACCESS_KEY` | (from step 4.2) |
| `AWS_SESSION_TOKEN` | (from step 4.2 — Academy only; leave blank for real AWS) |

> Refresh these every time your AWS Academy session restarts. **Stale tokens are the #1 reason the pipeline fails.**

### 4.4 First-time Terraform run (creates the infra)

Before the pipeline can do anything, the AWS infrastructure has to exist. Run `terraform apply` once locally:

```bash
# 1. Export your AWS credentials (same values as the GitHub secrets)
export AWS_ACCESS_KEY_ID=...
export AWS_SECRET_ACCESS_KEY=...
export AWS_SESSION_TOKEN=...
export AWS_REGION=us-east-1

# 2. Apply Terraform
cd infra
terraform init
terraform apply -var=use_lab_role=true
# Type "yes" when prompted

# 3. Note the outputs (especially alb_dns_name)
terraform output
```

This creates: VPC security groups, ECR repo, S3 bucket, IAM roles, ECS cluster + service, ALB. Takes ~3 minutes. The first task will fail to start because no Docker image is in ECR yet — that's expected; the next step fixes it.

### 4.5 Trigger your first deploy

You have two options:

**Option A — Push code (simplest):**
```bash
git commit --allow-empty -m "trigger first deploy"
git push origin main
```

**Option B — Manual trigger:**
- GitHub UI: **Actions** tab → **CI/CD** workflow → **Run workflow** → pick `main` → **Run workflow**.
- Or via the `gh` CLI: `gh workflow run cicd.yml --ref main`.

### 4.6 Watch the pipeline run

Go to **Actions** tab → click the most recent run. You'll see four jobs run in order:

| Job | What it does | Duration |
|-----|--------------|----------|
| `test` | Lint, unit tests, integration tests | ~1 min |
| `terraform` | Plans & applies any infra changes (no-op on subsequent runs) | ~30 sec |
| `build_push` | Builds Docker image, pushes to ECR with `latest` and `<git-sha>` tags | ~1.5 min |
| `deploy` | Registers new ECS task definition, updates the service, runs smoke test | ~1.5 min |

Click any job to expand step-by-step logs.

### 4.7 Verify the deployment

After the pipeline shows green:

```bash
# Get the ALB URL
ALB=$(cd infra && terraform output -raw alb_dns_name)

# Health check
curl http://$ALB/api/health
# Expected: {"status":"ok",...}

# Open the app
open "http://$ALB"     # macOS
# or just paste http://<alb-dns> into your browser
```

If the health check fails or the page won't load, see [troubleshooting.md](./troubleshooting.md#alb-returns-503-service-temporarily-unavailable).

### 4.8 Subsequent deploys

Every push to `main` auto-deploys. No manual steps needed.

```bash
git add .
git commit -m "your change"
git push origin main
```

Watch the pipeline in the **Actions** tab.

### 4.9 When AWS Academy session expires (every ~3 hours)

You'll see `ExpiredTokenException` in the pipeline logs. To fix:

1. Open the AWS Academy lab → click **AWS Details** → copy the three fresh values.
2. Update the three GitHub Actions secrets (Settings → Secrets → Actions → click each → **Update**).
3. Re-run the failed workflow (Actions → click the run → **Re-run all jobs**).

For local Terraform runs: also re-export the three values in your shell.

### 4.10 Resetting / demo flow

Want to wipe ECR/S3/ECS data and rebuild everything live (great for a viva)? See [demo-reset.md](./demo-reset.md).

### 4.11 Tearing down everything

```bash
cd infra
terraform destroy -var=use_lab_role=true
```

Removes all AWS resources this project created. The Terraform state bucket itself is **not** destroyed (so you can re-apply later) — see [infrastructure.md](./infrastructure.md#destroying-infrastructure) for full details.

---

## Docker Image Architecture

```
FROM node:20-alpine (client-build)
  └─ pnpm install --frozen-lockfile
  └─ vite build → client/dist/

FROM node:20-alpine (server-build)
  └─ pnpm install --frozen-lockfile
  └─ prisma generate

FROM node:20-alpine (runner)
  └─ /app/server/        ← from server-build
  └─ /app/server/public/ ← from client-build (client/dist)
  └─ USER app (non-root)
  └─ EXPOSE 5001
  └─ HEALTHCHECK /api/health
  └─ CMD: prisma migrate deploy && pnpm start
```

---

## Environment Variables at Runtime

| Variable | Local Dev | Docker Dev | Docker Prod / ECS |
|---|---|---|---|
| `DATABASE_URL` | `.env` file | `.env` file via `env_file` | ECS task definition |
| `NODE_ENV` | `development` | Set in compose YAML | `production` |
| `PORT` | `5001` (hardcoded) | `5001` | `5001` |
| `VITE_API_URL` | `.env` file | `.env` file | Built into static bundle at build time |

> `VITE_API_URL` is a **build-time** variable, not a runtime one. It is baked into the JavaScript bundle during `vite build`. Changing it requires a rebuild.
