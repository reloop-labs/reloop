import { CreditErrors } from "@reloop/credits/error/credits.error-response";
import { getOrProvisionCredits } from "@reloop/credits/utils/credits";
import { db } from "@reloop/db/client";
import { emailSend, inboundEmail } from "@reloop/db/schema";
import { and, count, eq, gte, ne } from "drizzle-orm";

export const getUsageController = async ({
	organizationId,
}: {
	organizationId: string;
}) => {
	const orgId = organizationId;

	try {
		// 1. Get or provision credits
		const activeCredits = await getOrProvisionCredits(orgId);

		// 2. Count sent / received emails within the current billing period
		const periodStart = activeCredits.currentPeriodStart;

		const [sentRows, receivedRows] = await Promise.all([
			db
				.select({ value: count() })
				.from(emailSend)
				.where(
					and(
						eq(emailSend.organizationId, orgId),
						gte(emailSend.sentAt, periodStart),
					),
				),
			db
				.select({ value: count() })
				.from(inboundEmail)
				.where(
					and(
						eq(inboundEmail.organizationId, orgId),
						gte(inboundEmail.createdAt, periodStart),
						ne(inboundEmail.status, "spam"),
					),
				),
		]);

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
				creditsSent: sentRows[0]?.value ?? 0,
				creditsReceived: receivedRows[0]?.value ?? 0,
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
