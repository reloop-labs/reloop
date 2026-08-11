FROM oven/bun:1.3.0-alpine AS base

FROM base AS deps
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY . .
RUN bun --filter=be-validation install

FROM base AS builder
WORKDIR /app

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run --filter=be-validation build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8026
ENV HOSTNAME=0.0.0.0

# Build-time arguments
ARG APP_VERSION=0.1.0
ARG BUILD_DATE

# Set environment variables
ENV APP_VERSION=${APP_VERSION}

COPY --from=builder /app/apps/backend/validation/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
# Carries packages/email-validation/data — the catalogue is read from disk at
# runtime, so the service will not start correctly without it.
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/backend/validation/package.json ./package.json

# Standard OCI labels
LABEL org.opencontainers.image.title="reloop-validation" \
      org.opencontainers.image.description="Reloop Validation Service" \
      org.opencontainers.image.version=${APP_VERSION} \
      org.opencontainers.image.created=${BUILD_DATE} \
      org.opencontainers.image.source="https://github.com/reloop-labs/reloop"

EXPOSE 8026

CMD ["bun", "run", "dist/index.js"]
