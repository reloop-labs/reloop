FROM oven/bun:alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY . .
RUN bun --filter=admin install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run --filter=admin build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/frontend/admin/public ./admin/public
COPY --from=builder /app/apps/frontend/admin/.next ./admin/.next
COPY --from=deps /app/node_modules ./admin/node_modules
COPY --from=deps /app/apps/frontend/admin/package.json ./admin/package.json

EXPOSE 3000
CMD ["bun", "--cwd","admin" ,"start"]
