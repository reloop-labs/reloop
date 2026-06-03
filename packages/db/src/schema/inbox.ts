import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgEnum,
	pgTable,
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
		fromEmail: varchar("from_email", { length: 255 }).notNull(),
		toEmails: text("to_emails").array().notNull(),
		subject: text("subject"),
		textBody: text("text_body"),
		htmlBody: text("html_body"),
		rawMessage: text("raw_message"),
		isRead: boolean("is_read").notNull().default(false),
		isStarred: boolean("is_starred").notNull().default(false),
		messageId: text("message_id"), // Original message ID header
		threadId: text("thread_id"), // For threading (In-Reply-To / References)
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("inbound_email_idx_mailbox_id").on(table.mailboxId),
		index("inbound_email_idx_organization_id").on(table.organizationId),
		index("inbound_email_idx_from_email").on(table.fromEmail),
		index("inbound_email_idx_created_at").on(table.createdAt),
		index("inbound_email_idx_thread_id").on(table.threadId),
	],
);

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
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("inbound_attachment_idx_inbound_email_id").on(table.inboundEmailId),
	],
);

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

export const inboundEmailRelations = relations(inboundEmail, ({ one, many }) => ({
	mailbox: one(mailbox, {
		fields: [inboundEmail.mailboxId],
		references: [mailbox.id],
	}),
	organization: one(organization, {
		fields: [inboundEmail.organizationId],
		references: [organization.id],
	}),
	attachments: many(inboundAttachment),
}));

export const inboundAttachmentRelations = relations(inboundAttachment, ({ one }) => ({
	email: one(inboundEmail, {
		fields: [inboundAttachment.inboundEmailId],
		references: [inboundEmail.id],
	}),
}));

export const inboxTables = {
	mailbox,
	inboundEmail,
	inboundAttachment,
} as const;

export type InboxTable = typeof inboxTables;
