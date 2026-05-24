import { createId } from "@paralleldrive/cuid2";
import { relations, sql } from "drizzle-orm";
import {
	boolean,
	decimal,
	index,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { organization, user } from "./auth";
import { emailLog } from "./email";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const billingCycleEnum = pgEnum("billing_cycle", ["monthly", "annual"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
	"active",
	"past_due",
	"cancelled",
	"trialing",
	"paused",
]);
export const ledgerEntryTypeEnum = pgEnum("ledger_entry_type", [
	"credit_purchased",
	"email_sent",
	"rollover_applied",
	"manual_adjustment",
	"refund",
	"plan_change",
	"period_reset",
]);
export const emailSendStatusEnum = pgEnum("email_send_status", [
	"queued",
	"sent",
	"skipped",
	"failed",
	"bounced",
]);
export const skipReasonEnum = pgEnum("skip_reason", [
	"over_limit",
	"unsubscribed",
	"duplicate",
	"invalid_address",
	"suppressed",
	"dry_run",
]);
export const invoiceStatusEnum = pgEnum("invoice_status", [
	"draft",
	"open",
	"paid",
	"void",
	"uncollectible",
]);

// ─── Tables ──────────────────────────────────────────────────────────────────

export const organizationCredits = pgTable(
	"organization_credits",
	{
		id: text("id")
			.$defaultFn(() => `ocr_${createId()}`)
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		creditsUsed: integer("credits_used").notNull().default(0),
		creditsRemaining: integer("credits_remaining").notNull().default(3000),
		monthlyCredits: integer("monthly_credits").notNull().default(3000),
		currentPeriodStart: timestamp("current_period_start")
			.notNull()
			.defaultNow(),
		currentPeriodEnd: timestamp("current_period_end").notNull(),
		status: varchar("status", { length: 50 }).notNull().default("active"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [
		uniqueIndex("org_credits_organization_id_idx").on(t.organizationId),
		index("org_credits_period_idx").on(
			t.currentPeriodStart,
			t.currentPeriodEnd,
		),
	],
);

export const creditLedger = pgTable(
	"credit_ledger",
	{
		id: text("id")
			.$defaultFn(() => `cld_${createId()}`)
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		organizationCreditsId: text("organization_credits_id")
			.notNull()
			.references(() => organizationCredits.id, { onDelete: "cascade" }),
		entryType: ledgerEntryTypeEnum("entry_type").notNull(),
		delta: integer("delta").notNull(),
		balanceAfter: integer("balance_after").notNull(),
		reason: text("reason"),
		referenceId: text("reference_id"), // points to email_send.id
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => [
		index("ledger_organization_id_idx").on(t.organizationId),
		index("ledger_credits_id_idx").on(t.organizationCreditsId),
		index("ledger_org_created_idx").on(t.organizationId, t.createdAt),
	],
);

export const emailSend = pgTable(
	"email_send",
	{
		id: text("id")
			.$defaultFn(() => `esn_${createId()}`)
			.primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		organizationCreditsId: text("organization_credits_id")
			.notNull()
			.references(() => organizationCredits.id, { onDelete: "cascade" }),
		emailLogId: text("email_log_id").references(() => emailLog.id),
		recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
		countedInCredits: boolean("counted_in_credits").notNull().default(true),
		creditsConsumed: integer("credits_consumed").notNull().default(1),
		status: emailSendStatusEnum("status").notNull().default("queued"),
		errorMessage: text("error_message"),
		sentAt: timestamp("sent_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => [
		index("email_send_organization_id_idx").on(t.organizationId),
		index("email_send_credits_id_idx").on(t.organizationCreditsId),
		index("email_send_status_idx").on(t.status),
	],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const organizationCreditsRelations = relations(
	organizationCredits,
	({ one, many }) => ({
		organization: one(organization, {
			fields: [organizationCredits.organizationId],
			references: [organization.id],
		}),
		creditLedger: many(creditLedger),
		emailSends: many(emailSend),
	}),
);

export const creditLedgerRelations = relations(creditLedger, ({ one }) => ({
	organization: one(organization, {
		fields: [creditLedger.organizationId],
		references: [organization.id],
	}),
	organizationCredits: one(organizationCredits, {
		fields: [creditLedger.organizationCreditsId],
		references: [organizationCredits.id],
	}),
}));

export const emailSendRelations = relations(emailSend, ({ one }) => ({
	organization: one(organization, {
		fields: [emailSend.organizationId],
		references: [organization.id],
	}),
	organizationCredits: one(organizationCredits, {
		fields: [emailSend.organizationCreditsId],
		references: [organizationCredits.id],
	}),
	emailLog: one(emailLog, {
		fields: [emailSend.emailLogId],
		references: [emailLog.id],
	}),
}));
