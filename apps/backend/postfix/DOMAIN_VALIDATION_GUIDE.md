# Postfix Domain Validation and Email Sending Guide

## Overview

This guide explains how the Postfix mail server is configured to validate domains and send emails only for authorized domains.

## Domain Validation Flow

### 1. Domain Addition Process

When a domain is added through the API:

1. **API Call**: `POST /domain/add` with domain name
2. **Database Insert**: Domain is added to the `domain` table with status `"start-verify"`
3. **DNS Records**: SPF, DKIM, and DMARC records are generated
4. **Postfix Integration**: Domain becomes available for email validation

### 2. Email Sending Process

When an email is sent:

1. **API Call**: `POST /mail/send` with email data
2. **Domain Validation**: System checks if sender domain exists in database
3. **Mailbox Validation**: System checks if sender mailbox exists
4. **Postfix Delivery**: If valid, email is sent via Postfix
5. **Logging**: Email attempt is logged in `email_log` table

## Postfix Configuration

### Main Configuration (`main.cf`)

```bash
# Virtual domain configuration with PostgreSQL
virtual_mailbox_domains = pgsql:/etc/postfix/sql/pgsql_virtual_domains_maps.cf
virtual_alias_maps = pgsql:/etc/postfix/sql/pgsql_virtual_alias_maps.cf
virtual_mailbox_maps = pgsql:/etc/postfix/sql/pgsql_virtual_mailbox_maps.cf

# Sender validation
smtpd_sender_login_maps = pgsql:/etc/postfix/sql/pgsql_sender_login_maps.cf
smtpd_sender_restrictions = permit_mynetworks, reject_non_fqdn_sender, reject_unknown_sender_domain, check_sender_access pgsql:/etc/postfix/sql/pgsql_virtual_domains_maps.cf

# Recipient validation
smtpd_recipient_restrictions = permit_mynetworks, check_recipient_access pgsql:/etc/postfix/sql/pgsql_virtual_domains_maps.cf, reject_unauth_destination
smtpd_relay_restrictions = permit_mynetworks, check_recipient_access pgsql:/etc/postfix/sql/pgsql_virtual_domains_maps.cf, defer_unauth_destination
```

### Database Queries

#### Domain Validation (`pgsql_virtual_domains_maps.cf`)
```sql
query = SELECT domain FROM domain WHERE domain='%s' AND deleted_at IS NULL
```

#### Mailbox Validation (`pgsql_virtual_mailbox_maps.cf`)
```sql
query = SELECT mail_dir FROM mailbox WHERE username='%s' AND active = true
```

#### Alias Validation (`pgsql_virtual_alias_maps.cf`)
```sql
query = (select username from mailbox where username like '%s' and active = 1 limit 1) union (select goto from alias where address like '%s' and active = 1 limit 1)
```

#### Sender Authentication (`pgsql_sender_login_maps.cf`)
```sql
query = SELECT username FROM mailbox WHERE username='%s' AND active = true
```

## Security Features

### 1. Domain Authorization
- Only domains added through the API can send emails
- Domains must exist in the database and not be deleted
- Real-time validation against PostgreSQL database

### 2. Sender Validation
- Sender email must belong to an authorized domain
- Sender must have a valid mailbox
- Non-FQDN senders are rejected

### 3. Recipient Validation
- Recipients must belong to authorized domains
- Unknown recipient domains are rejected
- Prevents unauthorized relay attempts

## Testing

### 1. Run Test Script
```bash
./test-domain-validation.sh
```

### 2. Manual Testing

#### Add Domain
```bash
curl -X POST http://localhost:3000/domain/add \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"domain": "example.com"}'
```

#### Send Email
```bash
curl -X POST http://localhost:3000/mail/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "from": "test@example.com",
    "to": "recipient@example.com",
    "subject": "Test Email",
    "text": "This is a test email"
  }'
```

## Troubleshooting

### Common Issues

1. **Domain Not Found Error**
   - Ensure domain is added to database first
   - Check if domain is not deleted (`deleted_at IS NULL`)

2. **Mailbox Not Found Error**
   - Create a mailbox for the sender email
   - Ensure mailbox is active (`active = true`)

3. **Postfix Connection Issues**
   - Check if Postfix service is running
   - Verify database connection parameters
   - Check Postfix logs: `tail -f /var/log/mail.log`

### Logs

- **Postfix Logs**: `/var/log/mail.log`
- **Application Logs**: Check application console output
- **Database Logs**: Check PostgreSQL logs

## Configuration Files

- `main.cf` - Main Postfix configuration
- `master.cf` - Postfix master process configuration
- `sql/pgsql_virtual_domains_maps.cf` - Domain validation query
- `sql/pgsql_virtual_mailbox_maps.cf` - Mailbox validation query
- `sql/pgsql_virtual_alias_maps.cf` - Alias validation query
- `sql/pgsql_sender_login_maps.cf` - Sender authentication query

## Environment Variables

Required environment variables for Postfix:

```bash
DB_HOST=postgres_host
DB_NAME=postgres_database
DB_USER=postgres_user
DB_PASSWORD=postgres_password
MAIL_HOSTNAME=mail.example.com
DOMAIN=example.com
```

## Summary

The system ensures that:
1. ✅ Only authorized domains can send emails
2. ✅ Sender validation is enforced
3. ✅ Recipient validation prevents unauthorized relay
4. ✅ All email attempts are logged
5. ✅ Real-time database validation
6. ✅ Secure email infrastructure

This configuration provides a robust, secure email system that validates domains before allowing email sending.
