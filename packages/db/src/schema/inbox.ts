import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	bigint,
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	real,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";
import { domain } from "./domain";

// Custom ID generation functions with prefixes
const createMailboxId = () => `mbx_${createId()}`;
const createInboundEmailId = () => `inb_${createId()}`;
const createInboundAttachmentId = () => `inbatt_${createId()}`;

export const mailboxStatusEnum = pgEnum("mailbox_status", [
	"active",
	"disabled",
]);

export const inboundEmailStatusEnum = pgEnum("inbound_email_status", [
	"received",
	"processing",
	"delivered",
	"spam",
	"rejected",
	"failed",
]);

// ─── mailbox ─────────────────────────────────────────────────────────

export const mailbox = pgTable(
	"mailbox",
	{
		id: text("id")
			.$defaultFn(() => createMailboxId())
			.primaryKey(),
		email: varchar("email", { length: 255 }).notNull(),
		password: text("password").notNull(),
		quota: text("quota").notNull().default("5 GB"),
		status: mailboxStatusEnum("status").notNull().default("active"),
		displayName: varchar("display_name", { length: 255 }),
		description: text("description"),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		domainId: text("domain_id")
			.notNull()
			.references(() => domain.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("mailbox_idx_email").on(table.email),
		index("mailbox_idx_organization_id").on(table.organizationId),
		index("mailbox_idx_domain_id").on(table.domainId),
		unique("mailbox_unique_email").on(table.email),
	],
);

// ─── inbound_email ───────────────────────────────────────────────────

export const inboundEmail = pgTable(
	"inbound_email",
	{
		id: text("id")
			.$defaultFn(() => createInboundEmailId())
			.primaryKey(),
		mailboxId: text("mailbox_id")
			.notNull()
			.references(() => mailbox.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),

		// ── Sender / recipients ─────────────────────────────────
		fromEmail: varchar("from_email", { length: 255 }).notNull(),
		fromName: varchar("from_name", { length: 255 }),
		toEmails: text("to_emails").array().notNull(),
		ccEmails: jsonb("cc_emails").$type<string[]>(),
		bccEmails: jsonb("bcc_emails").$type<string[]>(),
		replyTo: varchar("reply_to", { length: 255 }),

		// ── Content ─────────────────────────────────────────────
		subject: text("subject"),
		textBody: text("text_body"),
		htmlBody: text("html_body"),
		snippet: varchar("snippet", { length: 300 }),
		rawMessage: text("raw_message"),
		size: bigint("size", { mode: "number" }).notNull().default(0),

		// ── State ───────────────────────────────────────────────
		status: inboundEmailStatusEnum("status")
			.notNull()
			.default("received"),
		isRead: boolean("is_read").notNull().default(false),
		isStarred: boolean("is_starred").notNull().default(false),
		isSpam: boolean("is_spam").notNull().default(false),
		spamScore: real("spam_score"),

		// ── Threading & headers ─────────────────────────────────
		messageId: text("message_id"), // Original Message-ID header
		threadId: text("thread_id"), // Legacy threading (In-Reply-To / References)
		inReplyTo: text("in_reply_to"), // In-Reply-To header
		references: jsonb("references").$type<string[]>(), // References header
		headers: jsonb("headers").$type<Record<string, string>>(),

		// ── Timestamps ──────────────────────────────────────────
		date: timestamp("date"), // Original Date header from sender
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("inbound_email_idx_mailbox_id").on(table.mailboxId),
		index("inbound_email_idx_organization_id").on(table.organizationId),
		index("inbound_email_idx_from_email").on(table.fromEmail),
		index("inbound_email_idx_created_at").on(table.createdAt),
		index("inbound_email_idx_thread_id").on(table.threadId),
		index("inbound_email_idx_status").on(table.status),
		index("inbound_email_idx_is_spam").on(table.isSpam),
		index("inbound_email_idx_message_id").on(table.messageId),
	],
);

// ─── inbound_attachment ──────────────────────────────────────────────

export const inboundAttachment = pgTable(
	"inbound_attachment",
	{
		id: text("id")
			.$defaultFn(() => createInboundAttachmentId())
			.primaryKey(),
		inboundEmailId: text("inbound_email_id")
			.notNull()
			.references(() => inboundEmail.id, { onDelete: "cascade" }),
		filename: text("filename").notNull(),
		contentType: varchar("content_type", { length: 255 }).notNull(),
		size: integer("size").notNull(),
		storagePath: text("storage_path").notNull(),
		contentDisposition: varchar("content_disposition", { length: 50 }).default(
			"attachment",
		),
		contentId: text("content_id"), // For inline images (cid:xxx references in HTML)
		checksum: varchar("checksum", { length: 128 }), // SHA-256 for dedup/integrity
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("inbound_attachment_idx_inbound_email_id").on(table.inboundEmailId),
	],
);

// ─── Relations ───────────────────────────────────────────────────────

export const mailboxRelations = relations(mailbox, ({ one, many }) => ({
	organization: one(organization, {
		fields: [mailbox.organizationId],
		references: [organization.id],
	}),
	domain: one(domain, {
		fields: [mailbox.domainId],
		references: [domain.id],
	}),
	emails: many(inboundEmail),
}));

export const inboundEmailRelations = relations(
	inboundEmail,
	({ one, many }) => ({
		mailbox: one(mailbox, {
			fields: [inboundEmail.mailboxId],
			references: [mailbox.id],
		}),
		organization: one(organization, {
			fields: [inboundEmail.organizationId],
			references: [organization.id],
		}),
		attachments: many(inboundAttachment),
	}),
);

export const inboundAttachmentRelations = relations(
	inboundAttachment,
	({ one }) => ({
		email: one(inboundEmail, {
			fields: [inboundAttachment.inboundEmailId],
			references: [inboundEmail.id],
		}),
	}),
);

export const inboxTables = {
	mailbox,
	inboundEmail,
	inboundAttachment,
} as const;

export type InboxTable = typeof inboxTables;
