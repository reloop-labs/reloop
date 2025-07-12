FROM node:22-alpine AS base

WORKDIR /app

# =========================================================================== #

FROM base AS builder-base

ENV TURBO_TELEMETRY_DISABLED=1
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=1

RUN corepack enable pnpm

# =========================================================================== #

FROM builder-base AS builder

RUN pnpm install --global turbo@^2

COPY . .

# https://turbo.build/repo/docs/guides/tools/docker#the-solution
RUN turbo prune @reloop/db --docker \
    && pnpm install --frozen-lockfile

CMD ["/bin/sh"]
