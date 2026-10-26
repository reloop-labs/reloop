import {
	applyPlanChange,
	closePeriodSnapshot,
	type PlanId,
	type PlanLimits,
} from "@reloop/pricing";
import { eq } from "drizzle-orm";
import { addMonthsUtc } from "./billing-period";
import { type DatabaseInstance, db } from "./client";
import { syncInboxesToPlanCap } from "./inbox-plan-cap";
import {
	billingPeriod,
	creditLedger,
	organizationCredits,
	organizationPlan,
	type organizationSubscription,
} from "./schema";

/**
 * Plan changes shared by billing (Polar webhooks) and the admin console, so
 * a downgrade from either side closes the period, resets credits and pauses
 * over-cap inboxes the same way.
 */

export type OrgBillingRow = {
	plan: typeof organizationPlan.$inferSelect;
	subscription: typeof organizationSubscription.$inferSelect;
	credits: typeof organizationCredits.$inferSelect;
};

export function nextMonth(from: Date): Date {
	return addMonthsUtc(from, 1);
}

export function limitsFromRow(
	row: typeof organizationPlan.$inferSelect,
): PlanLimits {
	return {
		planId: row.planId,
		monthlyEmails: row.monthlyEmails,
		dailyEmailLimit: row.dailyEmailLimit,
		overageEnabled: row.overageEnabled,
		maxAgentInboxes: row.maxAgentInboxes,
		maxWebhooks: row.maxWebhooks,
		maxCustomDomains: row.maxCustomDomains,
		maxAttachmentBytes: row.maxAttachmentBytes,
		dataRetentionDays: row.dataRetentionDays,
		dedicatedIpCount: row.dedicatedIpCount,
		maxSmtpProviders: row.maxSmtpProviders,
	};
}

function planValues(limits: PlanLimits) {
	return {
		planId: limits.planId,
		monthlyEmails: limits.monthlyEmails,
		dailyEmailLimit: limits.dailyEmailLimit,
		overageEnabled: limits.overageEnabled,
		maxAgentInboxes: limits.maxAgentInboxes,
		maxWebhooks: limits.maxWebhooks,
		maxCustomDomains: limits.maxCustomDomains,
		maxAttachmentBytes: limits.maxAttachmentBytes,
		dataRetentionDays: limits.dataRetentionDays,
		dedicatedIpCount: limits.dedicatedIpCount,
		maxSmtpProviders: limits.maxSmtpProviders,
		updatedAt: new Date(),
	};
}

export async function applyLimitsToOrgPlan(
	orgId: string,
	limits: PlanLimits,
	tx: DatabaseInstance,
): Promise<typeof organizationPlan.$inferSelect> {
	const existing = await tx.query.organizationPlan.findFirst({
		where: eq(organizationPlan.organizationId, orgId),
	});
	if (existing) {
		const [updated] = await tx
			.update(organizationPlan)
			.set(planValues(limits))
			.where(eq(organizationPlan.id, existing.id))
			.returning();
		if (!updated) throw new Error("Failed to update organization plan");
		if (updated.maxAgentInboxes !== existing.maxAgentInboxes) {
			await syncInboxesToPlanCap({
				organizationId: orgId,
				maxAgentInboxes: updated.maxAgentInboxes,
				tx,
			});
		}
		return updated;
	}

	const [created] = await tx
		.insert(organizationPlan)
		.values({
			organizationId: orgId,
			...planValues(limits),
		})
		.returning();
	if (!created) throw new Error("Failed to create organization plan");
	return created;
}

export async function changeOrgPlan(args: {
	organizationId: string;
	nextPlanId: PlanId;
	tx?: DatabaseInstance;
}): Promise<PlanLimits> {
	const client = args.tx ?? db;
	const currentRow = await client.query.organizationPlan.findFirst({
		where: eq(organizationPlan.organizationId, args.organizationId),
	});
	const next = applyPlanChange({
		current: currentRow ? limitsFromRow(currentRow) : null,
		nextPlanId: args.nextPlanId,
	});
	const saved = await applyLimitsToOrgPlan(args.organizationId, next, client);
	return limitsFromRow(saved);
}

export async function closeBillingPeriod(args: {
	organizationId: string;
	periodStart: Date;
	periodEnd: Date;
	planId: PlanId;
	includedEmails: number;
	emailsUsed: number;
	polarOrderId?: string | null;
	tx?: DatabaseInstance;
}): Promise<void> {
	const client = args.tx ?? db;
	const snapshot = closePeriodSnapshot({
		includedEmails: args.includedEmails,
		emailsUsed: args.emailsUsed,
	});
	await client
		.insert(billingPeriod)
		.values({
			organizationId: args.organizationId,
			planId: args.planId,
			periodStart: args.periodStart,
			periodEnd: args.periodEnd,
			includedEmails: snapshot.includedEmails,
			emailsUsed: snapshot.emailsUsed,
			emailsOverage: snapshot.emailsOverage,
			polarOrderId: args.polarOrderId ?? null,
		})
		.onConflictDoNothing();
}

export async function refillCreditsFromPlan(args: {
	creditsId: string;
	organizationId: string;
	monthlyEmails: number;
	periodStart: Date;
	periodEnd: Date;
	tx: DatabaseInstance;
}): Promise<typeof organizationCredits.$inferSelect> {
	const now = new Date();
	const [updated] = await args.tx
		.update(organizationCredits)
		.set({
			creditsUsed: 0,
			creditsRemaining: args.monthlyEmails,
			monthlyCredits: args.monthlyEmails,
			currentPeriodStart: args.periodStart,
			currentPeriodEnd: args.periodEnd,
			updatedAt: now,
		})
		.where(eq(organizationCredits.id, args.creditsId))
		.returning();
	if (!updated) throw new Error("Failed to refill organization credits");

	await args.tx.insert(creditLedger).values({
		organizationId: args.organizationId,
		organizationCreditsId: args.creditsId,
		entryType: "period_reset",
		delta: args.monthlyEmails,
		balanceAfter: args.monthlyEmails,
		reason: "Monthly credit reset (unused emails do not roll over)",
	});
	return updated;
}

/** True while the org holds pay-as-you-go credits that have not expired. */
export function hasActivePrepaid(
	credits: typeof organizationCredits.$inferSelect,
	now: Date,
): boolean {
	return credits.prepaidExpiresAt != null && credits.prepaidExpiresAt > now;
}

/**
 * Subscription ended (revoked / canceled at period end): record the paid
 * period, move the org to the free plan (Pay as you go while it still holds
 * prepaid credits) and start a fresh period. No-op on the plan when the org
 * is already there (duplicate webhooks).
 */
export async function downgradeOrgToFree(args: {
	billing: OrgBillingRow;
	tx: DatabaseInstance;
	now?: Date;
}): Promise<{
	downgraded: boolean;
	planId: PlanId;
	periodStart: Date;
	periodEnd: Date;
}> {
	const { billing, tx } = args;
	const now = args.now ?? new Date();
	const fallbackPlanId: PlanId = hasActivePrepaid(billing.credits, now)
		? "payg"
		: "free";

	if (billing.plan.planId === fallbackPlanId) {
		return {
			downgraded: false,
			planId: fallbackPlanId,
			periodStart: billing.credits.currentPeriodStart,
			periodEnd: billing.credits.currentPeriodEnd,
		};
	}

	const paidPeriodEnd =
		now < billing.credits.currentPeriodEnd
			? now
			: billing.credits.currentPeriodEnd;
	await closeBillingPeriod({
		organizationId: billing.plan.organizationId,
		periodStart: billing.credits.currentPeriodStart,
		periodEnd: paidPeriodEnd,
		planId: billing.plan.planId,
		includedEmails: billing.credits.monthlyCredits,
		emailsUsed: billing.credits.creditsUsed,
		tx,
	});

	const free = await changeOrgPlan({
		organizationId: billing.plan.organizationId,
		nextPlanId: fallbackPlanId,
		tx,
	});

	const periodStart = now;
	const periodEnd = nextMonth(now);
	await refillCreditsFromPlan({
		creditsId: billing.credits.id,
		organizationId: billing.plan.organizationId,
		monthlyEmails: free.monthlyEmails,
		periodStart,
		periodEnd,
		tx,
	});

	return { downgraded: true, planId: fallbackPlanId, periodStart, periodEnd };
}
