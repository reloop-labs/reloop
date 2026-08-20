import { countEmailRecipients } from "@reloop/be-mail/lib/count-recipients";
import { MailErrors } from "@reloop/be-mail/lib/errors";
import { db } from "@reloop/db/client";
import { creditLedger, organizationCredits } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

const DEFAULT_MONTHLY_CREDITS = 3000;

/**
 * Load active org credits, provisioning Free defaults or resetting an expired
 * period so the gate matches post-send metering in be-credits.
 */
async function ensureActiveCredits(organizationId: string) {
	if (!organizationId) {
		throw new Error("organizationId is required for credit checks");
	}

	let activeCredits = await db.query.organizationCredits.findFirst({
		where: (c, { and, eq: equals }) =>
			and(equals(c.organizationId, organizationId), equals(c.status, "active")),
	});

	const now = new Date();

	if (!activeCredits) {
		log.info(
			"server",
			`No credits found for org ${organizationId}, provisioning default monthly credits (${DEFAULT_MONTHLY_CREDITS})`,
		);

		const periodEnd = new Date(now);
		periodEnd.setMonth(periodEnd.getMonth() + 1);

		const [newCredits] = await db
			.insert(organizationCredits)
			.values({
				organizationId,
				creditsUsed: 0,
				creditsRemaining: DEFAULT_MONTHLY_CREDITS,
				monthlyCredits: DEFAULT_MONTHLY_CREDITS,
				currentPeriodStart: now,
				currentPeriodEnd: periodEnd,
				status: "active",
			})
			.onConflictDoNothing()
			.returning();

		if (!newCredits) {
			activeCredits = await db.query.organizationCredits.findFirst({
				where: (c, { and, eq: equals }) =>
					and(
						equals(c.organizationId, organizationId),
						equals(c.status, "active"),
					),
			});
			if (!activeCredits) {
				throw new Error("Failed to retrieve organization credits after provision");
			}
			return activeCredits;
		}

		await db.insert(creditLedger).values({
			organizationId,
			organizationCreditsId: newCredits.id,
			entryType: "credit_purchased",
			delta: DEFAULT_MONTHLY_CREDITS,
			balanceAfter: DEFAULT_MONTHLY_CREDITS,
			reason: "Initial monthly credit quota",
		});

		return newCredits;
	}

	if (now >= activeCredits.currentPeriodEnd) {
		log.info(
			"server",
			`Monthly credit period expired for org ${organizationId}. Resetting credits before send gate.`,
		);

		const periodEnd = new Date(now);
		periodEnd.setMonth(periodEnd.getMonth() + 1);

		const [updatedCredits] = await db
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

		await db.insert(creditLedger).values({
			organizationId,
			organizationCreditsId: activeCredits.id,
			entryType: "period_reset",
			delta: activeCredits.monthlyCredits,
			balanceAfter: activeCredits.monthlyCredits,
			reason: "Monthly credit reset (non-rollable)",
		});

		return updatedCredits;
	}

	return activeCredits;
}

/**
 * Fail closed when the org cannot cover this send's recipient count.
 * Call before creating email logs or calling KumoMTA.
 */
export async function assertHasCredits({
	organizationId,
	body,
}: {
	organizationId: string;
	body: {
		to: string | string[];
		cc?: string | string[];
		bcc?: string | string[];
	};
}): Promise<{ creditsRemaining: number; recipientCount: number }> {
	const recipientCount = countEmailRecipients(body);
	const credits = await ensureActiveCredits(organizationId);

	if (credits.creditsRemaining < recipientCount) {
		throw MailErrors.quotaExceeded({
			remaining: credits.creditsRemaining,
			required: recipientCount,
			monthlyCredits: credits.monthlyCredits,
		});
	}

	return {
		creditsRemaining: credits.creditsRemaining,
		recipientCount,
	};
}
