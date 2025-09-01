# Reloop

**An open-source & self-hostable SendGrid / Mailchimp / Resend / Loops alternative.**

Reloop is a comprehensive email infrastructure platform that provides everything you need to send, receive, and manage emails at scale. Built with modern technologies and designed for developers, Reloop offers a complete solution for email delivery, analytics, and management.

## What is Reloop?

Reloop is a full-stack email platform that combines the power of enterprise email infrastructure with the simplicity of modern APIs. It's designed to replace expensive email service providers while giving you complete control over your email infrastructure.

### Key Features

- **Complete Email Infrastructure**: SMTP, IMAP, POP3 with advanced spam filtering
- **High Performance**: Built on Postfix, Dovecot, and Rspamd for enterprise-grade reliability
- **Analytics & Tracking**: Real-time email analytics and delivery tracking
- **Security First**: DKIM, SPF, DMARC support with advanced spam protection
- **Web Interface**: Modern dashboard for email management and monitoring
- **Developer Tools**: Comprehensive API and development environment
- **Documentation**: Built-in documentation system for easy reference
- **Admin Panel**: Complete administrative control and user management
- **Customizable**: Fully customizable web applications to match your brand

### Why Choose Reloop?

- **Cost Effective**: No monthly fees or per-email charges - pay only for infrastructure
- **Privacy**: Your data stays on your servers with complete control
- **Performance**: Optimized for high-volume email delivery with minimal latency
- **Developer Friendly**: Modern APIs and comprehensive documentation
- **Scalable**: Designed to handle millions of emails with horizontal scaling
- **Self-Hosted**: Complete control over your infrastructure and data

### Use Cases

- **Email Service Providers**: Replace expensive third-party services with your own infrastructure
- **E-commerce Platforms**: Handle transactional and marketing emails at scale
- **SaaS Applications**: User notifications and system emails with full control
- **Marketing Teams**: Campaign management and analytics without vendor lock-in
- **Developers**: Custom email solutions and integrations with modern APIs

---

# Reloop Complete Application Stack

A comprehensive application stack including mail server, frontend applications, and reverse proxy configuration.

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Linux/macOS/Windows with WSL2
- At least 4GB RAM and 10GB disk space

### One-Command Setup

```bash
curl -fsSL https://raw.githubusercontent.com/your-repo/reloop/main/scripts/setup.sh | bash
```

Or manually:

```bash

git clone https://github.com/your-repo/reloop.git
cd reloop

chmod +x scripts/setup.sh

./scripts/setup.sh
```

## What Gets Installed

### Backend Services
- **PostgreSQL Database** - Main application database
- **Redis** - Caching and session storage
- **Postfix** - Mail transfer agent
- **Dovecot** - IMAP/POP3 server
- **Rspamd** - Spam filtering

### Frontend Applications
- **fe-main** - Main dashboard application (`/dashboard`)
- **fe-dev** - Development environment (`/dev`)
- **fe-docs** - Documentation site (`/docs`)
- **fe-admin** - Admin panel (`/admin`)
- **fe-web** - Main web application (`/`)

### Infrastructure
- **Caddy** - Reverse proxy with automatic HTTPS
- **Docker Compose** - Container orchestration

## Application URLs

After setup, access your applications at:

- **Main Dashboard**: http://localhost/dashboard
- **Development**: http://localhost/dev
- **Documentation**: http://localhost/docs
- **Admin Panel**: http://localhost/admin
- **Web App**: http://localhost/

## Configuration

### Environment Variables

Edit the `.env` file to configure your application:

```bash
DOMAIN=yourdomain.com

DB_HOST=reloop-postgres
DB_NAME=reloop
DB_USER=reloop
DB_PASSWORD=your_secure_password

REDIS_PASSWORD=your_redis_password
```

### Custom Domain Setup

To use a custom domain instead of localhost:

1. Update the `DOMAIN` variable in your `.env` file
2. Uncomment and modify the domain section in `Caddyfile`
3. Ensure your DNS points to your server
4. Restart the proxy: `docker-compose -f docker-compose.setup.yml restart reloop-proxy`

## Management Commands

```bash
docker-compose -f docker-compose.setup.yml ps

docker-compose -f docker-compose.setup.yml logs -f

docker-compose -f docker-compose.setup.yml down


docker-compose -f docker-compose.setup.yml restart

docker-compose -f docker-compose.setup.yml pull
docker-compose -f docker-compose.setup.yml up -d
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 80, 443, 25, 587, 143, 993 are available
2. **Permission errors**: Run `sudo chown -R $USER:$USER docker-data/`
3. **Database connection**: Check if PostgreSQL container is running
4. **SSL certificates**: For production, replace self-signed certificates

### Logs

```bash
docker-compose -f docker-compose.setup.yml logs reloop-main
docker-compose -f docker-compose.setup.yml logs reloop-proxy

docker-compose -f docker-compose.setup.yml logs -f
```

## Production Deployment

For production deployment:

1. Use proper SSL certificates
2. Configure firewall rules
3. Set up monitoring and backups
4. Use external database and Redis if needed
5. Configure proper DNS records
6. Set up DKIM, SPF, and DMARC for email

## Support

For issues and questions:
- Check the logs: `docker-compose -f docker-compose.setup.yml logs`
- Review the configuration files
- Open an issue on GitHub

## License


