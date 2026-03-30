# Use Node 20 as base
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# --- Stage 1: Build Client ---
FROM base AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN pnpm install
COPY client/ ./
RUN pnpm run build

# --- Stage 2: Build Server ---
FROM base AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN pnpm install
COPY server/ ./
RUN npx prisma generate

# --- Stage 3: Production Image ---
FROM base AS runner
WORKDIR /app

# Copy built frontend to server's public folder (if server is set up to serve it)
# Or keep them separate if using a proxy. 
# For a "basic" single-container setup, we'll install server deps and run it.
COPY --from=server-build /app/server /app/server
COPY --from=client-build /app/client/dist /app/server/public

WORKDIR /app/server
EXPOSE 5001

# Set production environment
ENV NODE_ENV=production
ENV DATABASE_URL="file:./prisma/dev.db"

# Root Dockerfile usually runs the server in these setups
CMD ["npm", "start"]
