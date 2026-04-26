# Use Node 20 as base
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# --- Stage 1: Build Client ---
FROM base AS client-build
WORKDIR /app/client
COPY client/package.json client/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY client/ ./
RUN pnpm run build

# --- Stage 2: Build Server ---
FROM base AS server-build
WORKDIR /app/server
COPY server/package.json server/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY server/ ./
RUN npx prisma generate

# --- Stage 3: Production Image ---
FROM base AS runner
RUN corepack enable
WORKDIR /app

COPY --from=server-build /app/server /app/server
COPY --from=client-build /app/client/dist /app/server/public

WORKDIR /app/server
EXPOSE 5001

CMD ["sh", "-c", "npx prisma migrate deploy && pnpm start"]
