import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { table } from "./schema";

async function main() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://reloop:reloop123@localhost:5432/reloop",
  });

  const db = drizzle(pool, { schema: table });

  console.log("🔄 Running migrations...");

  try {

    await db.execute(`
      -- Domain table for mail domains
      CREATE TABLE IF NOT EXISTS domain (
        domain varchar(255) NOT NULL,
        a_record varchar(255) NOT NULL DEFAULT '',
        mailboxes int NOT NULL DEFAULT 50,
        mailbox_quota BIGINT NOT NULL DEFAULT 5368709120,
        quota BIGINT NOT NULL DEFAULT 10737418240,
        rate_limit INT DEFAULT 12,
        active SMALLINT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        PRIMARY KEY (domain)
      );

      -- Mailbox table for email accounts
      CREATE TABLE IF NOT EXISTS mailbox (
        username varchar(255) NOT NULL,
        password varchar(255) NOT NULL,
        password_encode varchar(255) NOT NULL,
        full_name varchar(255) NOT NULL,
        is_admin smallint NOT NULL DEFAULT 0,
        maildir varchar(255) NOT NULL,
        quota bigint NOT NULL DEFAULT 0,
        local_part varchar(255) NOT NULL,
        domain varchar(255) NOT NULL,
        active SMALLINT NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        PRIMARY KEY (username),
        FOREIGN KEY (domain) REFERENCES domain(domain) ON DELETE CASCADE
      );

      -- Alias table for email forwarding
      CREATE TABLE IF NOT EXISTS alias (
        address varchar(255) NOT NULL,
        goto text NOT NULL,
        domain varchar(255) NOT NULL,
        active smallint NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        PRIMARY KEY (address),
        FOREIGN KEY (domain) REFERENCES domain(domain) ON DELETE CASCADE
      );

      -- Alias domain table for domain forwarding
      CREATE TABLE IF NOT EXISTS alias_domain (
        alias_domain varchar(255) NOT NULL, 
        target_domain varchar(255) NOT NULL,
        active smallint NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        PRIMARY KEY (alias_domain),
        FOREIGN KEY (target_domain) REFERENCES domain(domain) ON DELETE CASCADE
      );

      -- DKIM keys table for storing generated keys
      CREATE TABLE IF NOT EXISTS dkim_keys (
        id varchar(255) NOT NULL,
        domain varchar(255) NOT NULL,
        selector varchar(50) NOT NULL DEFAULT 'mail',
        public_key text NOT NULL,
        private_key text NOT NULL,
        key_length int NOT NULL DEFAULT 2048,
        algorithm varchar(20) NOT NULL DEFAULT 'rsa',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (domain) REFERENCES domain(domain) ON DELETE CASCADE
      );

      -- DNS records table for storing generated DNS records
      CREATE TABLE IF NOT EXISTS dns_records (
        id varchar(255) NOT NULL,
        domain varchar(255) NOT NULL,
        record_type varchar(10) NOT NULL,
        name varchar(255) NOT NULL,
        value text NOT NULL,
        ttl int DEFAULT 3600,
        priority int,
        description text,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        PRIMARY KEY (id),
        FOREIGN KEY (domain) REFERENCES domain(domain) ON DELETE CASCADE
      );

      -- User table (keeping existing)
      CREATE TABLE IF NOT EXISTS "user" (
        id varchar(255) NOT NULL,
        username varchar(255) NOT NULL UNIQUE,
        password varchar(255) NOT NULL,
        email varchar(255) NOT NULL UNIQUE,
        salt varchar(64) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        PRIMARY KEY (id)
      );
    `);

    // Create indexes for better performance
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_mailbox_domain ON mailbox(domain);
      CREATE INDEX IF NOT EXISTS idx_mailbox_active ON mailbox(active);
      CREATE INDEX IF NOT EXISTS idx_alias_domain ON alias(domain);
      CREATE INDEX IF NOT EXISTS idx_alias_active ON alias(active);
      CREATE INDEX IF NOT EXISTS idx_domain_active ON domain(active);
      CREATE INDEX IF NOT EXISTS idx_domain_created_at ON domain(created_at);
      CREATE INDEX IF NOT EXISTS idx_mailbox_created_at ON mailbox(created_at);
      CREATE INDEX IF NOT EXISTS idx_dkim_keys_domain ON dkim_keys(domain);
      CREATE INDEX IF NOT EXISTS idx_dkim_keys_selector ON dkim_keys(selector);
      CREATE INDEX IF NOT EXISTS idx_dns_records_domain ON dns_records(domain);
      CREATE INDEX IF NOT EXISTS idx_dns_records_type ON dns_records(record_type);
    `);

    console.log(" Database tables created successfully!");
    console.log(" Tables created:");
    console.log("   - domain");
    console.log("   - mailbox");
    console.log("   - alias");
    console.log("   - alias_domain");
    console.log("   - dkim_keys");
    console.log("   - dns_records");
    console.log("   - user");

  } catch (error) {
    console.error(" Migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(" Migration failed:", err);
  process.exit(1);
});
