import { db } from "@reloop/db/client";
import { creditLedger, subscription } from "@reloop/db/schema";
import { eq, sql } from "drizzle-orm";

import { getOrProvisionSubscription } from "../../../utils/subscription";

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
		const activeSub = await getOrProvisionSubscription(organizationId, tx);

		await tx
			.update(subscription)
			.set({
				creditsRemaining: sql`${subscription.creditsRemaining} + ${amount}`,
				updatedAt: new Date(),
			})
			.where(eq(subscription.id, activeSub.id));

		await tx.insert(creditLedger).values({
			organizationId,
			subscriptionId: activeSub.id,
			entryType: "manual_adjustment",
			delta: amount,
			balanceAfter: activeSub.creditsRemaining + amount,
			reason: reason || "Manual top-up",
		});
	});

	return { success: true };
};
