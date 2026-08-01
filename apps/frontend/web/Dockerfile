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

CMD ["bun", "run", "server.js"]
