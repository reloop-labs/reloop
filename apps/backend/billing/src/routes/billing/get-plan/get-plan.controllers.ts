import { getOrProvisionSubscription } from "../../../utils/subscription";

export const getPlanController = async ({ activeOrganizationId }: { activeOrganizationId: string }) => {
	const activeSub = await getOrProvisionSubscription(activeOrganizationId);

	return {
		plan: activeSub.plan,
		subscription: {
			status: activeSub.status,
			currentPeriodStart: activeSub.currentPeriodStart.toISOString(),
			currentPeriodEnd: activeSub.currentPeriodEnd.toISOString(),
			creditsUsed: activeSub.creditsUsed,
			creditsRemaining: activeSub.creditsRemaining,
		},
	};
};
