# Getting Started

## Prerequisites

| Tool | Minimum Version | Install |
|---|---|---|
| Node.js | 20.x | [nodejs.org](https://nodejs.org) |
| pnpm | 9.x | `npm install -g pnpm` |
| Docker Desktop | latest | [docker.com](https://docker.com) |
| Terraform | 1.7.5 | [terraform.io](https://developer.hashicorp.com/terraform/install) |

> **Note**: Terraform and Docker are only required for infrastructure deployment. For local development, only Node.js and pnpm are needed.

---

## Quick Start (Local Development)

### 1. Clone the repository

```bash
git clone <your-remote-url>
cd shopsmart
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in the values (see [environment-variables.md](./environment-variables.md)):

```env
DATABASE_URL=file:./prisma/dev.db
NODE_ENV=development
PORT=5001
VITE_API_URL=http://localhost:5001
```

### 3. Install all dependencies

```bash
pnpm run setup
```

This installs dependencies for the root workspace, `server/`, and `client/` in one command.

### 4. Prepare the database

```bash
cd server
pnpm prisma migrate deploy   # Apply schema migrations
pnpm prisma db seed          # Load sample products & categories
cd ..
```

### 5. Start the development servers

```bash
pnpm run dev
```

This starts both servers concurrently:

| Service | URL |
|---|---|
| React frontend (Vite HMR) | http://localhost:5173 |
| Express API | http://localhost:5001 |
| API Health check | http://localhost:5001/api/health |

> Vite is pre-configured to proxy `/api/*` requests to `http://localhost:5001`, so no CORS issues during development.

---

## Available Root Scripts

| Script | Description |
|---|---|
| `pnpm run setup` | Install all workspace dependencies |
| `pnpm run dev` | Start client + server concurrently |
| `pnpm run server` | Start Express server only |
| `pnpm run client` | Start Vite dev server only |
| `pnpm run lint` | Lint client and server |
| `pnpm run test` | Run all unit + integration tests |
| `pnpm run format` | Format code with Prettier |
| `pnpm run format:check` | Check formatting without writing |
| `pnpm run docker:build` | Build dev Docker images |
| `pnpm run docker:up` | Start dev Docker stack (detached) |
| `pnpm run docker:down` | Stop dev Docker stack |
| `pnpm run docker:logs` | Tail Docker logs |
| `pnpm run docker:clean` | Prune unused Docker resources |

---

## Docker Development

To run the full stack inside Docker (mirrors production more closely):

```bash
pnpm run docker:build
pnpm run docker:up
```

| Service | URL |
|---|---|
| React SPA | http://localhost:3000 |
| Express API | http://localhost:5001 |

To stop:

```bash
pnpm run docker:down
```

---

## Resetting the Database

```bash
cd server
rm -f prisma/dev.db prisma/dev.db-journal
pnpm prisma migrate deploy
pnpm prisma db seed
```

---

## IDE Setup

The project uses **Prettier** and **ESLint**. To enable format-on-save in VS Code:

1. Install the [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension.
2. Install the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) extension.
3. Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```
