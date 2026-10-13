import { BusEvent, bus } from "@reloop/bus";
import { livePolarBilling } from "@reloop/credits/lib/polar";
import { db } from "@reloop/db/client";
import { emailSend } from "@reloop/db/schema";
import { and, count, eq, gte } from "drizzle-orm";
import { log } from "evlog";

export type UsageSnapshot = {
	creditsUsed: number;
	creditsRemaining: number;
	monthlyCredits: number;
	periodStart: Date;
	periodEnd: Date;
	overageEnabled: boolean;
};

/**
 * Everything that follows a credit charge, for sends and received mail alike:
 * the live usage update, Polar overage metering, and quota alerts.
 */
export async function publishUsageAfterCharge(args: {
	organizationId: string;
	/** Credits just charged, metered to Polar on overage plans. */
	charged: number;
	snapshot: UsageSnapshot;
}): Promise<void> {
	const { organizationId, charged, snapshot: snap } = args;

	const todayStart = new Date();
	todayStart.setHours(0, 0, 0, 0);
	const [todayRow] = await db
		.select({ total: count() })
		.from(emailSend)
		.where(
			and(
				eq(emailSend.organizationId, organizationId),
				gte(emailSend.sentAt, todayStart),
			),
		);

	await bus.publish(BusEvent.USAGE_UPDATED, {
		organizationId,
		creditsUsed: snap.creditsUsed,
		creditsRemaining: snap.creditsRemaining,
		monthlyCredits: snap.monthlyCredits,
		periodStart: snap.periodStart.toISOString(),
		periodEnd: snap.periodEnd.toISOString(),
		emailsSentToday: Number(todayRow?.total ?? 0),
	});

	if (livePolarBilling.enabled && snap.overageEnabled && charged > 0) {
		try {
			await livePolarBilling.ingestEmailEvents({
				externalCustomerId: organizationId,
				count: charged,
			});
		} catch (error) {
			log.error({
				...{ error, organizationId },
				message: "Failed to ingest Polar usage events",
			});
		}
	}

	const usageRatio = snap.creditsUsed / snap.monthlyCredits;
	if (snap.creditsRemaining <= 0) {
		await bus.publish(BusEvent.QUOTA_EXCEEDED, {
			organizationId,
			creditsUsed: snap.creditsUsed,
			monthlyCredits: snap.monthlyCredits,
		});
		log.warn({
			...{ organizationId },
			message: "Quota exceeded — published QUOTA_EXCEEDED",
		});
	} else if (usageRatio >= 0.8) {
		// Fire QUOTA_WARNING at 80% and again at 90%
		await bus.publish(BusEvent.QUOTA_WARNING, {
			email: "", // email service enriches this from org lookup if needed
			percentage: Math.round(usageRatio * 100),
			resourceType: "email_credits",
		});
		log.warn({
			...{ organizationId, usageRatio },
			message: "Quota warning threshold reached",
		});
	}
}
