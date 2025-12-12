# Postfix Multi-Domain Mail Server

A Docker container for sending emails via Postfix with DKIM signing support for **multiple domains**.

## Quick Start

### 1. Configure Your Domains

Edit `docker-compose.yml` and set your domains:

```yaml
environment:
  # Comma-separated list of domains
  MAIL_DOMAINS: "domain1.com,domain2.com,domain3.com"
  DKIM_SELECTOR: default
```

### 2. Build and Run

```bash
docker-compose up -d --build
```

### 3. Get DNS Records

The container will output DKIM and DMARC records for all domains:

```bash
docker logs postfix
```

### 4. Add DNS Records

For each domain, add:

| Type | Name | Value |
|------|------|-------|
| TXT | `default._domainkey.yourdomain.com` | DKIM public key (from logs) |
| TXT | `_dmarc.yourdomain.com` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com` |
| TXT | `yourdomain.com` | `v=spf1 ip4:YOUR_SERVER_IP -all` |
| MX | `yourdomain.com` | `mail.yourdomain.com` (priority 10) |

### 5. Send an Email

```bash
docker exec -it postfix send-email
```

Or via API:

```bash
echo "Hello World" | docker exec -i postfix mail -s "Test Subject" -r "sender@domain1.com" recipient@example.com
```

## Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `MAIL_DOMAINS` | Comma-separated list of sending domains | - |
| `MAIL_DOMAIN` | Legacy: Single domain (fallback) | `localhost` |
| `DKIM_SELECTOR` | DKIM selector name | `default` |

## Persistent Storage

The docker-compose.yml includes volumes to persist:
- **DKIM keys**: `/etc/opendkim/keys` - So keys aren't regenerated on restart
- **TLS certificates**: `/etc/postfix/tls` - Reuse SSL certs

## Logs

```bash
docker logs -f postfix
```

## Troubleshooting

**Email not delivered?**
- Check logs: `docker logs postfix`
- Verify DNS records are propagated
- Check if your IP is blacklisted: [MXToolbox](https://mxtoolbox.com/blacklists.aspx)

**DKIM verification failing?**
- Ensure the DKIM TXT record matches the output from logs
- Wait for DNS propagation (up to 48 hours)
- Test with [mail-tester.com](https://www.mail-tester.com/)

**Connection refused?**
- Port 25 may be blocked by your ISP/cloud provider
- Many cloud providers require opening a support ticket to unblock port 25
