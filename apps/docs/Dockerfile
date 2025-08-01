FROM oven/bun:1.1.13 AS base
WORKDIR /app
COPY ../../ ./
RUN bun install
WORKDIR /app/apps/docs
RUN bun run build
FROM oven/bun:1.1.13 AS final
WORKDIR /app
COPY --from=base /app/apps/docs/.next .next
COPY --from=base /app/apps/docs/public public
COPY --from=base /app/apps/docs/package.json .
COPY --from=base /app/bun.lockb .
COPY --from=base /app/packages ./packages
RUN bun install --production
EXPOSE 3000
CMD ["bun", "start"]
