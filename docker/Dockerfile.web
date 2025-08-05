FROM oven/bun:alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY . .
RUN bun --filter=web install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run --filter=web build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/frontend/web/public ./web/public
COPY --from=builder /app/apps/frontend/web/.next ./web/.next
COPY --from=deps /app/node_modules ./web/node_modules
COPY --from=deps /app/apps/frontend/web/package.json ./web/package.json

EXPOSE 3000
CMD ["bun", "--cwd","web" ,"start"]
