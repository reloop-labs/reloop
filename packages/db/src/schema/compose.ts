import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	index,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { mailbox } from "./inbox";

const createComposeDraftId = () => `cdrft_${createId()}`;
const createPendingOutboundId = () => `pout_${createId()}`;

export const pendingOutboundStatusEnum = pgEnum("pending_outbound_status", [
	"pending",
	"sending",
	"cancelled",
	"sent",
	"failed",
]);

export const composeDraftKindEnum = pgEnum("compose_draft_kind", [
	"compose",
	"reply",
	"reply_all",
	"forward",
]);

export const composeDraft = pgTable(
	"compose_draft",
	{
		id: text("id")
			.$defaultFn(() => createComposeDraftId())
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		mailboxId: text("mailbox_id")
			.notNull()
			.references(() => mailbox.id, { onDelete: "cascade" }),
		kind: composeDraftKindEnum("kind").notNull().default("compose"),
		threadId: text("thread_id"),
		inReplyToMessageId: text("in_reply_to_message_id"),
		to: jsonb("to").$type<string[]>().notNull().default([]),
		cc: jsonb("cc").$type<string[]>().notNull().default([]),
		bcc: jsonb("bcc").$type<string[]>().notNull().default([]),
		subject: text("subject").notNull().default(""),
		html: text("html").notNull().default(""),
		text: text("text").notNull().default(""),
		attachments: jsonb("attachments")
			.$type<
				Array<{
					id?: string;
					filename?: string;
					path?: string;
					url?: string;
					content_type?: string;
					size?: string;
				}>
			>()
			.notNull()
			.default([]),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("compose_draft_idx_org").on(table.organizationId),
		index("compose_draft_idx_mailbox").on(table.mailboxId),
		index("compose_draft_idx_updated").on(table.updatedAt),
		index("compose_draft_idx_mailbox_thread_kind").on(
			table.mailboxId,
			table.threadId,
			table.kind,
		),
	],
);

export const pendingOutboundEmail = pgTable(
	"pending_outbound_email",
	{
		id: text("id")
			.$defaultFn(() => createPendingOutboundId())
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		mailboxId: text("mailbox_id")
			.notNull()
			.references(() => mailbox.id, { onDelete: "cascade" }),
		status: pendingOutboundStatusEnum("status").notNull().default("pending"),
		sendAt: timestamp("send_at").notNull(),
		payload: jsonb("payload")
			.$type<{
				to: string | string[];
				subject: string;
				text?: string;
				html?: string;
				cc?: string | string[];
				bcc?: string | string[];
				attachments?: Array<{
					content?: string;
					filename?: string;
					path?: string;
					content_type?: string;
					content_id?: string;
				}>;
				threadId?: string;
				headers?: Record<string, string>;
				/** Authenticated composer; used when the cron flushes to mail. */
				userId?: string;
			}>()
			.notNull(),
		error: text("error"),
		mailMessageId: text("mail_message_id"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("pending_outbound_idx_org").on(table.organizationId),
		index("pending_outbound_idx_status_send_at").on(table.status, table.sendAt),
	],
);

export const composeDraftRelations = relations(composeDraft, ({ one }) => ({
	organization: one(organization, {
		fields: [composeDraft.organizationId],
		references: [organization.id],
	}),
	mailbox: one(mailbox, {
		fields: [composeDraft.mailboxId],
		references: [mailbox.id],
	}),
}));

export const pendingOutboundEmailRelations = relations(
	pendingOutboundEmail,
	({ one }) => ({
		organization: one(organization, {
			fields: [pendingOutboundEmail.organizationId],
			references: [organization.id],
		}),
		mailbox: one(mailbox, {
			fields: [pendingOutboundEmail.mailboxId],
			references: [mailbox.id],
		}),
	}),
);
