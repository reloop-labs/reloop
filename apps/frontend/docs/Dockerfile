FROM oven/bun:alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY . .
RUN bun --filter=docs install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Use ARG for build-time variables that can be overridden
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run --filter=docs build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app

# Runtime environment variables (can be overridden from outside)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone build
COPY --from=builder /app/apps/frontend/docs/public ./public
COPY --from=builder /app/apps/frontend/docs/.next/standalone ./
COPY --from=builder /app/apps/frontend/docs/.next/standalone/apps/frontend/docs ./
COPY --from=builder /app/apps/frontend/docs/.next/static ./.next/static

RUN rm -rf apps

EXPOSE 3000

CMD ["bun", "run", "server.js"]
