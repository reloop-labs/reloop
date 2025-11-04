import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	bigint,
	index,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { domain } from "./domain";

// Custom ID generation function with prefix
const createEmailLogId = () => `eml_${createId()}`;

// Email status enum
export const emailStatusEnum = pgEnum("email_status", [
	"pending",
	"sent",
	"delivered",
	"failed",
	"bounced",
	"spam",
	"archived",
]);

// Email priority enum
export const emailPriorityEnum = pgEnum("email_priority", [
	"low",
	"normal",
	"high",
	"urgent",
]);

// Email sending log table
export const emailLog = pgTable(
	"email_log",
	{
		id: text("id")
			.$defaultFn(() => createEmailLogId())
			.primaryKey(),
		messageId: varchar("message_id", { length: 500 }).notNull().unique(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		domainId: text("domain_id")
			.notNull()
			.references(() => domain.id, { onDelete: "cascade" }),
		fromEmail: varchar("from_email", { length: 255 }).notNull(),
		fromName: varchar("from_name", { length: 255 }),
		toEmails: jsonb("to_emails").$type<string[]>().notNull(),
		ccEmails: jsonb("cc_emails").$type<string[]>(),
		bccEmails: jsonb("bcc_emails").$type<string[]>(),
		replyTo: varchar("reply_to", { length: 255 }),
		subject: text("subject").notNull(),
		textBody: text("text_body"),
		htmlBody: text("html_body"),
		status: emailStatusEnum("status").notNull().default("pending"),
		priority: emailPriorityEnum("priority").notNull().default("normal"),
		errorMessage: text("error_message"),
		provider: varchar("provider", { length: 100 }).notNull().default("postfix"),
		providerMessageId: varchar("provider_message_id", { length: 500 }),
		size: bigint("size", { mode: "number" }).notNull().default(0),
		headers: jsonb("headers").$type<Record<string, string>>(),
		sentAt: timestamp("sent_at"),
		deliveredAt: timestamp("delivered_at"),
		failedAt: timestamp("failed_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("email_log_idx_message_id").on(table.messageId),
		index("email_log_idx_organization_id").on(table.organizationId),
		index("email_log_idx_domain_id").on(table.domainId),
		index("email_log_idx_from_email").on(table.fromEmail),
		index("email_log_idx_status").on(table.status),
		index("email_log_idx_provider").on(table.provider),
		index("email_log_idx_sent_at").on(table.sentAt),
		index("email_log_idx_created_at").on(table.createdAt),
		index("email_log_idx_org_status").on(table.organizationId, table.status),
		index("email_log_idx_domain_status").on(table.domainId, table.status),
	],
);

export const emailLogRelations = relations(emailLog, ({ one }) => ({
	organization: one(organization, {
		fields: [emailLog.organizationId],
		references: [organization.id],
	}),
	domain: one(domain, {
		fields: [emailLog.domainId],
		references: [domain.id],
	}),
}));

export const emailLogTables = {
	emailLog,
} as const;

export type EmailLogTable = typeof emailLogTables;
