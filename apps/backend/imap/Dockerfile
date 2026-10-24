# Cross-compile on the build platform instead of emulating each target arch.
FROM --platform=$BUILDPLATFORM golang:1.26-alpine AS builder
ARG TARGETOS TARGETARCH
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -trimpath -ldflags="-s -w" -o /out/imap .

FROM alpine:3.22
RUN apk add --no-cache ca-certificates && adduser -D -H imap
COPY --from=builder /out/imap /usr/local/bin/imap
USER imap
# 143 = IMAP (+STARTTLS), 993 = IMAPS, 8029 = health
EXPOSE 143 993 8029
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:8029/health || exit 1
ENTRYPOINT ["imap"]
CMD ["serve"]
