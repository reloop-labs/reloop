import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	bigint,
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

// AUTH TABLES
export const users = pgTable("users", {
	id: text("id")
		.$defaultFn(() => createId())
		.primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
	role: text("role"),
	banned: boolean("banned").default(false),
	banReason: text("ban_reason"),
	banExpires: timestamp("ban_expires"),
	activeOrganizationId: text("active_organization_id"),
	mode: text("mode").default("dev"),
	username: text("username").unique(),
	password: text("password"),
	salt: text("salt"),
});

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => new Date())
		.notNull(),
});

export const verifications = pgTable("verifications", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const jwkss = pgTable("jwkss", {
	id: text("id").primaryKey(),
	publicKey: text("public_key").notNull(),
	privateKey: text("private_key").notNull(),
	createdAt: timestamp("created_at").notNull(),
});

export const organizations = pgTable("organizations", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").unique(),
	logo: text("logo"),
	createdAt: timestamp("created_at").notNull(),
	metadata: text("metadata"),
});

export const members = pgTable("members", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	role: text("role").default("member").notNull(),
	createdAt: timestamp("created_at").notNull(),
});

export const invitations = pgTable("invitations", {
	id: text("id").primaryKey(),
	organizationId: text("organization_id")
		.notNull()
		.references(() => organizations.id, { onDelete: "cascade" }),
	email: text("email").notNull(),
	role: text("role"),
	status: text("status").default("pending").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	inviterId: text("inviter_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
});

export const apikeys = pgTable("apikeys", {
	id: text("id").primaryKey(),
	name: text("name"),
	start: text("start"),
	prefix: text("prefix"),
	key: text("key").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	refillInterval: integer("refill_interval"),
	refillAmount: integer("refill_amount"),
	lastRefillAt: timestamp("last_refill_at"),
	enabled: boolean("enabled").default(true),
	rateLimitEnabled: boolean("rate_limit_enabled").default(true),
	rateLimitTimeWindow: integer("rate_limit_time_window").default(86400000),
	rateLimitMax: integer("rate_limit_max").default(10),
	requestCount: integer("request_count").default(0),
	remaining: integer("remaining"),
	lastRequest: timestamp("last_request"),
	expiresAt: timestamp("expires_at"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	permissions: text("permissions"),
	metadata: text("metadata"),
	allowedSenders: text("allowed_senders"),
	senderDomain: text("sender_domain"),
});

// MAIL TABLES
export const domains = pgTable(
	"domains",
	{
		domain: varchar("domain", { length: 255 }).primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		mailboxes: integer("mailboxes").notNull(),
		mailboxQuota: bigint("mailbox_quota", { mode: "number" }).notNull(),
		quota: bigint("quota", { mode: "number" }).notNull(),
		rateLimit: integer("rate_limit"),
		active: boolean("active").notNull().default(true),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("domain_idx_domain_active").on(table.active),
		index("domain_idx_domain_created_at").on(table.createdAt),
		index("domain_idx_organization_id").on(table.organizationId),
		index("domain_idx_user_id").on(table.userId),
	],
);

export const mailboxes = pgTable(
	"mailboxes",
	{
		username: varchar("username", { length: 255 }).primaryKey(),
		password: varchar("password", { length: 255 }).notNull(),
		passwordEncode: varchar("password_encode", { length: 255 }).notNull(),
		fullName: varchar("full_name", { length: 255 }).notNull(),
		isAdmin: boolean("is_admin").notNull().default(false),
		maildir: varchar("maildir", { length: 255 }).notNull(),
		quota: bigint("quota", { mode: "number" }).notNull(),
		localPart: varchar("local_part", { length: 255 }).notNull(),
		domain: varchar("domain", { length: 255 })
			.notNull()
			.references(() => domains.domain, { onDelete: "cascade" }),
		active: boolean("active").notNull().default(true),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("mailbox_idx_mailbox_domain").on(table.domain),
		index("mailbox_idx_mailbox_created_at").on(table.createdAt),
		index("mailbox_idx_mailbox_active").on(table.active),
	],
);

export const userAliases = pgTable(
	"user_aliases",
	{
		address: varchar("address", { length: 255 }).primaryKey(),
		goto: text("goto").notNull(),
		domain: varchar("domain", { length: 255 })
			.notNull()
			.references(() => domains.domain, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		active: boolean("active").notNull().default(true),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("user_alias_idx_alias_active").on(table.active),
		index("user_alias_idx_alias_domain").on(table.domain),
		index("user_alias_idx_user_id").on(table.userId),
		index("user_alias_idx_organization_id").on(table.organizationId),
	],
);

export const aliasDomains = pgTable(
	"alias_domains",
	{
		aliasDomain: varchar("alias_domain", { length: 255 }).primaryKey(),
		targetDomain: varchar("target_domain", { length: 255 })
			.notNull()
			.references(() => domains.domain, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		active: boolean("active").notNull().default(true),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("alias_domain_idx_target_domain").on(table.targetDomain),
		index("alias_domain_idx_user_id").on(table.userId),
		index("alias_domain_idx_organization_id").on(table.organizationId),
		index("alias_domain_idx_active").on(table.active),
	],
);

export const dkimKeys = pgTable(
	"dkim_keys",
	{
		id: varchar("id", { length: 255 })
			.$defaultFn(() => createId())
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		aliasDomain: varchar("alias_domain", { length: 255 })
			.notNull()
			.references(() => aliasDomains.aliasDomain, { onDelete: "cascade" }),
		selector: varchar("selector", { length: 50 }).notNull(),
		publicKey: text("public_key").notNull(),
		privateKey: text("private_key").notNull(),
		keyLength: integer("key_length").notNull(),
		algorithm: varchar("algorithm", { length: 20 }).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("dkim_keys_idx_dkim_keys_selector").on(table.selector),
		index("dkim_keys_idx_dkim_keys_domain").on(table.aliasDomain),
		index("dkim_keys_idx_organization_id").on(table.organizationId),
		index("dkim_keys_idx_user_id").on(table.userId),
	],
);

export const dnsRecords = pgTable(
	"dns_records",
	{
		id: bigint("id", { mode: "number" }).primaryKey(),
		aliasDomain: varchar("alias_domain", { length: 255 })
			.notNull()
			.references(() => aliasDomains.aliasDomain, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		recordType: text("record_type").notNull(),
		name: text("name").notNull(),
		value: text("value").notNull(),
		ttl: bigint("ttl", { mode: "number" }).notNull().default(3600),
		priority: integer("priority"),
		description: text("description"),
		isVerified: boolean("is_verified").notNull().default(false),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("dns_records_idx_alias_domain").on(table.aliasDomain),
		index("dns_records_idx_organization_id").on(table.organizationId),
		index("dns_records_idx_user_id").on(table.userId),
		index("dns_records_idx_record_type").on(table.recordType),
		index("dns_records_idx_verified").on(table.isVerified),
	],
);

// EMAIL TABLES
export const emails = pgTable(
	"emails",
	{
		id: text("id").primaryKey(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		from: text("from").notNull(),
		to: text("to").notNull(),
		cc: text("cc"),
		bcc: text("bcc"),
		subject: text("subject").notNull(),
		body: text("body"),
		html: text("html"),
		replyTo: text("reply_to"),
		inReplyTo: text("in_reply_to"),
		references: text("references"),
		attachments: jsonb("attachments").$type<{
			filename: string;
			content: Buffer | string;
			contentType?: string;
			contentId?: string;
			disposition?: "inline" | "attachment";
		}>(),
		headers: jsonb("headers").$type<Record<string, string | string[]>>(),
		tags: jsonb("tags").$type<Record<string, string>>(),
		status: text("status")
			.$type<"queued" | "sending" | "sent" | "failed">()
			.notNull()
			.default("queued"),
		failureReason: text("failure_reason"),
		sentAt: timestamp("sent_at"),
		deliveredAt: timestamp("delivered_at"),
		openedAt: timestamp("opened_at"),
		clickedAt: timestamp("clicked_at"),
		userId: text("user_id").references(() => users.id, {
			onDelete: "set null",
		}),
		organizationId: text("organization_id").references(() => organizations.id, {
			onDelete: "set null",
		}),
	},
	(table) => [
		index("idx_emails_user_id").on(table.userId),
		index("idx_emails_organization_id").on(table.organizationId),
		index("idx_emails_status").on(table.status),
		index("idx_emails_sent_at").on(table.sentAt),
	],
);

export const email_events = pgTable(
	"email_events",
	{
		id: text("id").primaryKey(),
		emailId: text("email_id")
			.notNull()
			.references(() => emails.id, { onDelete: "cascade" }),
		type: text("type")
			.$type<
				"queued" | "sent" | "delivered" | "opened" | "clicked" | "failed"
			>()
			.notNull(),
		occurredAt: timestamp("occurred_at").notNull().defaultNow(),
		metadata: jsonb("metadata").$type<Record<string, unknown>>(),
		organizationId: text("organization_id").references(() => organizations.id, {
			onDelete: "set null",
		}),
	},
	(table) => [
		index("idx_email_events_email_id").on(table.emailId),
		index("idx_email_events_type").on(table.type),
		index("idx_email_events_occurred_at").on(table.occurredAt),
		index("idx_email_events_organization_id").on(table.organizationId),
	],
);

export const email_templates = pgTable(
	"email_templates",
	{
		id: text("id").primaryKey(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		name: text("name").notNull(),
		subject: text("subject").notNull(),
		body: text("body"),
		html: text("html"),
		variables: jsonb("variables").$type<string[]>(),
		userId: text("user_id").references(() => users.id, {
			onDelete: "set null",
		}),
		organizationId: text("organization_id").references(() => organizations.id, {
			onDelete: "set null",
		}),
	},
	(table) => [
		index("idx_email_templates_user_id").on(table.userId),
		index("idx_email_templates_organization_id").on(table.organizationId),
		index("idx_email_templates_name_org_id").on(
			table.name,
			table.organizationId,
		),
	],
);

export const email_domains = pgTable(
	"email_domains",
	{
		id: text("id").primaryKey(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		name: text("name").notNull(),
		verificationToken: text("verification_token"),
		verificationStatus: text("verification_status")
			.$type<"pending" | "verified">()
			.default("pending"),
		dkimPublicKey: text("dkim_public_key"),
		dkimPrivateKey: text("dkim_private_key"),
		spfStatus: text("spf_status")
			.$type<"pending" | "verified">()
			.default("pending"),
		mxStatus: text("mx_status")
			.$type<"pending" | "verified">()
			.default("pending"),
		region: text("region"),
		isDefault: boolean("is_default").default(false),
		userId: text("user_id").references(() => users.id, {
			onDelete: "set null",
		}),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("idx_email_domains_user_id").on(table.userId),
		index("idx_email_domains_organization_id").on(table.organizationId),
		index("idx_email_domains_name_unique").on(table.name),
		index("idx_email_domains_verification_status").on(table.verificationStatus),
	],
);

export const email_domain_verifications = pgTable(
	"email_domain_verifications",
	{
		id: text("id").primaryKey(),
		domainId: text("domain_id")
			.notNull()
			.references(() => email_domains.id, { onDelete: "cascade" }),
		recordType: text("record_type").$type<"TXT" | "CNAME">().notNull(),
		name: text("name").notNull(),
		value: text("value").notNull(),
		status: text("status").$type<"pending" | "verified">().default("pending"),
		lastCheckedAt: timestamp("last_checked_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("idx_email_domain_verifications_domain_id").on(table.domainId),
		index("idx_email_domain_verifications_status").on(table.status),
	],
);

export const email_lists = pgTable(
	"email_lists",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		description: text("description"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		index("idx_email_lists_organization_id").on(table.organizationId),
		index("idx_email_lists_name_org_id").on(table.name, table.organizationId),
	],
);

export const email_list_contacts = pgTable(
	"email_list_contacts",
	{
		listId: text("list_id")
			.notNull()
			.references(() => email_lists.id, { onDelete: "cascade" }),
		email: text("email").notNull(),
		subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
		unsubscribedAt: timestamp("unsubscribed_at"),
		status: text("status")
			.$type<"subscribed" | "unsubscribed" | "pending">()
			.notNull()
			.default("subscribed"),
	},
	(table) => [
		index("idx_email_list_contacts_list_id").on(table.listId),
		index("idx_email_list_contacts_email").on(table.email),
	],
);

// AUDIENCE TABLES
export const audience = pgTable(
	"audience",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		email: text("email").notNull(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
		apiKeyId: text("api_key_id")
			.notNull()
			.references(() => apikeys.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("idx_audience_organization_id").on(table.organizationId),
		index("idx_audience_email_org_id").on(table.email, table.organizationId),
		index("idx_audience_user_id").on(table.userId),
		index("idx_audience_api_key_id").on(table.apiKeyId),
	],
);

// RELATIONS
export const domainRelations = relations(domains, ({ many, one }) => ({
	mailboxes: many(mailboxes),
	aliases: many(userAliases),
	aliasDomains: many(aliasDomains),
	user: one(users, {
		fields: [domains.userId],
		references: [users.id],
	}),
	organization: one(organizations, {
		fields: [domains.organizationId],
		references: [organizations.id],
	}),
}));

export const mailboxRelations = relations(mailboxes, ({ one }) => ({
	domain: one(domains, {
		fields: [mailboxes.domain],
		references: [domains.domain],
	}),
}));

export const userAliasRelations = relations(userAliases, ({ one }) => ({
	domain: one(domains, {
		fields: [userAliases.domain],
		references: [domains.domain],
	}),
	user: one(users, {
		fields: [userAliases.userId],
		references: [users.id],
	}),
	organization: one(organizations, {
		fields: [userAliases.organizationId],
		references: [organizations.id],
	}),
}));

export const aliasDomainRelations = relations(
	aliasDomains,
	({ one, many }) => ({
		targetDomain: one(domains, {
			fields: [aliasDomains.targetDomain],
			references: [domains.domain],
		}),
		user: one(users, {
			fields: [aliasDomains.userId],
			references: [users.id],
		}),
		organization: one(organizations, {
			fields: [aliasDomains.organizationId],
			references: [organizations.id],
		}),
		dkimKeys: many(dkimKeys),
		dnsRecords: many(dnsRecords),
	}),
);

export const dkimKeysRelations = relations(dkimKeys, ({ one }) => ({
	aliasDomain: one(aliasDomains, {
		fields: [dkimKeys.aliasDomain],
		references: [aliasDomains.aliasDomain],
	}),
	user: one(users, {
		fields: [dkimKeys.userId],
		references: [users.id],
	}),
	organization: one(organizations, {
		fields: [dkimKeys.organizationId],
		references: [organizations.id],
	}),
}));

export const dnsRecordRelations = relations(dnsRecords, ({ one }) => ({
	aliasDomain: one(aliasDomains, {
		fields: [dnsRecords.aliasDomain],
		references: [aliasDomains.aliasDomain],
	}),
	user: one(users, {
		fields: [dnsRecords.userId],
		references: [users.id],
	}),
	organization: one(organizations, {
		fields: [dnsRecords.organizationId],
		references: [organizations.id],
	}),
}));

// LEGACY TABLE OBJECT FOR BACKWARD COMPATIBILITY
export const table = {
	users,
	user: users,
	accounts,
	account: accounts,
	verifications,
	verification: verifications,
	sessions,
	organizations,
	organization: organizations,
	members,
	member: members,
	invitations,
	invitation: invitations,
	apikeys,
	apikey: apikeys,
	jwkss,
	jwks: jwkss,
	domains,
	domain: domains,
	mailboxes,
	mailbox: mailboxes,
	userAliases,
	userAlias: userAliases,
	aliasDomains,
	aliasDomain: aliasDomains,
	dkimKeys,
	dnsRecords,
	dnsRecord: dnsRecords,
	emails,
	email_events,
	email_templates,
	email_domains,
	email_domain_verifications,
	email_lists,
	email_list_contacts,
	audience,
} as const;

export type Table = typeof table;
