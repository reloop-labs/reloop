import { addMonthsUtc, advancePeriod } from "@reloop/db/billing-period";
import { type DatabaseInstance, db } from "@reloop/db/client";
import {
	applyLimitsToOrgPlan,
	changeOrgPlan,
	closeBillingPeriod,
	nextMonth,
	type OrgBillingRow,
	refillCreditsFromPlan,
} from "@reloop/db/org-plan-change";
import {
	usablePrepaidCredits,
	utcDayStart,
} from "@reloop/db/reserve-send-credits";
import {
	creditLedger,
	member,
	organization,
	organizationCredits,
	organizationPlan,
	organizationSubscription,
	user,
} from "@reloop/db/schema";
import { creditPack, getPlanLimits } from "@reloop/pricing";
import { and, eq, lte } from "drizzle-orm";
import { log } from "evlog";
import type { PolarBillingPort } from "./polar";

export {
	applyLimitsToOrgPlan,
	changeOrgPlan,
	closeBillingPeriod,
	downgradeOrgToFree,
	hasActivePrepaid,
	type OrgBillingRow,
	refillCreditsFromPlan,
} from "@reloop/db/org-plan-change";

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

/**
 * Void prepaid credits once they pass their expiry, and move a Pay as you go
 * org back to Free. Safe to call repeatedly: only the caller that clears
 * `prepaidExpiresAt` does the work.
 */
async function expirePrepaidCredits(args: {
	plan: typeof organizationPlan.$inferSelect;
	credits: typeof organizationCredits.$inferSelect;
	tx: DatabaseInstance;
	now: Date;
}): Promise<{
	plan: typeof organizationPlan.$inferSelect;
	credits: typeof organizationCredits.$inferSelect;
}> {
	const { tx, now } = args;
	const expiresAt = args.credits.prepaidExpiresAt;
	if (!expiresAt || expiresAt > now) {
		return { plan: args.plan, credits: args.credits };
	}

	const [credits] = await tx
		.update(organizationCredits)
		.set({ prepaidCredits: 0, prepaidExpiresAt: null, updatedAt: now })
		.where(
			and(
				eq(organizationCredits.id, args.credits.id),
				lte(organizationCredits.prepaidExpiresAt, now),
			),
		)
		.returning();
	if (!credits) return { plan: args.plan, credits: args.credits };

	if (args.credits.prepaidCredits > 0) {
		await tx.insert(creditLedger).values({
			organizationId: credits.organizationId,
			organizationCreditsId: credits.id,
			entryType: "credit_expired",
			delta: -args.credits.prepaidCredits,
			balanceAfter: 0,
			reason: `Unused email credits expired after ${creditPack.validityMonths} months`,
		});
	}

	let plan = args.plan;
	if (plan.planId === "payg") {
		await changeOrgPlan({
			organizationId: plan.organizationId,
			nextPlanId: "free",
			tx,
		});
		await tx
			.update(organizationSubscription)
			.set({ planId: "free", updatedAt: now })
			.where(eq(organizationSubscription.organizationId, plan.organizationId));
		const refreshed = await tx.query.organizationPlan.findFirst({
			where: eq(organizationPlan.organizationId, plan.organizationId),
		});
		if (refreshed) plan = refreshed;
	}

	return { plan, credits };
}

/**
 * Add a paid credit pack. Credits are spent after the monthly allowance and
 * last `creditPack.validityMonths` from this purchase; buying again extends
 * the whole balance. A Free org moves to Pay as you go (Pro limits).
 * Idempotent per Polar order.
 */
export async function grantPrepaidCredits(args: {
	organizationId: string;
	emails: number;
	orderId: string;
	tx: DatabaseInstance;
	now?: Date;
}): Promise<{ granted: boolean; balance: number; expiresAt: Date | null }> {
	const { tx, organizationId, emails, orderId } = args;
	const now = args.now ?? new Date();
	const billing = await getOrProvisionOrgBilling(organizationId, tx);

	const [locked] = await tx
		.select()
		.from(organizationCredits)
		.where(eq(organizationCredits.id, billing.credits.id))
		.for("update");
	if (!locked) throw new Error("Failed to lock organization credits");

	const existing = await tx.query.creditLedger.findFirst({
		where: and(
			eq(creditLedger.organizationId, organizationId),
			eq(creditLedger.entryType, "credit_purchased"),
			eq(creditLedger.referenceId, orderId),
		),
		columns: { id: true },
	});
	if (existing) {
		return {
			granted: false,
			balance: locked.prepaidCredits,
			expiresAt: locked.prepaidExpiresAt,
		};
	}

	const fresh = addMonthsUtc(now, creditPack.validityMonths);
	const expiresAt =
		locked.prepaidExpiresAt && locked.prepaidExpiresAt > fresh
			? locked.prepaidExpiresAt
			: fresh;
	const balance = usablePrepaidCredits(locked, now) + emails;

	await tx
		.update(organizationCredits)
		.set({
			prepaidCredits: balance,
			prepaidExpiresAt: expiresAt,
			updatedAt: now,
		})
		.where(eq(organizationCredits.id, locked.id));

	await tx.insert(creditLedger).values({
		organizationId,
		organizationCreditsId: locked.id,
		entryType: "credit_purchased",
		delta: emails,
		balanceAfter: balance,
		reason: `Bought ${emails.toLocaleString("en-US")} email credits`,
		referenceId: orderId,
	});

	if (billing.plan.planId === "free") {
		await changeOrgPlan({ organizationId, nextPlanId: "payg", tx });
		await tx
			.update(organizationSubscription)
			.set({ planId: "payg", updatedAt: now })
			.where(eq(organizationSubscription.organizationId, organizationId));
	}

	return { granted: true, balance, expiresAt };
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
	if (credits) {
		({ plan, credits } = await expirePrepaidCredits({
			plan,
			credits,
			tx: client,
			now,
		}));
	}
	if (!credits) {
		const periodEnd = nextMonth(now);
		const [created] = await client
			.insert(organizationCredits)
			.values({
				organizationId: orgId,
				creditsUsed: 0,
				creditsRemaining: plan.monthlyEmails,
				monthlyCredits: plan.monthlyEmails,
				dailyEmailsUsed: 0,
				dailyWindowStart: utcDayStart(now),
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
		// Advance from the period's anchor (same rule as the send path).
		const { periodStart, periodEnd } = advancePeriod({
			periodStart: credits.currentPeriodStart,
			periodEnd: credits.currentPeriodEnd,
			now,
		});
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

export function shouldClaimOrganizationExternalCustomerId(
	organizationId: string,
	currentOwnerId: string | null,
): boolean {
	return currentOwnerId == null || currentOwnerId === organizationId;
}

function isUniqueViolation(error: unknown): boolean {
	let current: unknown = error;
	for (let i = 0; i < 4 && current; i += 1) {
		if (
			typeof current === "object" &&
			current !== null &&
			"code" in current &&
			(current as { code?: string }).code === "23505"
		) {
			return true;
		}
		current =
			typeof current === "object" && current !== null && "cause" in current
				? (current as { cause: unknown }).cause
				: null;
	}
	return false;
}

export async function linkPolarCustomerToOrg(args: {
	organizationId: string;
	polarCustomerId: string;
	tx?: DatabaseInstance;
}): Promise<boolean> {
	const client = args.tx ?? db;
	const owner = await client.query.organization.findFirst({
		where: eq(organization.externalCustomerId, args.polarCustomerId),
		columns: { id: true },
	});
	const claimed = shouldClaimOrganizationExternalCustomerId(
		args.organizationId,
		owner?.id ?? null,
	);
	if (claimed) {
		try {
			await client
				.update(organization)
				.set({ externalCustomerId: args.polarCustomerId })
				.where(eq(organization.id, args.organizationId));
		} catch (error) {
			if (!isUniqueViolation(error)) throw error;
		}
	}

	await client
		.update(organizationSubscription)
		.set({
			polarCustomerId: args.polarCustomerId,
			updatedAt: new Date(),
		})
		.where(eq(organizationSubscription.organizationId, args.organizationId));
	return claimed;
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

	await linkPolarCustomerToOrg({
		organizationId: args.organizationId,
		polarCustomerId: customer.id,
		tx: args.tx,
	});
	return customer.id;
}
