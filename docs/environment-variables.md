# Environment Variables

All variables are defined in `.env` at the repo root. Copy `.env.example` to `.env` and fill in the values.

```bash
cp .env.example .env
```

> **Never commit `.env`** — it is listed in `.gitignore`.

---

## Reference

### Backend (Express / Node.js)

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ Yes | — | Prisma database connection string. Use `file:./prisma/dev.db` for SQLite (local dev) or a full PostgreSQL URL in production. |
| `NODE_ENV` | ✅ Yes | — | Runtime mode. One of `development`, `production`, or `test`. Controls whether the server starts listening on a port (skipped when `test`). |
| `PORT` | No | `5001` (hardcoded) | Port the Express server binds to. Must match your deployment platform if it injects `PORT` (e.g. Render uses `10000`). |

### Frontend (Vite / React)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | *(proxied by Vite in dev)* | Base URL the browser uses to call the API. Required only in production builds where the API is on a different origin. Example: `https://shopsmart-backend.onrender.com`. |

> `VITE_API_URL` is a **build-time** variable. It is embedded into the compiled JavaScript bundle by `vite build`. Changing it after build has no effect — you must rebuild.

---

## Values by Environment

| Variable | Local Dev | Docker Dev | Render | AWS ECS |
|---|---|---|---|---|
| `DATABASE_URL` | `file:./prisma/dev.db` | `file:./prisma/dev.db` | Set in Render dashboard | `file:/app/server/prisma/prod.db` (hardcoded in `ecs.tf`) |
| `NODE_ENV` | `development` | `development` | `production` (auto) | `production` (hardcoded in `ecs.tf`) |
| `PORT` | `5001` | `5001` | `10000` (set in `render.yaml`) | `5001` (hardcoded in `variables.tf`) |
| `VITE_API_URL` | `http://localhost:5001` | `http://localhost:5001` | Set automatically from backend URL | Built into image at build time |

---

## CI/CD Environment Variables

These are set by the GitHub Actions workflow itself and are **not** in `.env`:

| Variable | Source | Description |
|---|---|---|
| `DATABASE_URL` | Workflow `env:` | Points to `file:./prisma/ci.db` for the `test` job |
| `JEST_JUNIT_OUTPUT_FILE` | Workflow `env:` | Path for Jest JUnit XML output |
| `AWS_ACCESS_KEY_ID` | GitHub Secret | AWS credential |
| `AWS_SECRET_ACCESS_KEY` | GitHub Secret | AWS credential |
| `AWS_SESSION_TOKEN` | GitHub Secret | AWS Academy session token |
| `AWS_REGION` | Workflow `env:` top-level | `us-east-1` |
| `TF_INPUT` | Workflow `env:` top-level | `'0'` — disables interactive Terraform prompts |
| `TF_IN_AUTOMATION` | Workflow `env:` top-level | `'true'` — adjusts Terraform output for CI |

---

## Adding a New Environment Variable

### Backend

1. Add it to `.env.example` with a comment.
2. Access it in `server.js` (or future modules) via `process.env.YOUR_VARIABLE`.
3. Add it to:
   - `docker-compose.yml` / `docker-compose.dev.yml` `environment:` block
   - `infra/ecs.tf` `container_definitions.environment` array (for AWS)
   - `render.yaml` `envVars:` block (for Render)
   - `.github/workflows/cicd.yml` if needed in CI

### Frontend

1. Name it with the `VITE_` prefix.
2. Add it to `.env.example`.
3. Access it in React code as `import.meta.env.VITE_YOUR_VARIABLE`.
4. Add it to the Vite build step in `render.yaml` or the Docker build args if using a custom origin.
