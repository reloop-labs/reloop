import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
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
const createLabelId = () => `lbl_${createId()}`;
const createNoteId = () => `note_${createId()}`;

// Enums
export const threadStatusEnum = pgEnum("thread_status", [
	"active",
	"archived",
	"closed",
	"trash",
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
		isImportant: boolean("is_important").notNull().default(false),
		isPinned: boolean("is_pinned").notNull().default(false),
		pinnedAt: timestamp("pinned_at"),
		deletedAt: timestamp("deleted_at"),
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
		index("email_thread_idx_is_important").on(table.isImportant),
		index("email_thread_idx_mailbox_is_pinned").on(
			table.mailboxId,
			table.isPinned,
		),
	],
);

// ─── email_label ─────────────────────────────────────────────────────
export const emailLabel = pgTable(
	"email_label",
	{
		id: text("id")
			.$defaultFn(() => createLabelId())
			.primaryKey(),
		mailboxId: text("mailbox_id")
			.notNull()
			.references(() => mailbox.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 100 }).notNull(),
		color: varchar("color", { length: 32 }).notNull().default("default"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("email_label_idx_mailbox_id").on(table.mailboxId),
		index("email_label_idx_organization_id").on(table.organizationId),
	],
);

// ─── thread_label ────────────────────────────────────────────────────
export const threadLabel = pgTable(
	"thread_label",
	{
		threadId: text("thread_id")
			.notNull()
			.references(() => emailThread.id, { onDelete: "cascade" }),
		labelId: text("label_id")
			.notNull()
			.references(() => emailLabel.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(table) => [
		primaryKey({ columns: [table.threadId, table.labelId] }),
		index("thread_label_idx_thread_id").on(table.threadId),
		index("thread_label_idx_label_id").on(table.labelId),
	],
);

// ─── thread_note ─────────────────────────────────────────────────────
export const threadNote = pgTable(
	"thread_note",
	{
		id: text("id")
			.$defaultFn(() => createNoteId())
			.primaryKey(),
		threadId: text("thread_id")
			.notNull()
			.references(() => emailThread.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		content: text("content").notNull(),
		color: varchar("color", { length: 32 }).notNull().default("default"),
		isPinned: boolean("is_pinned").notNull().default(false),
		order: integer("order").notNull().default(0),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("thread_note_idx_thread_id").on(table.threadId),
		index("thread_note_idx_organization_id").on(table.organizationId),
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
	labels: many(threadLabel),
	notes: many(threadNote),
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

export const emailLabelRelations = relations(emailLabel, ({ one, many }) => ({
	mailbox: one(mailbox, {
		fields: [emailLabel.mailboxId],
		references: [mailbox.id],
	}),
	organization: one(organization, {
		fields: [emailLabel.organizationId],
		references: [organization.id],
	}),
	threads: many(threadLabel),
}));

export const threadLabelRelations = relations(threadLabel, ({ one }) => ({
	thread: one(emailThread, {
		fields: [threadLabel.threadId],
		references: [emailThread.id],
	}),
	label: one(emailLabel, {
		fields: [threadLabel.labelId],
		references: [emailLabel.id],
	}),
}));

export const threadNoteRelations = relations(threadNote, ({ one }) => ({
	thread: one(emailThread, {
		fields: [threadNote.threadId],
		references: [emailThread.id],
	}),
	organization: one(organization, {
		fields: [threadNote.organizationId],
		references: [organization.id],
	}),
}));

// ─── Exports ─────────────────────────────────────────────────────────

export const threadTables = {
	emailThread,
	threadMessage,
	emailLabel,
	threadLabel,
	threadNote,
} as const;

export type ThreadTable = typeof threadTables;
