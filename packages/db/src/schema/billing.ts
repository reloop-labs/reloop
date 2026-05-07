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
export const emailEventTypeEnum = pgEnum("email_event_type", [
	"delivered",
	"opened",
	"clicked",
	"bounced",
	"complained",
	"unsubscribed",
	"deferred",
]);
export const invoiceStatusEnum = pgEnum("invoice_status", [
	"draft",
	"open",
	"paid",
	"void",
	"uncollectible",
]);

// ─── Tables ──────────────────────────────────────────────────────────────────

export const plan = pgTable("plan", {
	id: text("id").$defaultFn(() => `pln_${createId()}`).primaryKey(),
	name: varchar("name", { length: 100 }).notNull(),
	monthlyCredits: integer("monthly_credits").notNull(),
	overageLimit: integer("overage_limit").notNull().default(0),
	basePriceUsd: decimal("base_price_usd", { precision: 10, scale: 2 }).notNull(),
	overagePricePerEmail: decimal("overage_price_per_email", { precision: 10, scale: 4 }).notNull().default("0"),
	billingCycle: billingCycleEnum("billing_cycle").notNull().default("monthly"),
	rolloverEnabled: boolean("rollover_enabled").notNull().default(false),
	maxRolloverCredits: integer("max_rollover_credits"),
	isActive: boolean("is_active").notNull().default(true),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscription = pgTable(
	"subscription",
	{
		id: text("id").$defaultFn(() => `sub_${createId()}`).primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id, { onDelete: "cascade" }),
		planId: text("plan_id")
			.notNull()
			.references(() => plan.id),
		status: subscriptionStatusEnum("status").notNull().default("active"),

		// Credit counters
		creditsUsed: integer("credits_used").notNull().default(0),
		creditsRemaining: integer("credits_remaining").notNull().default(0),
		rolloverCredits: integer("rollover_credits").notNull().default(0),
		overageCreditsUsed: integer("overage_credits_used").notNull().default(0),

		// Billing window
		currentPeriodStart: timestamp("current_period_start").notNull(),
		currentPeriodEnd: timestamp("current_period_end").notNull(),

		// External billing provider
		externalSubscriptionId: varchar("external_subscription_id", { length: 255 }).unique(),

		cancelledAt: timestamp("cancelled_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [
		uniqueIndex("subscription_org_active_idx")
			.on(t.organizationId)
			.where(sql`status NOT IN ('cancelled')`),
		index("subscription_organization_id_idx").on(t.organizationId),
		index("subscription_period_idx").on(t.currentPeriodStart, t.currentPeriodEnd),
	]
);

export const creditLedger = pgTable(
	"credit_ledger",
	{
		id: text("id").$defaultFn(() => `cld_${createId()}`).primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id),
		subscriptionId: text("subscription_id")
			.notNull()
			.references(() => subscription.id),
		entryType: ledgerEntryTypeEnum("entry_type").notNull(),
		delta: integer("delta").notNull(),
		balanceAfter: integer("balance_after").notNull(),
		reason: text("reason"),
		referenceId: text("reference_id"), // points to email_send.id or billing_invoice.id
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => [
		index("ledger_organization_id_idx").on(t.organizationId),
		index("ledger_subscription_id_idx").on(t.subscriptionId),
		index("ledger_org_created_idx").on(t.organizationId, t.createdAt),
	]
);

export const emailSend = pgTable(
	"email_send",
	{
		id: text("id").$defaultFn(() => `esn_${createId()}`).primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id),
		subscriptionId: text("subscription_id")
			.notNull()
			.references(() => subscription.id),
		triggeredByUserId: text("triggered_by_user_id")
			.references(() => user.id, { onDelete: "set null" }),

		recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
		subject: varchar("subject", { length: 998 }),
		status: emailSendStatusEnum("status").notNull().default("queued"),

		countedInCredits: boolean("counted_in_credits").notNull().default(false),
		creditsConsumed: integer("credits_consumed").notNull().default(0),

		providerId: varchar("provider_id", { length: 255 }),
		providerName: varchar("provider_name", { length: 100 }),

		sentAt: timestamp("sent_at"),
		skippedAt: timestamp("skipped_at"),
		skipReason: skipReasonEnum("skip_reason"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
	},
	(t) => [
		index("sends_organization_id_idx").on(t.organizationId),
		index("sends_subscription_id_idx").on(t.subscriptionId),
		index("sends_triggered_by_idx").on(t.triggeredByUserId),
		index("sends_org_sent_at_idx").on(t.organizationId, t.sentAt),
		index("sends_org_counted_idx").on(t.organizationId, t.countedInCredits),
	]
);

export const billingInvoice = pgTable(
	"billing_invoice",
	{
		id: text("id").$defaultFn(() => `inv_${createId()}`).primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organization.id),
		subscriptionId: text("subscription_id")
			.notNull()
			.references(() => subscription.id),

		creditsIncluded: integer("credits_included").notNull(),
		creditsUsed: integer("credits_used").notNull(),
		overageCredits: integer("overage_credits").notNull().default(0),

		baseAmountUsd: decimal("base_amount_usd", { precision: 10, scale: 2 }).notNull(),
		overageAmountUsd: decimal("overage_amount_usd", { precision: 10, scale: 2 }).notNull().default("0"),
		totalUsd: decimal("total_usd", { precision: 10, scale: 2 }).notNull(),

		status: invoiceStatusEnum("status").notNull().default("draft"),
		externalInvoiceId: varchar("external_invoice_id", { length: 255 }),

		periodStart: timestamp("period_start").notNull(),
		periodEnd: timestamp("period_end").notNull(),
		paidAt: timestamp("paid_at"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(t) => [
		index("invoices_organization_id_idx").on(t.organizationId),
		index("invoices_subscription_id_idx").on(t.subscriptionId),
		index("invoices_status_idx").on(t.status),
	]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const planRelations = relations(plan, ({ many }) => ({
	subscriptions: many(subscription),
}));

export const subscriptionRelations = relations(subscription, ({ one, many }) => ({
	organization: one(organization, { fields: [subscription.organizationId], references: [organization.id] }),
	plan: one(plan, { fields: [subscription.planId], references: [plan.id] }),
	creditLedger: many(creditLedger),
	emailSends: many(emailSend),
	billingInvoices: many(billingInvoice),
}));

export const creditLedgerRelations = relations(creditLedger, ({ one }) => ({
	organization: one(organization, { fields: [creditLedger.organizationId], references: [organization.id] }),
	subscription: one(subscription, { fields: [creditLedger.subscriptionId], references: [subscription.id] }),
}));

export const emailSendRelations = relations(emailSend, ({ one, many }) => ({
	organization: one(organization, { fields: [emailSend.organizationId], references: [organization.id] }),
	subscription: one(subscription, { fields: [emailSend.subscriptionId], references: [subscription.id] }),
	triggeredBy: one(user, { fields: [emailSend.triggeredByUserId], references: [user.id] }),
	events: many(emailLog),
}));

export const emailEventV2Relations = relations(emailLog, ({ one }) => ({
	organization: one(organization, { fields: [emailLog.organizationId], references: [organization.id] }),
	send: one(emailSend, { fields: [emailLog.id], references: [emailSend.id] }),
}));

export const billingInvoiceRelations = relations(billingInvoice, ({ one }) => ({
	organization: one(organization, { fields: [billingInvoice.organizationId], references: [organization.id] }),
	subscription: one(subscription, { fields: [billingInvoice.subscriptionId], references: [subscription.id] }),
}));
