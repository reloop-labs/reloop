FROM oven/bun:alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app

# Install Python and build dependencies for native modules
RUN apk add --no-cache python3 make g++

COPY . .
RUN bun --filter=workflow install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
# Use ARG for build-time variables that can be overridden
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run --filter=workflow build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

# Copy standalone build
COPY --from=builder /app/apps/backend/workflow/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 8017

CMD ["bun", "run", "dist/index.js"]

