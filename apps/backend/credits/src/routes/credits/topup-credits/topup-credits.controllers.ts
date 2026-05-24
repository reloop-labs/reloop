import { db } from "@reloop/db/client";
import { creditLedger, organizationCredits } from "@reloop/db/schema";
import { eq, sql } from "drizzle-orm";

import { getOrProvisionCredits } from "../../../utils/credits";

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

	return { success: true };
};
