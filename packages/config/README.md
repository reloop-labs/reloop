# @config

Configuration package for the Reloop application that exports JSON configuration objects with TypeScript types.

## Features

- **Type-safe configuration**: All configuration objects are fully typed with TypeScript
- **Environment-based**: Automatically reads from environment variables with sensible defaults
- **Modular structure**: Separate configuration modules for different parts of the application
- **JSON export**: Exports configuration as JSON objects that can be easily consumed

## Usage

### Basic Import

```typescript
import { config } from '@config';

// Access the full configuration
console.log(config.app.name); // "Reloop"
console.log(config.database.postgres.host); // "localhost"
console.log(config.mail.smtp.port); // 587
```

### Individual Module Imports

```typescript
import { appConfig, databaseConfig, mailConfig } from '@config';

// Use specific configuration sections
const port = appConfig.port;
const dbHost = databaseConfig.postgres.host;
const smtpPort = mailConfig.smtp.port;
```

### Type Safety

```typescript
import type { Config, AppConfig, DatabaseConfig, MailConfig } from '@config';

// All configuration objects are fully typed
function setupApp(config: AppConfig) {
  console.log(`Starting ${config.name} on port ${config.port}`);
}
```

## Configuration Structure

### App Configuration (`appConfig`)

- Application name, version, and environment
- Server settings (port, host)
- CORS configuration
- Rate limiting settings

### Database Configuration (`databaseConfig`)

- PostgreSQL connection settings
- Redis configuration
- Migration settings

### Mail Configuration (`mailConfig`)

- SMTP settings
- Postfix configuration
- Dovecot settings
- Rspamd configuration
- Email templates

## Environment Variables

The package automatically reads from environment variables. Here are the key ones:

### App
- `NODE_ENV` - Environment (development, production, etc.)
- `PORT` - Server port
- `HOST` - Server host
- `DEBUG` - Enable debug mode
- `SECRET` - Application secret key

### Database
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `REDIS_HOST` - Redis host
- `REDIS_PORT` - Redis port

### Mail
- `SMTP_HOST` - SMTP server host
- `SMTP_PORT` - SMTP server port
- `SMTP_USER` - SMTP username
- `SMTP_PASS` - SMTP password
- `POSTFIX_HOST` - Postfix host
- `DOVECOT_HOST` - Dovecot host

## Development

```bash
# Install dependencies
bun install

# Type checking
bun run typecheck

# Build
bun run build

# Development mode
bun run dev
```

## Building

The package builds TypeScript declarations to the `dist/` directory:

```bash
bun run build
```

This will generate:
- `dist/src/index.d.ts`
- `dist/src/app.d.ts`
- `dist/src/database.d.ts`
- `dist/src/mail.d.ts`
