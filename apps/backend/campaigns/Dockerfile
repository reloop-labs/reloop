FROM oven/bun:alpine AS base

FROM base AS deps
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY . .
RUN bun --filter=be-campaigns install

FROM base AS builder
WORKDIR /app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run --filter=be-campaigns build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/apps/backend/campaigns/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/package.json ./package.json

EXPOSE 8027

CMD ["bun", "run", "dist/index.js"]
