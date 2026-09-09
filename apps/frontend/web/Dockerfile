FROM oven/bun:alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY . .
RUN bun --filter=fe-web install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# NEXT_PUBLIC_* is inlined at build time — default to production marketing host.
# Override at build: --build-arg NEXT_PUBLIC_URL=https://reloop.sh
ARG NEXT_PUBLIC_URL=https://reloop.sh
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}
# Optional explicit public origin for SEO (canonicals/sitemaps); defaults via getSiteUrl().
ARG NEXT_PUBLIC_SITE_URL=https://reloop.sh
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Guard: never bake local.reloop.sh / localhost into a production image if a .env slipped in
RUN if echo "${NEXT_PUBLIC_URL}" | grep -qE 'local\.reloop\.sh|localhost|127\.0\.0\.1'; then \
	echo "ERROR: NEXT_PUBLIC_URL must not be a local origin in production builds: ${NEXT_PUBLIC_URL}" >&2; \
	exit 1; \
	fi
RUN if echo "${NEXT_PUBLIC_SITE_URL}" | grep -qE 'local\.reloop\.sh|localhost|127\.0\.0\.1'; then \
	echo "ERROR: NEXT_PUBLIC_SITE_URL must not be a local origin in production builds: ${NEXT_PUBLIC_SITE_URL}" >&2; \
	exit 1; \
	fi

RUN bun run --filter=fe-web build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app

# Runtime environment variables (can be overridden from outside)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Keep production origin at runtime for any server-side getSiteUrl() calls
ENV NEXT_PUBLIC_URL=https://reloop.sh
ENV NEXT_PUBLIC_SITE_URL=https://reloop.sh

# Copy standalone build
COPY --from=builder /app/apps/frontend/web/public ./public
COPY --from=builder /app/apps/frontend/web/.next/standalone ./
COPY --from=builder /app/apps/frontend/web/.next/standalone/apps/frontend/web ./
COPY --from=builder /app/apps/frontend/web/.next/static ./.next/static

RUN rm -rf apps

EXPOSE 3000

# Coolify needs a passing health check to do a rolling update (new container
# becomes healthy before the old one is stopped). The Coolify UI check needs
# curl/wget, which this alpine image does not ship, so define the check here
# with bun instead. A Dockerfile HEALTHCHECK takes precedence over the UI one.
# Short interval + retries keep the handover fast; start-period covers boot.
HEALTHCHECK --interval=5s --timeout=3s --start-period=20s --retries=6 \
	CMD bun -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "server.js"]
