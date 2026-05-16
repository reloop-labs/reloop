import { db } from "@reloop/db/client";
import { plan, subscription } from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { asc } from "drizzle-orm";

export async function getOrProvisionSubscription(orgId: string) {
	let activeSub = await db.query.subscription.findFirst({
		where: (s, { and, eq }) =>
			and(eq(s.organizationId, orgId), eq(s.status, "active")),
		with: { plan: true },
	});

	if (!activeSub) {
		const freePlan = await db.query.plan.findFirst({
			where: (p, { eq }) => eq(p.isActive, true),
			orderBy: (p) => [asc(p.basePriceUsd)],
		});
		if (!freePlan) throw new Error("No plans configured");

		const now = new Date();
		const periodEnd = new Date(now);
		periodEnd.setMonth(periodEnd.getMonth() + 1);

		const [newSub] = await db.insert(subscription).values({
			organizationId: orgId,
			planId: freePlan.id,
			status: "active",
			creditsUsed: 0,
			creditsRemaining: freePlan.monthlyCredits,
			currentPeriodStart: now,
			currentPeriodEnd: periodEnd,
		}).returning();

		logger.info({ orgId, planId: freePlan.id }, "Auto-provisioned free plan subscription");
		activeSub = { ...newSub!, plan: freePlan };
	}

	return activeSub;
}
