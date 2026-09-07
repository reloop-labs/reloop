import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import { getOrProvisionOrgBilling } from "@reloop/credits/lib/org-billing";
import { getPlanById } from "@reloop/pricing";

export const getPlanController = async ({
	organizationId,
}: {
	organizationId: string;
}) => {
	try {
		const billing = await getOrProvisionOrgBilling(organizationId);
		const catalog = getPlanById(billing.plan.planId);
		const monthlyPrice = catalog?.monthlyPrice ?? 0;

		return {
			plan: {
				id: billing.plan.planId,
				name: catalog?.name ?? "Free",
				monthlyCredits: billing.plan.monthlyEmails,
				basePriceUsd:
					monthlyPrice === null ? "custom" : monthlyPrice.toFixed(2),
				billingCycle: billing.subscription.billingCycle,
				ratePerSecond: 10,
				ratePerMinute: billing.plan.dailyEmailLimit ?? 0,
				ratePerHour: 5000,
				maxAttachmentSizeMb: Math.round(
					billing.plan.maxAttachmentBytes / (1024 * 1024),
				),
				overageLimit: billing.plan.overageEnabled ? -1 : 0,
				entitlements: {
					monthlyEmails: billing.plan.monthlyEmails,
					dailyEmailLimit: billing.plan.dailyEmailLimit,
					overageEnabled: billing.plan.overageEnabled,
					maxAgentInboxes: billing.plan.maxAgentInboxes,
					maxWebhooks: billing.plan.maxWebhooks,
					maxCustomDomains: billing.plan.maxCustomDomains,
					maxAttachmentBytes: billing.plan.maxAttachmentBytes,
					dataRetentionDays: billing.plan.dataRetentionDays,
					dedicatedIpCount: billing.plan.dedicatedIpCount,
				},
			},
			subscription: {
				status: billing.subscription.status,
				planId: billing.subscription.planId,
				cancelAtPeriodEnd: billing.subscription.cancelAtPeriodEnd,
				currentPeriodStart:
					billing.subscription.currentPeriodStart.toISOString(),
				currentPeriodEnd: billing.subscription.currentPeriodEnd.toISOString(),
				creditsUsed: billing.credits.creditsUsed,
				creditsRemaining: billing.credits.creditsRemaining,
			},
		};
	} catch (error) {
		throw CreditErrors.databaseError(
			error instanceof Error ? error.message : "Unknown database error",
		);
	}
};
