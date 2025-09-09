import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	bigint,
	boolean,
	index,
	integer,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

export const domain = pgTable(
	"domain",
	{
		domain: varchar("domain", { length: 255 }).primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id),
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		mailboxes: integer("mailboxes").notNull(),
		mailboxQuota: bigint("mailbox_quota", { mode: "number" }).notNull(),
		quota: bigint("quota", { mode: "number" }).notNull(),
		rateLimit: integer("rate_limit"),
		active: boolean("active").notNull(),
		createdAt: timestamp("created_at").notNull(),
		updatedAt: timestamp("updated_at").notNull(),
	},
	(table) => [
		index("domain_idx_domain_active").on(table.active),
		index("domain_idx_domain_created_at").on(table.createdAt),
	],
);

export const mailbox = pgTable(
	"mailbox",
	{
		username: varchar("username", { length: 255 }).primaryKey(),
		password: varchar("password", { length: 255 }).notNull(),
		passwordEncode: varchar("password_encode", { length: 255 }).notNull(),
		fullName: varchar("full_name", { length: 255 }).notNull(),
		isAdmin: boolean("is_admin").notNull(),
		mailDir: varchar("mail_dir", { length: 255 }).notNull(),
		quota: bigint("quota", { mode: "number" }).notNull(),
		localPart: varchar("local_part", { length: 255 }).notNull(),
		domain: varchar("domain", { length: 255 })
			.notNull()
			.references(() => domain.domain),
		active: boolean("active").notNull().default(true),
		createdAt: timestamp("created_at").notNull(),
		updatedAt: timestamp("updated_at").notNull(),
	},
	(table) => [
		index("mailbox_idx_mailbox_domain").on(table.domain),
		index("mailbox_idx_mailbox_created_at").on(table.createdAt),
	],
);

export const userAlias = pgTable(
	"user_alias",
	{
		address: varchar("address", { length: 255 }).primaryKey(),
		goto: text("goto").notNull(),
		domain: varchar("domain", { length: 255 })
			.notNull()
			.references(() => domain.domain),
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id),
		active: boolean("active").notNull(),
		createdAt: timestamp("created_at").notNull(),
		updatedAt: timestamp("updated_at").notNull(),
	},
	(table) => [
		index("user_alias_idx_alias_active").on(table.active),
		index("user_alias_idx_alias_domain").on(table.domain),
	],
);

export const aliasDomain = pgTable("alias_domain", {
	aliasDomain: varchar("alias_domain", { length: 255 }).primaryKey(),
	targetDomain: varchar("target_domain", { length: 255 })
		.notNull()
		.references(() => domain.domain),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id),
	active: boolean("active").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const dkimKeys = pgTable(
	"dkim_keys",
	{
		id: varchar("id", { length: 255 })
			.$defaultFn(() => createId())
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id),
		userId: text("user_id")
			.notNull()
			.references(() => user.id),
		aliasDomain: varchar("alias_domain", { length: 255 })
			.notNull()
			.references(() => aliasDomain.aliasDomain),
		selector: varchar("selector", { length: 50 }).notNull(),
		publicKey: text("public_key").notNull(),
		privateKey: text("private_key").notNull(),
		keyLength: integer("key_length").notNull(),
		algorithm: varchar("algorithm", { length: 20 }).notNull(),
		createdAt: timestamp("created_at").notNull(),
		updatedAt: timestamp("updated_at").notNull(),
	},
	(table) => [
		index("dkim_keys_idx_dkim_keys_selector").on(table.selector),
		index("dkim_keys_idx_dkim_keys_domain").on(table.aliasDomain),
	],
);

export const dnsRecord = pgTable("dns_record", {
	id: bigint("id", { mode: "number" }).primaryKey(),
	aliasDomain: varchar("alias_domain", { length: 255 })
		.notNull()
		.references(() => aliasDomain.aliasDomain),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organization.id),
	userId: text("user_id")
		.notNull()
		.references(() => user.id),
	recordType: text("record_type").notNull(),
	name: text("name").notNull(),
	value: text("value").notNull(),
	ttl: bigint("ttl", { mode: "number" }).notNull().default(3600),
	priority: integer("priority"),
	description: text("description"),
	isVerified: boolean("is_verified").notNull(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const domainRelations = relations(domain, ({ many }) => ({
	mailboxes: many(mailbox),
	aliases: many(userAlias),
	aliasDomains: many(aliasDomain),
}));

export const mailboxRelations = relations(mailbox, ({ one }) => ({
	domain: one(domain, {
		fields: [mailbox.domain],
		references: [domain.domain],
	}),
}));

export const userAliasRelations = relations(userAlias, ({ one }) => ({
	domain: one(domain, {
		fields: [userAlias.domain],
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
	aliasDomain: one(aliasDomain, {
		fields: [dkimKeys.aliasDomain],
		references: [aliasDomain.aliasDomain],
	}),
}));

export const dnsRecordRelations = relations(dnsRecord, ({ one }) => ({
	aliasDomain: one(aliasDomain, {
		fields: [dnsRecord.aliasDomain],
		references: [aliasDomain.aliasDomain],
	}),
}));

export const table = {
	user,
	domain,
	mailbox,
	userAlias,
	aliasDomain,
	dkimKeys,
	dnsRecord,
} as const;

export type Table = typeof table;
