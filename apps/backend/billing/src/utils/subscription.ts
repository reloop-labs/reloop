import { db, type DatabaseInstance } from "@reloop/db/client";
import { creditLedger, plan, subscription } from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, asc, eq } from "drizzle-orm";
import { billingConfig } from "../billing.config";

export async function getOrProvisionSubscription(orgId: string, tx?: DatabaseInstance) {
	const client = tx ?? db;
	let activeSub = await client.query.subscription.findFirst({
		where: (s, { and, eq }) =>
			and(eq(s.organizationId, orgId), eq(s.status, "active")),
		with: { plan: true },
	});

	if (!activeSub) {
		let freePlan = await client.query.plan.findFirst({
			where: (p, { eq }) => eq(p.isActive, true),
			orderBy: (p) => [asc(p.basePriceUsd)],
		});

		if (!freePlan) {
			logger.info("No plans found, creating default Free plan");
			const [insertedPlan] = await client
				.insert(plan)
				.values({
					name: "Free",
					monthlyCredits: billingConfig.initialCredits,
					basePriceUsd: "0",
					isActive: true,
					ratePerSecond: 10,
					ratePerMinute: 200,
					ratePerHour: 5000,
					maxAttachmentSizeMb: 5,
				})
				.returning();

			if (!insertedPlan) throw new Error("Failed to create default plan");
			freePlan = insertedPlan;
		}

		const now = new Date();
		const periodEnd = new Date(now);
		periodEnd.setMonth(periodEnd.getMonth() + 1);

		const [newSub] = await client
			.insert(subscription)
			.values({
				organizationId: orgId,
				planId: freePlan.id,
				status: "active",
				creditsUsed: 0,
				creditsRemaining: freePlan.monthlyCredits,
				currentPeriodStart: now,
				currentPeriodEnd: periodEnd,
			})
			.returning();

		if (!newSub) throw new Error("Failed to create subscription");

		// Log initial credits in ledger
		await client.insert(creditLedger).values({
			organizationId: orgId,
			subscriptionId: newSub.id,
			entryType: "credit_purchased",
			delta: freePlan.monthlyCredits,
			balanceAfter: freePlan.monthlyCredits,
			reason: "Initial free plan quota",
		});

		logger.info({ orgId, planId: freePlan.id }, "Auto-provisioned free plan subscription");
		activeSub = { ...newSub, plan: freePlan };
	}

	return activeSub;
}
