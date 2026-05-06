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

This is the primary production deployment path. The CI/CD pipeline handles it automatically on every push to `main`.

See [cicd.md](./cicd.md) for the full pipeline walkthrough and [infrastructure.md](./infrastructure.md) for the Terraform setup.

**Manual one-time setup:**

1. Add AWS credentials as GitHub repository secrets:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_SESSION_TOKEN`
2. Push to `main` — the pipeline will provision infrastructure, build and push the Docker image, and deploy to ECS.

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
