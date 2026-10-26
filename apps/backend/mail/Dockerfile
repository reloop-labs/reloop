FROM oven/bun:alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app

# Install Python and build dependencies for native modules
RUN apk add --no-cache python3 make g++

COPY . .
RUN bun --filter=be-mail install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
# Use ARG for build-time variables that can be overridden
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run --filter=be-mail build

# Stage 3: GeoIP database for open/click locations (DB-IP Lite, CC BY 4.0).
# GEOIP_EDITION=city adds city names (~130 MB) instead of countries (~8 MB).
# Published monthly; fall back to last month early in a month. A failed
# download leaves locations empty instead of failing the build.
FROM base AS geoip
ARG GEOIP_EDITION=country
RUN apk add --no-cache curl && mkdir -p /geoip && \
    for month in "$(date -u +%Y-%m)" "$(date -u -d "@$(( $(date +%s) - 2678400 ))" +%Y-%m)"; do \
      curl -sfL "https://download.db-ip.com/free/dbip-${GEOIP_EDITION}-lite-${month}.mmdb.gz" -o /tmp/geo.gz \
        && gunzip -c /tmp/geo.gz > /geoip/dbip.mmdb && break; \
    done; \
    [ -s /geoip/dbip.mmdb ] || rm -f /geoip/dbip.mmdb; rm -f /tmp/geo.gz

# Stage 4: Production server
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Copy standalone build
COPY --from=builder /app/apps/backend/mail/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./package.json
COPY --from=geoip /geoip ./geoip
ENV GEOIP_DB_PATH=/app/geoip/dbip.mmdb

EXPOSE 8015

CMD ["bun", "run", "dist/index.js"]
