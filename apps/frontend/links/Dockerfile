FROM oven/bun:alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY . .
RUN bun --filter=fe-links install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Use ARG for build-time variables that can be overridden
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
# NEXT_PUBLIC_* is inlined at build time — default to production links host.
# Override at build: --build-arg NEXT_PUBLIC_URL=https://link.reloop.sh
ARG NEXT_PUBLIC_URL=https://link.reloop.sh
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}
ARG NEXT_PUBLIC_CHATWOOT_BASE_URL
ENV NEXT_PUBLIC_CHATWOOT_BASE_URL=${NEXT_PUBLIC_CHATWOOT_BASE_URL}
ARG NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN
ENV NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN=${NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Guard: never bake local.reloop.sh into a production image if a .env slipped in
RUN if echo "${NEXT_PUBLIC_URL}" | grep -qE 'local\.reloop\.sh|localhost'; then \
	echo "ERROR: NEXT_PUBLIC_URL must not be a local origin in production builds: ${NEXT_PUBLIC_URL}" >&2; \
	exit 1; \
	fi
RUN bun run --filter=fe-links build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app

# Runtime environment variables (can be overridden from outside)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3005
ENV HOSTNAME=0.0.0.0

# Copy standalone build
COPY --from=builder /app/apps/frontend/links/public ./public
COPY --from=builder /app/apps/frontend/links/.next/standalone ./
COPY --from=builder /app/apps/frontend/links/.next/standalone/apps/frontend/links ./
COPY --from=builder /app/apps/frontend/links/.next/static ./.next/static

RUN rm -rf apps

EXPOSE 3005

# Coolify needs a passing health check to do a rolling update (new container
# becomes healthy before the old one is stopped). The Coolify UI check needs
# curl/wget, which this alpine image does not ship, so define the check here
# with bun instead. A Dockerfile HEALTHCHECK takes precedence over the UI one.
HEALTHCHECK --interval=5s --timeout=3s --start-period=20s --retries=6 \
	CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3005)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "server.js"]
