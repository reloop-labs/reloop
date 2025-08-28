# Mail API Service

A comprehensive mail management API built with Elysia.js and Drizzle ORM for PostgreSQL.

## Features

- **Domain Management**: Add/remove mail domains with automatic DKIM key generation
- **User Management**: Create/remove mail users with alias support
- **Mail Operations**: Send emails and retrieve emails via IMAP or Maildir
- **DNS Record Generation**: Automatic generation of MX, SPF, DKIM, and DMARC records
- **PostgreSQL Integration**: Full database integration with Drizzle ORM

## Environment Variables

```env
# Database
PGUSER=your_db_user
PGHOST=localhost
PGDATABASE=your_db_name
PGPASSWORD=your_db_password
PGPORT=5432

# Mail Server
MAIL_HOST=your_mail_host
MAIL_PORT=587
MAIL_SECURE=false
MAIL_TLS_REJECT_UNAUTHORIZED=false
```

## API Endpoints

### Send Mail
```http
POST /send
Content-Type: application/json

{
  "user": "sender@domain.com",
  "passwd": "password",
  "from": "sender@domain.com",
  "to": "recipient@domain.com",
  "subject": "Test Email",
  "text": "Plain text content",
  "html": "<p>HTML content</p>"
}
```

### Add Domain
```http
POST /add-domain
Content-Type: application/json

{
  "domain": "example.com",
  "mail": "admin@example.com",
  "password": "secure_password"
}
```

### Remove Domain
```http
POST /remove-domain
Content-Type: application/json

{
  "domain": "example.com"
}
```

### Add User
```http
POST /add-user
Content-Type: application/json

{
  "domain": "example.com",
  "username": "john",
  "password": "user_password",
  "aliases": ["john.doe", "jdoe"]
}
```

### Remove User
```http
POST /remove-user
Content-Type: application/json

{
  "domain": "example.com",
  "username": "john"
}
```

### Get Mails (Maildir)
```http
POST /mails
Content-Type: application/json

{
  "email": "user@domain.com"
}
```

### Get Mails (IMAP)
```http
POST /get-mails
Content-Type: application/json

{
  "user": "user@domain.com",
  "password": "password",
  "count": 10,
  "mailbox": "INBOX"
}
```

## Database Schema

The API uses three main tables:

- `virtual_domains`: Stores mail domains
- `virtual_users`: Stores mail users with hashed passwords
- `virtual_aliases`: Stores email aliases and forwarding rules

## Setup

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables

3. Run database migrations:
```bash
# Apply the migration manually or use your preferred migration tool
psql -d your_database -f src/db/migrations/0001_mail_schema.sql
```

4. Start the development server:
```bash
bun run dev
```

## System Requirements

- PostgreSQL database
- Dovecot mail server
- Postfix mail server
- Rspamd for DKIM
- sudo access for service management

## Security Notes

- Passwords are hashed using Dovecot's SSHA512 algorithm
- All database operations use parameterized queries
- File system operations are restricted to mail directories
- Service restarts require sudo privileges