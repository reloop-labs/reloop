import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import { getOrProvisionOrgBilling } from "@reloop/credits/lib/org-billing";
import { db } from "@reloop/db/client";
import { emailSend, inboundEmail } from "@reloop/db/schema";
import { getPlanById } from "@reloop/pricing";
import { and, count, eq, gte, ne } from "drizzle-orm";

export const getUsageController = async ({
	organizationId,
}: {
	organizationId: string;
}) => {
	try {
		const billing = await getOrProvisionOrgBilling(organizationId);
		const catalog = getPlanById(billing.plan.planId);
		const monthlyPrice = catalog?.monthlyPrice ?? 0;
		const periodStart = billing.credits.currentPeriodStart;

		const [sentRows, receivedRows] = await Promise.all([
			db
				.select({ value: count() })
				.from(emailSend)
				.where(
					and(
						eq(emailSend.organizationId, organizationId),
						gte(emailSend.sentAt, periodStart),
					),
				),
			db
				.select({ value: count() })
				.from(inboundEmail)
				.where(
					and(
						eq(inboundEmail.organizationId, organizationId),
						gte(inboundEmail.createdAt, periodStart),
						ne(inboundEmail.status, "spam"),
					),
				),
		]);

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
			},
			subscription: {
				status: billing.subscription.status,
				creditsUsed: billing.credits.creditsUsed,
				creditsRemaining: billing.credits.creditsRemaining,
				creditsSent: sentRows[0]?.value ?? 0,
				creditsReceived: receivedRows[0]?.value ?? 0,
				currentPeriodStart: billing.credits.currentPeriodStart.toISOString(),
				currentPeriodEnd: billing.credits.currentPeriodEnd.toISOString(),
			},
		};
	} catch (error) {
		throw CreditErrors.databaseError(
			error instanceof Error ? error.message : "Unknown database error",
		);
	}
};
