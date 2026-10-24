# Cross-compile on the build platform instead of emulating each target arch.
FROM --platform=$BUILDPLATFORM golang:1.26-alpine AS builder
ARG TARGETOS TARGETARCH
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -trimpath -ldflags="-s -w" -o /out/imap .

FROM alpine:3.22
RUN apk add --no-cache ca-certificates && mkdir -p /var/lib/imap/autocert
COPY --from=builder /out/imap /usr/local/bin/imap
# Runs as root, like the SMTP container, so it can read Traefik's root-only
# acme.json (Coolify) to pick up certificates and their renewals.
# 143 = IMAP (+STARTTLS), 993 = IMAPS, 8031 = health, 80 = Let's Encrypt HTTP-01 (AUTO_LETSENCRYPT only)
EXPOSE 143 993 8031
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:8031/health || exit 1
ENTRYPOINT ["imap"]
CMD ["serve"]
