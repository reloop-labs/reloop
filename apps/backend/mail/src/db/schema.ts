import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { 
  pgTable, 
  timestamp, 
  varchar, 
  text, 
  integer, 
  bigint, 
  smallint, 
  boolean,
  index 
} from "drizzle-orm/pg-core";

// Domain table for mail domains
export const domain = pgTable("domain", {
  domain: varchar("domain", { length: 255 }).primaryKey(),
  aRecord: varchar("a_record", { length: 255 }).notNull().default(""),
  mailboxes: integer("mailboxes").notNull().default(50),
  mailboxQuota: bigint("mailbox_quota", { mode: "number" }).notNull().default(5368709120), // 5GB
  quota: bigint("quota", { mode: "number" }).notNull().default(10737418240), // 10GB
  rateLimit: integer("rate_limit").default(12),
  active: smallint("active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_domain_active").on(table.active),
  index("idx_domain_created_at").on(table.createdAt),
]);

// Mailbox table for email accounts
export const mailbox = pgTable("mailbox", {
  username: varchar("username", { length: 255 }).primaryKey(),
  password: varchar("password", { length: 255 }).notNull(),
  passwordEncode: varchar("password_encode", { length: 255 }).notNull(),
  fullName: varchar("full_name", { length: 255 }).notNull(),
  isAdmin: smallint("is_admin").notNull().default(0),
  maildir: varchar("maildir", { length: 255 }).notNull(),
  quota: bigint("quota", { mode: "number" }).notNull().default(0),
  localPart: varchar("local_part", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull().references(() => domain.domain, { onDelete: "cascade" }),
  active: smallint("active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_mailbox_domain").on(table.domain),
  index("idx_mailbox_active").on(table.active),
  index("idx_mailbox_created_at").on(table.createdAt),
]);

// Alias table for email forwarding
export const alias = pgTable("alias", {
  address: varchar("address", { length: 255 }).primaryKey(),
  goto: text("goto").notNull(),
  domain: varchar("domain", { length: 255 }).notNull().references(() => domain.domain, { onDelete: "cascade" }),
  active: smallint("active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_alias_domain").on(table.domain),
  index("idx_alias_active").on(table.active),
]);

// Alias domain table for domain forwarding
export const aliasDomain = pgTable("alias_domain", {
  aliasDomain: varchar("alias_domain", { length: 255 }).primaryKey(),
  targetDomain: varchar("target_domain", { length: 255 }).notNull().references(() => domain.domain, { onDelete: "cascade" }),
  active: smallint("active").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// DKIM keys table for storing generated keys
export const dkimKeys = pgTable("dkim_keys", {
  id: varchar("id", { length: 255 }).$defaultFn(() => createId()).primaryKey(),
  domain: varchar("domain", { length: 255 }).notNull().references(() => domain.domain, { onDelete: "cascade" }),
  selector: varchar("selector", { length: 50 }).notNull().default("mail"),
  publicKey: text("public_key").notNull(),
  privateKey: text("private_key").notNull(),
  keyLength: integer("key_length").notNull().default(2048),
  algorithm: varchar("algorithm", { length: 20 }).notNull().default("rsa"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_dkim_keys_domain").on(table.domain),
  index("idx_dkim_keys_selector").on(table.selector),
]);

// DNS records table for storing generated DNS records
export const dnsRecords = pgTable("dns_records", {
  id: varchar("id", { length: 255 }).$defaultFn(() => createId()).primaryKey(),
  domain: varchar("domain", { length: 255 }).notNull().references(() => domain.domain, { onDelete: "cascade" }),
  recordType: varchar("record_type", { length: 10 }).notNull(), // A, MX, TXT, CNAME, etc.
  name: varchar("name", { length: 255 }).notNull(),
  value: text("value").notNull(),
  ttl: integer("ttl").default(3600),
  priority: integer("priority"), // For MX records
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [
  index("idx_dns_records_domain").on(table.domain),
  index("idx_dns_records_type").on(table.recordType),
]);

// User table (keeping existing)
export const user = pgTable("user", {
  id: varchar("id", { length: 255 }).$defaultFn(() => createId()).primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  salt: varchar("salt", { length: 64 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const domainRelations = relations(domain, ({ many }) => ({
  mailboxes: many(mailbox),
  aliases: many(alias),
  aliasDomains: many(aliasDomain),
  dkimKeys: many(dkimKeys),
  dnsRecords: many(dnsRecords),
}));

export const mailboxRelations = relations(mailbox, ({ one }) => ({
  domain: one(domain, {
    fields: [mailbox.domain],
    references: [domain.domain],
  }),
}));

export const aliasRelations = relations(alias, ({ one }) => ({
  domain: one(domain, {
    fields: [alias.domain],
    references: [domain.domain],
  }),
}));

export const aliasDomainRelations = relations(aliasDomain, ({ one }) => ({
  targetDomain: one(domain, {
    fields: [aliasDomain.targetDomain],
    references: [domain.domain],
  }),
}));

export const dkimKeysRelations = relations(dkimKeys, ({ one }) => ({
  domain: one(domain, {
    fields: [dkimKeys.domain],
    references: [domain.domain],
  }),
}));

export const dnsRecordsRelations = relations(dnsRecords, ({ one }) => ({
  domain: one(domain, {
    fields: [dnsRecords.domain],
    references: [domain.domain],
  }),
}));

export const table = {
  user,
  domain,
  mailbox,
  alias,
  aliasDomain,
  dkimKeys,
  dnsRecords,
} as const;

export type Table = typeof table;
