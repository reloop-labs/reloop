import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import { getOrProvisionCredits } from "@reloop/credits/utils/credits";
import { db } from "@reloop/db/client";
import { creditLedger, organizationCredits } from "@reloop/db/schema";
import { eq, sql } from "drizzle-orm";

interface TopupParams {
	organizationId: string;
	amount: number;
	reason?: string;
}

export const topupCreditsController = async ({
	organizationId,
	amount,
	reason,
}: TopupParams) => {
	if (amount <= 0) {
		throw CreditErrors.invalidAmount(amount);
	}

	try {
		await db.transaction(async (tx) => {
			const activeCredits = await getOrProvisionCredits(organizationId, tx);

			await tx
				.update(organizationCredits)
				.set({
					creditsRemaining: sql`${organizationCredits.creditsRemaining} + ${amount}`,
					updatedAt: new Date(),
				})
				.where(eq(organizationCredits.id, activeCredits.id));

			await tx.insert(creditLedger).values({
				organizationId,
				organizationCreditsId: activeCredits.id,
				entryType: "manual_adjustment",
				delta: amount,
				balanceAfter: activeCredits.creditsRemaining + amount,
				reason: reason || "Manual top-up",
			});
		});
	} catch (error) {
		throw CreditErrors.topupFailed(
			organizationId,
			error instanceof Error ? error.message : "Unknown database error",
		);
	}

	return { success: true };
};
