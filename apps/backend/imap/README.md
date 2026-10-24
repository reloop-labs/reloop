# imap

IMAP server for Reloop mail accounts, so people can open an inbox in Apple Mail, Outlook, Thunderbird or the Gmail app. Written in Go on [go-imap v2](https://github.com/emersion/go-imap). Mail is stored in Postgres (`mail_*` tables, migration `0045_imap_mail_store`).

## How it fits

```
inbound KumoMTA (25) ──NATS kumomta.inbound_received──► imap ──► Postgres (mail_folder, mail_message)
                                                          │
                    Apple Mail / Outlook / Gmail app ◄────┘ IMAP 993 (TLS) / 143 (STARTTLS)
```

- **Delivery:** subscribes to `kumomta.inbound_received` (queue group `imap-ingest`) and files each message into the INBOX of every `mail_account` among the envelope recipients. `user+tag@` falls back to `user@`. Messages flagged `X-Spam-Flag: YES` by Rspamd go to Junk.
- **Login:** the username is the mailbox address and the password is a Reloop **API key**, the same credential the SMTP relay takes. The domain service checks it via `/v1/smtp-auth`, so IMAP and SMTP follow one rule. The key must belong to the mailbox's organization, and if it has address restrictions (`api_key_scope`), they must include the mailbox. Successful checks are remembered for 1 minute, so a revoked key stops working within a minute. If the domain service is down, clients get `NO [UNAVAILABLE]` and retry instead of prompting for a new password.
- **Folders:** every account gets INBOX, Sent, Drafts, Archive, Junk and Trash, advertised with SPECIAL-USE attributes so clients map them automatically.
- **Extensions:** IMAP4rev1 + IMAP4rev2, IDLE, MOVE, UIDPLUS, SPECIAL-USE, NAMESPACE, ESEARCH, SEARCHRES, LIST-EXTENDED, LIST-STATUS, STATUS=SIZE, BINARY, LITERAL+, APPENDLIMIT (50 MB). There is no CONDSTORE/QRESYNC yet, because go-imap v2 does not support them.

## Single writer

Sequence numbers and IDLE push need an ordered in-memory view of each folder, so **this process must be the only writer of `mail_folder` and `mail_message`, and only one instance may run**. Other services may create accounts directly. Changes to messages (for example from the agent API) must go through this service.

## Environment

As in the other services: `.env.dev` holds local values and `.env.prod` lists what production needs. For local runs, `cp .env.dev .env && go run .`; the service loads `.env` on start, and real environment variables override it.

| Variable | Default | |
|---|---|---|
| `PG_URL` | (required) | Postgres connection string |
| `BASE_URL` / `KUMOMTA_WEBHOOK_URL` / `DOMAIN_SERVICE_URL` | | Where API-key logins are checked, resolved like the SMTP service: `DOMAIN_SERVICE_URL`, else `KUMOMTA_WEBHOOK_URL`, else `BASE_URL` + `/api/domain`, else `http://localhost:8011/api/domain` |
| `RELOOP_INTERNAL_SECRET` | | Sent as `x-internal-secret`, like the SMTP service |
| `NATS_URL` | `nats://127.0.0.1:4222` | |
| `IMAP_HOSTNAME` | `imap.reloop.sh` | Public host customers enter; the certificate is looked up for this name |
| `IMAP_ADDR` / `IMAP_TLS_ADDR` | `:143` / `:993` | STARTTLS and implicit-TLS listeners |
| `HEALTH_ADDR` | `:8031` | `GET /health` |
| `IMAP_ALLOW_INSECURE_AUTH` | | `true` allows login without TLS. **Local development only.** |

### TLS certificate (automatic, like the SMTP service)

`internal/certs` takes the first certificate it finds:
1. `IMAP_TLS_CERT` + `IMAP_TLS_KEY` (paths), or `IMAP_TLS_CERT_DATA` + `IMAP_TLS_KEY_DATA` (PEM)
2. `/certs/fullchain.pem` + `/certs/privkey.pem`, or `/etc/letsencrypt/live/<IMAP_HOSTNAME>/`
3. Coolify/Traefik `acme.json`, checked at `IMAP_TLS_ACME_JSON` first, then `/data/coolify/proxy/acme.json`, `/traefik/acme.json` and the usual variants. It uses a certificate whose main name or SANs match the hostname exactly or by wildcard, and if several match it picks the one that expires last.
4. Caddy's certificate store
5. `AUTO_LETSENCRYPT=true`: Let's Encrypt over HTTP-01. Port 80 must be free; set `LETSENCRYPT_EMAIL` and `LETSENCRYPT_CACHE_DIR` (default `/var/lib/imap/autocert`).
6. Otherwise a self-signed certificate, with a warning in the log.

Sources 1–4 are re-read every 5 minutes, so renewals by Traefik, Caddy or certbot apply without a restart. The container runs as root so it can read Traefik's root-only `acme.json`.

**On Coolify:**
- Attach `imap.reloop.sh` as a domain on this service, pointing at port 8031, so Traefik issues and renews its certificate.
- Mount `/data/coolify/proxy:/data/coolify/proxy:ro`.
- Publish port 993.

## Commands

```sh
imap serve                                               # default
imap create-account <email> <organizationId> <domainId>  # also creates default folders
```

## Running locally

`bun dev` and `bun run backend:dev` start it with the other services. To start it alone, run `bun run be:imap:dev`. It creates `.env` from `.env.dev` on the first run.
- **Ports:** IMAP on `localhost:1143` (plain login allowed), IMAPS on `localhost:1993` (self-signed certificate), health at `localhost:8031/health`.
- **Go missing or older than `go.mod` requires:** it prints a warning and skips IMAP instead of stopping the other services.
- **Without Go at all:** `docker compose -f local/docker-compose.yml --profile imap up -d imap`.

Run the commands with `go run . <command>`, or with `docker exec reloop-imap imap <command>` for the container.

## Developing

Needs Go 1.25+ (or use Docker: `docker run --rm -v $PWD:/w -w /w golang:1.26-alpine go build ./...`).

```sh
go vet ./... && go build ./...
IMAP_TEST_USER=you@domain IMAP_TEST_PASSWORD=<api key> python3 test/smoke.py
```

`test/smoke.py` runs 49 end-to-end checks:
- login, the folder list, create/rename/delete
- APPEND, FETCH (envelope, BODYSTRUCTURE, PEEK vs read), STORE and keywords
- SEARCH, COPY, MOVE, EXPUNGE
- delivery from NATS, including BCC, +tag and spam going to Junk
- IDLE push and flag sync between two sessions
