import { type DatabaseInstance, db } from "@reloop/db/client";
import {
	billingPeriod,
	creditLedger,
	member,
	organization,
	organizationCredits,
	organizationPlan,
	organizationSubscription,
	user,
} from "@reloop/db/schema";
import {
	applyPlanChange,
	closePeriodSnapshot,
	getPlanLimits,
	type PlanId,
	type PlanLimits,
} from "@reloop/pricing";
import { and, eq } from "drizzle-orm";
import { log } from "evlog";
import type { PolarBillingPort } from "./polar";

export type OrgBillingRow = {
	plan: typeof organizationPlan.$inferSelect;
	subscription: typeof organizationSubscription.$inferSelect;
	credits: typeof organizationCredits.$inferSelect;
};

function nextMonth(from: Date): Date {
	const end = new Date(from);
	end.setMonth(end.getMonth() + 1);
	return end;
}

function limitsFromRow(row: typeof organizationPlan.$inferSelect): PlanLimits {
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
		updatedAt: new Date(),
	};
}

export async function resolveBillingContact(
	orgId: string,
	tx: DatabaseInstance = db,
): Promise<{ email: string; name: string } | null> {
	const org = await tx.query.organization.findFirst({
		where: eq(organization.id, orgId),
	});
	if (!org) return null;

	const owner = await tx.query.member.findFirst({
		where: and(eq(member.organizationId, orgId), eq(member.role, "owner")),
	});
	const ownerUser = owner
		? await tx.query.user.findFirst({ where: eq(user.id, owner.userId) })
		: null;

	const email = org.billingEmail || ownerUser?.email;
	if (!email) return null;

	return {
		email,
		name: org.billingName || org.name || ownerUser?.name || email,
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

export async function getOrProvisionOrgBilling(
	orgId: string,
	tx?: DatabaseInstance,
): Promise<OrgBillingRow> {
	if (!orgId) {
		throw new Error("organizationId is required for billing provisioning");
	}

	const client = tx ?? db;
	const now = new Date();
	const free = getPlanLimits("free");

	let plan = await client.query.organizationPlan.findFirst({
		where: eq(organizationPlan.organizationId, orgId),
	});
	if (!plan) {
		plan = await applyLimitsToOrgPlan(orgId, free, client);
	}

	let credits = await client.query.organizationCredits.findFirst({
		where: and(
			eq(organizationCredits.organizationId, orgId),
			eq(organizationCredits.status, "active"),
		),
	});
	if (!credits) {
		const periodEnd = nextMonth(now);
		const [created] = await client
			.insert(organizationCredits)
			.values({
				organizationId: orgId,
				creditsUsed: 0,
				creditsRemaining: plan.monthlyEmails,
				monthlyCredits: plan.monthlyEmails,
				currentPeriodStart: now,
				currentPeriodEnd: periodEnd,
				status: "active",
			})
			.onConflictDoNothing()
			.returning();
		credits =
			created ??
			(await client.query.organizationCredits.findFirst({
				where: and(
					eq(organizationCredits.organizationId, orgId),
					eq(organizationCredits.status, "active"),
				),
			}));
		if (!credits) throw new Error("Failed to provision organization credits");

		if (created) {
			await client.insert(creditLedger).values({
				organizationId: orgId,
				organizationCreditsId: credits.id,
				entryType: "credit_purchased",
				delta: plan.monthlyEmails,
				balanceAfter: plan.monthlyEmails,
				reason: "Initial monthly credit quota",
			});
		}
	}

	let subscription = await client.query.organizationSubscription.findFirst({
		where: eq(organizationSubscription.organizationId, orgId),
	});
	if (!subscription) {
		const [created] = await client
			.insert(organizationSubscription)
			.values({
				organizationId: orgId,
				planId: plan.planId,
				status: "active",
				billingCycle: "monthly",
				currentPeriodStart: credits.currentPeriodStart,
				currentPeriodEnd: credits.currentPeriodEnd,
			})
			.onConflictDoNothing()
			.returning();
		subscription =
			created ??
			(await client.query.organizationSubscription.findFirst({
				where: eq(organizationSubscription.organizationId, orgId),
			}));
		if (!subscription) {
			throw new Error("Failed to provision organization subscription");
		}
	}

	if (now >= credits.currentPeriodEnd) {
		await closeBillingPeriod({
			organizationId: orgId,
			periodStart: credits.currentPeriodStart,
			periodEnd: credits.currentPeriodEnd,
			planId: plan.planId,
			includedEmails: credits.monthlyCredits,
			emailsUsed: credits.creditsUsed,
			tx: client,
		});
		const periodStart = now;
		const periodEnd = nextMonth(now);
		credits = await refillCreditsFromPlan({
			creditsId: credits.id,
			organizationId: orgId,
			monthlyEmails: plan.monthlyEmails,
			periodStart,
			periodEnd,
			tx: client,
		});
		const [updatedSub] = await client
			.update(organizationSubscription)
			.set({
				currentPeriodStart: periodStart,
				currentPeriodEnd: periodEnd,
				updatedAt: now,
			})
			.where(eq(organizationSubscription.id, subscription.id))
			.returning();
		if (updatedSub) subscription = updatedSub;
	}

	return { plan, subscription, credits };
}

export async function ensurePolarCustomerForOrg(args: {
	organizationId: string;
	polar: PolarBillingPort;
	tx?: DatabaseInstance;
}): Promise<string | null> {
	if (!args.polar.enabled) return null;
	const client = args.tx ?? db;
	const contact = await resolveBillingContact(args.organizationId, client);
	if (!contact) {
		log.warn({
			organizationId: args.organizationId,
			message: "Cannot create Polar customer without a billing email",
		});
		return null;
	}

	const customer = await args.polar.createOrGetCustomer({
		externalId: args.organizationId,
		email: contact.email,
		name: contact.name,
	});

	await client
		.update(organization)
		.set({ externalCustomerId: customer.id })
		.where(eq(organization.id, args.organizationId));

	await client
		.update(organizationSubscription)
		.set({
			polarCustomerId: customer.id,
			updatedAt: new Date(),
		})
		.where(eq(organizationSubscription.organizationId, args.organizationId));

	return customer.id;
}
