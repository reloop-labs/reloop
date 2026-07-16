FROM oven/bun:alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY . .
RUN bun --filter=fe-dashboard install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
# VITE_* are inlined at build time. When VITE_PUBLIC_URL is omitted, the auth
# client uses window.location.origin (works for any public hostname).
# Pass --build-arg VITE_PUBLIC_URL=https://your-domain.com to pin an absolute origin.
ARG VITE_PUBLIC_URL
ENV VITE_PUBLIC_URL=${VITE_PUBLIC_URL}
ARG VITE_WS_URL=wss://reloop.sh
ENV VITE_WS_URL=${VITE_WS_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run --filter=fe-dashboard build

# Stage 3: Production server (Nitro output)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Defaults for local/docker; Coolify injects PORT at runtime.
# Do NOT set NITRO_PORT — Nitro prefers it over PORT, which breaks Coolify
# when "Ports Exposes" ≠ 3000 (classic Bad Gateway).
ENV PORT=3000
ENV HOST=0.0.0.0
ENV NITRO_HOST=0.0.0.0

COPY --from=builder /app/apps/frontend/dashboard/.output ./.output
COPY --from=builder /app/apps/frontend/dashboard/public ./public

EXPOSE 3000

# Coolify/Traefik health checks; app is mounted at /dashboard.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
	CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/dashboard/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", ".output/server/index.mjs"]
