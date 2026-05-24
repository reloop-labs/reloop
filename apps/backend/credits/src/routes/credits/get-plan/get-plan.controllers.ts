import { getOrProvisionCredits } from "../../../utils/credits";

export const getPlanController = async ({
	activeOrganizationId,
}: {
	activeOrganizationId: string;
}) => {
	const activeCredits = await getOrProvisionCredits(activeOrganizationId);

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
			currentPeriodStart: activeCredits.currentPeriodStart.toISOString(),
			currentPeriodEnd: activeCredits.currentPeriodEnd.toISOString(),
			creditsUsed: activeCredits.creditsUsed,
			creditsRemaining: activeCredits.creditsRemaining,
		},
	};
};

