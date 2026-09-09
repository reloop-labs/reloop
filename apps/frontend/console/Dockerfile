FROM oven/bun:alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY . .
RUN bun --filter=fe-console install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
# NEXT_PUBLIC_* are inlined at build time. When omitted, auth uses window.location.origin.
# Pass --build-arg NEXT_PUBLIC_URL=https://your-domain.com to pin an absolute origin.
ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run --filter=fe-console build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3002
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/apps/frontend/console/public ./public
COPY --from=builder /app/apps/frontend/console/.next/standalone ./
COPY --from=builder /app/apps/frontend/console/.next/standalone/apps/frontend/console ./
COPY --from=builder /app/apps/frontend/console/.next/static ./.next/static

RUN rm -rf apps

EXPOSE 3002

# Coolify needs a passing health check to do a rolling update (new container
# becomes healthy before the old one is stopped). The Coolify UI check needs
# curl/wget, which this alpine image does not ship, so define the check here
# with bun instead. A Dockerfile HEALTHCHECK takes precedence over the UI one.
# Next applies the configured base path to the health route.
HEALTHCHECK --interval=5s --timeout=3s --start-period=20s --retries=6 \
	CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3002)+'/console/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "server.js"]
