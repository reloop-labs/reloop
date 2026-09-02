import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";
import { contact } from "./contact";
import { emailLog } from "./email";
import { template } from "./template";

const createCampaignId = () => `cmp_${createId()}`;
const createCampaignRecipientId = () => `crcp_${createId()}`;

export const campaignStatusEnum = pgEnum("campaign_status", [
	"draft",
	"scheduled",
	"sending",
	"sent",
	"cancelled",
]);

export const campaignAudienceTypeEnum = pgEnum("campaign_audience_type", [
	"all",
	"group",
	"channel",
	"csv",
]);

export const campaignRecipientStatusEnum = pgEnum("campaign_recipient_status", [
	"pending",
	"sending",
	"sent",
	"skipped",
	"failed",
]);

export const campaignSkipReasonEnum = pgEnum("campaign_skip_reason", [
	"unsubscribed",
	"blocked",
	"suppressed",
	"duplicate",
	"cancelled",
]);

export const campaign = pgTable(
	"campaign",
	{
		id: text("id")
			.$defaultFn(() => createCampaignId())
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: varchar("name", { length: 255 }).notNull(),
		subject: varchar("subject", { length: 255 }).notNull(),
		previewText: text("preview_text"),
		fromName: varchar("from_name", { length: 255 }).notNull(),
		fromEmail: varchar("from_email", { length: 255 }).notNull(),
		replyTo: varchar("reply_to", { length: 255 }),
		status: campaignStatusEnum("status").notNull().default("draft"),
		audienceType: campaignAudienceTypeEnum("audience_type").notNull(),
		audienceTargetId: text("audience_target_id"),
		audienceTargetName: varchar("audience_target_name", { length: 255 }),
		csvEmails: jsonb("csv_emails").$type<string[]>().notNull().default([]),
		templateId: text("template_id").references(() => template.id, {
			onDelete: "set null",
		}),
		// TipTap JSON document for the visual editor. contentHtml is the
		// composed sendable email and must not be round-tripped into TipTap.
		content: jsonb("content").$type<unknown[]>().notNull().default([]),
		contentHtml: text("content_html").notNull().default(""),
		scheduledAt: timestamp("scheduled_at"),
		startedAt: timestamp("started_at"),
		sentAt: timestamp("sent_at"),
		cancelledAt: timestamp("cancelled_at"),
		recipientCount: integer("recipient_count").notNull().default(0),
		sentCount: integer("sent_count").notNull().default(0),
		deliveredCount: integer("delivered_count").notNull().default(0),
		openedCount: integer("opened_count").notNull().default(0),
		clickedCount: integer("clicked_count").notNull().default(0),
		failedCount: integer("failed_count").notNull().default(0),
		skippedCount: integer("skipped_count").notNull().default(0),
		lastError: text("last_error"),
		deletedAt: timestamp("deleted_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("campaign_idx_organization_id").on(table.organizationId),
		index("campaign_idx_org_status").on(table.organizationId, table.status),
		index("campaign_idx_status_scheduled").on(table.status, table.scheduledAt),
		index("campaign_idx_template_id").on(table.templateId),
	],
);

export const campaignRecipient = pgTable(
	"campaign_recipient",
	{
		id: text("id")
			.$defaultFn(() => createCampaignRecipientId())
			.primaryKey(),
		campaignId: text("campaign_id")
			.notNull()
			.references(() => campaign.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		contactId: text("contact_id").references(() => contact.id, {
			onDelete: "set null",
		}),
		email: varchar("email", { length: 255 }).notNull(),
		status: campaignRecipientStatusEnum("status").notNull().default("pending"),
		skipReason: campaignSkipReasonEnum("skip_reason"),
		emailLogId: text("email_log_id").references(() => emailLog.id, {
			onDelete: "set null",
		}),
		error: text("error"),
		deliveredAt: timestamp("delivered_at"),
		openedAt: timestamp("opened_at"),
		clickedAt: timestamp("clicked_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at")
			.notNull()
			.defaultNow()
			.$onUpdate(() => new Date()),
	},
	(table) => [
		index("campaign_recipient_idx_campaign").on(table.campaignId),
		index("campaign_recipient_idx_campaign_status").on(
			table.campaignId,
			table.status,
		),
		index("campaign_recipient_idx_email_log").on(table.emailLogId),
		index("campaign_recipient_idx_org").on(table.organizationId),
		unique("campaign_recipient_unique_campaign_email").on(
			table.campaignId,
			table.email,
		),
	],
);

export const campaignRelations = relations(campaign, ({ one, many }) => ({
	organization: one(organization, {
		fields: [campaign.organizationId],
		references: [organization.id],
	}),
	createdBy: one(user, {
		fields: [campaign.userId],
		references: [user.id],
	}),
	template: one(template, {
		fields: [campaign.templateId],
		references: [template.id],
	}),
	recipients: many(campaignRecipient),
}));

export const campaignRecipientRelations = relations(
	campaignRecipient,
	({ one }) => ({
		campaign: one(campaign, {
			fields: [campaignRecipient.campaignId],
			references: [campaign.id],
		}),
		contact: one(contact, {
			fields: [campaignRecipient.contactId],
			references: [contact.id],
		}),
		emailLog: one(emailLog, {
			fields: [campaignRecipient.emailLogId],
			references: [emailLog.id],
		}),
	}),
);

export type Campaign = typeof campaign.$inferSelect;
export type NewCampaign = typeof campaign.$inferInsert;
export type CampaignRecipient = typeof campaignRecipient.$inferSelect;
export type NewCampaignRecipient = typeof campaignRecipient.$inferInsert;
