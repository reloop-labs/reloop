FROM oven/bun:alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY . .
RUN bun --filter=dev install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Use ARG for build-time variables that can be overridden
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run --filter=dev build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app
# Runtime environment variables (can be overridden from outside)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Add other runtime ENVs that can be overridden
ENV PORT=3000
COPY --from=builder /app/apps/frontend/dev/public ./dev/public
COPY --from=builder /app/apps/frontend/dev/.next ./dev/.next
COPY --from=deps /app/node_modules ./dev/node_modules
COPY --from=deps /app/apps/frontend/dev/package.json ./dev/package.json

EXPOSE 3000
CMD ["bun", "--cwd","dev" ,"start"]
