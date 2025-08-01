# Stage 1: Base image with Bun
FROM oven/bun:1.1.13-alpine AS base

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV BUN_INSTALL="/.bun"
ENV PATH="/.bun/bin:$PATH"

# Copy the entire repo (workspace context)
COPY . .

# Install dependencies from the workspace
RUN bun install --frozen-lockfile

# Build the docs app
WORKDIR /app/apps/docs
RUN bun run build

# Stage 2: Minimal runtime image
FROM oven/bun:1.1.13-alpine AS runner

WORKDIR /app

# Copy built app and only what's needed to run
COPY --from=base /app/apps/docs .

EXPOSE 3000

# Start the Fumadocs app
CMD ["bun", "start"]
