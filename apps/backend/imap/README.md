# imap

IMAP server for Reloop mail accounts, so people can open an inbox in Apple Mail, Outlook, Thunderbird or the Gmail app. Written in Go on [go-imap v2](https://github.com/emersion/go-imap). Mail is stored in Postgres (`mail_*` tables, migration `0045_imap_mail_store`).

## How it fits

```
inbound KumoMTA (25) ──NATS kumomta.inbound_received──► imap ──► Postgres (mail_folder, mail_message)
                                                          │
                    Apple Mail / Outlook / Gmail app ◄────┘ IMAP 993 (TLS) / 143 (STARTTLS)
```

- **Delivery:** subscribes to `kumomta.inbound_received` (queue group `imap-ingest`) and files each message into the INBOX of every `mail_account` among the envelope recipients. `user+tag@` falls back to `user@`. Messages flagged `X-Spam-Flag: YES` by Rspamd go to Junk.
- **Login:** username is the full address; the password is one of the account's app passwords (`mail_app_password`, bcrypt). Passwords are compared case-insensitively, with dashes and spaces ignored, so `ABCD-efgh-ijkl-mnop` equals `abcdefghijklmnop`.
- **Folders:** every account gets INBOX, Sent, Drafts, Archive, Junk and Trash, advertised with SPECIAL-USE attributes so clients map them automatically.
- **Extensions:** IMAP4rev1 + IMAP4rev2, IDLE, MOVE, UIDPLUS, SPECIAL-USE, NAMESPACE, ESEARCH, SEARCHRES, LIST-EXTENDED, LIST-STATUS, STATUS=SIZE, BINARY, LITERAL+, APPENDLIMIT (50 MB). There is no CONDSTORE/QRESYNC yet, because go-imap v2 does not support them.

## Single writer

Sequence numbers and IDLE push need an ordered in-memory view of each folder, so **this process must be the only writer of `mail_folder` and `mail_message`, and only one instance may run**. Other services may create accounts and app passwords directly. Changes to messages (for example from the agent API) must go through this service.

## Environment

As in the other services: `.env.dev` holds local values and `.env.prod` lists what production needs. For local runs, `cp .env.dev .env && go run .`; the service loads `.env` on start, and real environment variables override it.

| Variable | Default | |
|---|---|---|
| `PG_URL` | (required) | Postgres connection string |
| `NATS_URL` | `nats://127.0.0.1:4222` | |
| `IMAP_HOSTNAME` | `imap.reloop.sh` | Public host customers enter; the certificate is looked up for this name |
| `IMAP_ADDR` / `IMAP_TLS_ADDR` | `:143` / `:993` | STARTTLS and implicit-TLS listeners |
| `HEALTH_ADDR` | `:8029` | `GET /health` |
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
- Attach `imap.reloop.sh` as a domain on this service, pointing at port 8029, so Traefik issues and renews its certificate.
- Mount `/data/coolify/proxy:/data/coolify/proxy:ro`.
- Publish port 993.

## Commands

```sh
imap serve                                               # default
imap create-account <email> <organizationId> <domainId>  # also creates default folders
imap app-password <email> [label]                        # prints xxxx-xxxx-xxxx-xxxx once
```

Locally: `docker compose -f local/docker-compose.yml up -d imap`, then run the commands with `docker exec reloop-imap imap ...`.

## Developing

Needs Go 1.25+ (or use Docker: `docker run --rm -v $PWD:/w -w /w golang:1.26-alpine go build ./...`).

```sh
go vet ./... && go build ./...
IMAP_TEST_USER=you@domain IMAP_TEST_PASSWORD=xxxx-xxxx-xxxx-xxxx python3 test/smoke.py
```

`test/smoke.py` runs 49 end-to-end checks:
- login, the folder list, create/rename/delete
- APPEND, FETCH (envelope, BODYSTRUCTURE, PEEK vs read), STORE and keywords
- SEARCH, COPY, MOVE, EXPUNGE
- delivery from NATS, including BCC, +tag and spam going to Junk
- IDLE push and flag sync between two sessions
