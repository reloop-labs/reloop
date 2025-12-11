# Postfix Minimal - Simple Email Sending Container

A minimal Docker container for sending emails via Postfix CLI.

## Quick Start

### 1. Set Your Domain

Edit `docker-compose.yml` and change the `MAIL_DOMAIN`:

```yaml
environment:
  MAIL_DOMAIN: yourdomain.com
```

### 2. Build and Run

```bash
docker-compose up -d --build
```

### 3. Send an Email

```bash
docker exec -it postfix-minimal send-email
```

Follow the interactive prompts to send your email.

## One-liner Email Send

You can also send emails non-interactively:

```bash
docker exec postfix-minimal bash -c 'echo "Hello World" | mail -s "Test Subject" -r "admin@${MAIL_DOMAIN}" recipient@example.com'
```

## Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `MAIL_DOMAIN` | Your sending domain | `localhost` |

## Logs

View Postfix logs:

```bash
docker logs -f postfix-minimal
```

## Important Notes for Production

⚠️ **For production use, you must:**

1. **Set up DNS records:**
   - **A Record**: `mail.yourdomain.com` → Your server IP
   - **MX Record**: `yourdomain.com` → `mail.yourdomain.com`
   - **SPF Record**: `v=spf1 ip4:YOUR_SERVER_IP -all`
   - **PTR Record**: Reverse DNS from your IP to `mail.yourdomain.com`

2. **Configure DKIM** (recommended for deliverability)

3. **Use TLS** for encrypted connections

4. **Avoid sending from residential IPs** (likely to be blocked)

## Troubleshooting

**Email not delivered?**
- Check logs: `docker logs postfix-minimal`
- Verify DNS records
- Check if your IP is blacklisted: [MXToolbox](https://mxtoolbox.com/blacklists.aspx)

**Connection refused?**
- Ensure port 25 is not blocked by your ISP/firewall
- Many cloud providers block port 25 by default
