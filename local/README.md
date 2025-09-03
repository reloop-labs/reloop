# Reloop Local Development Setup

This folder contains all the configuration files needed to run the Reloop project locally using `reloop.local` as the domain.

## Files

- `docker-compose.yml` - Docker Compose configuration for all services
- `Caddyfile` - Caddy reverse proxy configuration
- `env.local` - Environment variables for local development

## Prerequisites

1. **Add to hosts file** (if not already done):
   ```bash
   echo "127.0.0.1 reloop.local" | sudo tee -a /etc/hosts
   ```

2. **Create necessary directories**:
   ```bash
   mkdir -p ../docker-data/caddy
   mkdir -p ../docker-data/rspamd
   mkdir -p ../docker-data/ssl
   mkdir -p ../docker-data/vmail
   mkdir -p ../docker-data/postfix
   ```

## Usage

### Start all services:
```bash
docker-compose up -d
```

### Start specific services:
```bash
docker-compose up -d reloop-postgres reloop-redis
docker-compose up -d reloop-proxy reloop-web
```

### View logs:
```bash
docker-compose logs -f
```

### Stop all services:
```bash
docker-compose down
```

## Access Points

- **Main App**: http://reloop.local or https://reloop.local
- **Dashboard**: http://reloop.local/dashboard
- **Dev**: http://reloop.local/dev
- **Docs**: http://reloop.local/docs
- **Admin**: http://reloop.local/admin
- **API Auth**: http://reloop.local/api/auth

## Ports

- **PostgreSQL**: 5432
- **Redis**: 6379
- **Main**: 3001
- **Dev**: 3002
- **Docs**: 3003
- **Admin**: 3004
- **Web**: 3005
- **Auth**: 3006
- **SMTP**: 25, 465, 587
- **IMAP**: 143, 993
- **POP**: 110, 995

## SSL Certificates

Caddy will automatically generate self-signed SSL certificates for `reloop.local`. The first time you access `https://reloop.local`, your browser will show a security warning - this is normal for local development.

## Troubleshooting

1. **Port conflicts**: Make sure ports 80, 443, 5432, 6379, and 3001-3006 are available
2. **Build issues**: Ensure all frontend apps have valid Dockerfiles
3. **Network issues**: Check that Docker networks are properly created
4. **Permission issues**: Ensure Docker has access to the project directories
