import {
	boolean,
	index,
	jsonb,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { organizations, users } from "./auth";

export const emails = pgTable(
	"email",
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
	"email_event",
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
		// biome-ignore lint/suspicious/noExplicitAny: ignore
		metadata: jsonb("metadata").$type<Record<string, any>>(),
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
	"email_template",
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
	"email_domain",
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
	"email_domain_verification",
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
	"email_list",
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
	"email_list_contact",
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
