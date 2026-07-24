FROM oven/bun:alpine AS base
RUN apk add --no-cache git libc6-compat

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY . .
RUN bun --filter=fe-docs install

# Stage 2: Build the application
FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# Use ARG for build-time variables that can be overridden
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run --filter=fe-docs build

# Stage 3: Production server
FROM base AS runner
WORKDIR /app

# Runtime environment variables (can be overridden from outside)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Copy standalone build
COPY --from=builder /app/apps/frontend/docs/content ./content
COPY --from=builder /app/apps/frontend/docs/public ./public
COPY --from=builder /app/apps/frontend/docs/llms.txt ./llms.txt
COPY --from=builder /app/apps/frontend/docs/.next/standalone ./
COPY --from=builder /app/apps/frontend/docs/.next/standalone/apps/frontend/docs ./
COPY --from=builder /app/apps/frontend/docs/.next/static ./.next/static

# Re-link external modules dynamically and clean up
RUN rm -rf apps && \
    for link in $(find .next/node_modules -type l); do \
        target=$(readlink "$link"); \
        new_target=$(echo "$target" | sed 's|\.\./\.\./\.\./\.\./\.\./|../../|'); \
        ln -sf "$new_target" "$link"; \
    done

EXPOSE 3000

CMD ["bun", "run", "server.js"]
