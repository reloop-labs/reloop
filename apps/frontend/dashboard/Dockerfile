FROM oven/bun:1.3.14-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
# NEXT_PUBLIC_* are inlined at build time. When NEXT_PUBLIC_URL is omitted, the auth
# client uses window.location.origin (works for any public hostname).
# Pass --build-arg NEXT_PUBLIC_URL=https://your-domain.com to pin an absolute origin.
ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}
ARG NEXT_PUBLIC_WS_URL=wss://reloop.sh
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run --filter=fe-dashboard build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Defaults for local/Docker; deployment platforms can override both at runtime.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/apps/frontend/dashboard/public ./public
COPY --from=builder /app/apps/frontend/dashboard/.next/standalone ./
COPY --from=builder /app/apps/frontend/dashboard/.next/standalone/apps/frontend/dashboard ./
COPY --from=builder /app/apps/frontend/dashboard/.next/static ./.next/static

RUN rm -rf apps

EXPOSE 3000

# Next applies the configured base path to the health route.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
	CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/dashboard/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "server.js"]
