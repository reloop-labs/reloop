import { type DatabaseInstance, db } from "@reloop/db/client";
import { creditLedger, organizationCredits } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

export async function getOrProvisionCredits(
	orgId: string,
	tx?: DatabaseInstance,
) {
	if (!orgId) {
		log.error("server", "getOrProvisionCredits called with missing orgId");
		throw new Error("organizationId is required for credit provisioning");
	}

	const client = tx ?? db;
	let activeCredits = await client.query.organizationCredits.findFirst({
		where: (c, { and, eq }) =>
			and(eq(c.organizationId, orgId), eq(c.status, "active")),
	});

	const now = new Date();

	if (!activeCredits) {
		log.info("server", `No credits found for org ${orgId}, provisioning default monthly credits (3000)`);

		const periodEnd = new Date(now);
		periodEnd.setMonth(periodEnd.getMonth() + 1);

		const [newCredits] = await client
			.insert(organizationCredits)
			.values({
				organizationId: orgId,
				creditsUsed: 0,
				creditsRemaining: 3000,
				monthlyCredits: 3000,
				currentPeriodStart: now,
				currentPeriodEnd: periodEnd,
				status: "active",
			})
			.onConflictDoNothing()
			.returning();

		if (!newCredits) {
			activeCredits = await client.query.organizationCredits.findFirst({
				where: (c, { and, eq }) =>
					and(eq(c.organizationId, orgId), eq(c.status, "active")),
			});
			if (!activeCredits) {
				throw new Error("Failed to retrieve existing credits after conflict");
			}
			return activeCredits;
		}

		// Log initial credits in ledger
		await client.insert(creditLedger).values({
			organizationId: orgId,
			organizationCreditsId: newCredits.id,
			entryType: "credit_purchased",
			delta: 3000,
			balanceAfter: 3000,
			reason: "Initial monthly credit quota",
		});

		log.info({
			...{ orgId, creditsId: newCredits.id },
			message: "Auto-provisioned default monthly credits",
		});
		
		return newCredits;
	}

	// Check if the current period has expired, if so reset credits (non-rollable)
	if (now >= activeCredits.currentPeriodEnd) {
		log.info("server", `Monthly credit period expired for org ${orgId}. Resetting credits (non-rollable).`);

		const periodEnd = new Date(now);
		periodEnd.setMonth(periodEnd.getMonth() + 1);

		const [updatedCredits] = await client
			.update(organizationCredits)
			.set({
				creditsUsed: 0,
				creditsRemaining: activeCredits.monthlyCredits,
				currentPeriodStart: now,
				currentPeriodEnd: periodEnd,
				updatedAt: now,
			})
			.where(eq(organizationCredits.id, activeCredits.id))
			.returning();

		if (!updatedCredits) {
			throw new Error("Failed to reset credits for expired period");
		}

		// Log reset in ledger
		await client.insert(creditLedger).values({
			organizationId: orgId,
			organizationCreditsId: activeCredits.id,
			entryType: "period_reset",
			delta: activeCredits.monthlyCredits,
			balanceAfter: activeCredits.monthlyCredits,
			reason: "Monthly credit reset (non-rollable)",
		});

		log.info({
			...{ orgId, creditsId: activeCredits.id },
			message: "Reset organization monthly credits (expired period)",
		});

		return updatedCredits;
	}

	return activeCredits;
}
