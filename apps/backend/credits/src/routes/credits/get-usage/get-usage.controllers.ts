import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import { getOrProvisionCredits } from "@reloop/credits/utils/credits";

export const getUsageController = async ({
	organizationId,
}: {
	organizationId: string;
}) => {
	const orgId = organizationId;

	try {
		// 1. Get or provision credits
		const activeCredits = await getOrProvisionCredits(orgId);

		return {
			plan: {
				name: "Free",
				monthlyCredits: activeCredits.monthlyCredits,
				basePriceUsd: "0.00",
				billingCycle: "monthly",
				ratePerSecond: 10,
				ratePerMinute: 200,
				ratePerHour: 5000,
				maxAttachmentSizeMb: 5,
				overageLimit: 0,
			},
			subscription: {
				status: activeCredits.status,
				creditsUsed: activeCredits.creditsUsed,
				creditsRemaining: activeCredits.creditsRemaining,
				currentPeriodStart: activeCredits.currentPeriodStart.toISOString(),
				currentPeriodEnd: activeCredits.currentPeriodEnd.toISOString(),
			},
		};
	} catch (error) {
		throw CreditErrors.databaseError(
			error instanceof Error ? error.message : "Unknown database error",
		);
	}
};
