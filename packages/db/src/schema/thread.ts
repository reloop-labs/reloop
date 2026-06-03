import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { emailLog } from "./email";
import { inboundEmail, mailbox } from "./inbox";

// Custom ID generation functions with prefixes
const createThreadId = () => `thr_${createId()}`;
const createThreadMessageId = () => `tmsg_${createId()}`;

// Enums
export const threadStatusEnum = pgEnum("thread_status", [
	"active",
	"archived",
	"closed",
]);

export const messageDirectionEnum = pgEnum("message_direction", [
	"inbound",
	"outbound",
]);

// ─── email_thread ────────────────────────────────────────────────────
// Represents a conversation. Created when the first message in a
// thread arrives (inbound) or is sent from a mailbox (outbound).
export const emailThread = pgTable(
	"email_thread",
	{
		id: text("id")
			.$defaultFn(() => createThreadId())
			.primaryKey(),
		mailboxId: text("mailbox_id").references(() => mailbox.id, {
			onDelete: "cascade",
		}),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		subject: text("subject"),
		lastMessagePreview: text("last_message_preview"),
		lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
		status: threadStatusEnum("status").notNull().default("active"),
		messageCount: integer("message_count").notNull().default(0),
		participants: jsonb("participants").$type<string[]>().default([]),
		isRead: boolean("is_read").notNull().default(false),
		isStarred: boolean("is_starred").notNull().default(false),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("email_thread_idx_mailbox_id").on(table.mailboxId),
		index("email_thread_idx_organization_id").on(table.organizationId),
		index("email_thread_idx_last_message_at").on(table.lastMessageAt),
		index("email_thread_idx_status").on(table.status),
		index("email_thread_idx_org_status").on(table.organizationId, table.status),
		index("email_thread_idx_mailbox_last_msg").on(
			table.mailboxId,
			table.lastMessageAt,
		),
	],
);

// ─── thread_message ──────────────────────────────────────────────────
// Links an individual email (inbound OR outbound) to a thread.
// Exactly one of inboundEmailId / emailLogId must be non-null.
export const threadMessage = pgTable(
	"thread_message",
	{
		id: text("id")
			.$defaultFn(() => createThreadMessageId())
			.primaryKey(),
		threadId: text("thread_id")
			.notNull()
			.references(() => emailThread.id, { onDelete: "cascade" }),
		direction: messageDirectionEnum("direction").notNull(),
		inboundEmailId: text("inbound_email_id").references(() => inboundEmail.id, {
			onDelete: "cascade",
		}),
		emailLogId: text("email_log_id").references(() => emailLog.id, {
			onDelete: "cascade",
		}),
		fromEmail: varchar("from_email", { length: 255 }).notNull(),
		fromName: varchar("from_name", { length: 255 }),
		subject: text("subject"),
		preview: text("preview"),
		messageAt: timestamp("message_at").notNull().defaultNow(),
		rfc822MessageId: text("rfc822_message_id"),
		inReplyTo: text("in_reply_to"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		index("thread_message_idx_thread_id").on(table.threadId),
		index("thread_message_idx_inbound_email_id").on(table.inboundEmailId),
		index("thread_message_idx_email_log_id").on(table.emailLogId),
		index("thread_message_idx_rfc822_message_id").on(table.rfc822MessageId),
		index("thread_message_idx_thread_message_at").on(
			table.threadId,
			table.messageAt,
		),
	],
);

// ─── Relations ───────────────────────────────────────────────────────

export const emailThreadRelations = relations(emailThread, ({ one, many }) => ({
	mailbox: one(mailbox, {
		fields: [emailThread.mailboxId],
		references: [mailbox.id],
	}),
	organization: one(organization, {
		fields: [emailThread.organizationId],
		references: [organization.id],
	}),
	messages: many(threadMessage),
}));

export const threadMessageRelations = relations(threadMessage, ({ one }) => ({
	thread: one(emailThread, {
		fields: [threadMessage.threadId],
		references: [emailThread.id],
	}),
	inboundEmail: one(inboundEmail, {
		fields: [threadMessage.inboundEmailId],
		references: [inboundEmail.id],
	}),
	emailLog: one(emailLog, {
		fields: [threadMessage.emailLogId],
		references: [emailLog.id],
	}),
}));

// ─── Exports ─────────────────────────────────────────────────────────

export const threadTables = {
	emailThread,
	threadMessage,
} as const;

export type ThreadTable = typeof threadTables;
