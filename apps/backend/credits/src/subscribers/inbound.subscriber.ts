import { BusEvent, bus } from "@reloop/bus";
import { publishUsageAfterCharge } from "@reloop/credits/lib/usage-events";
import { db } from "@reloop/db/client";
import {
	chargeReceiveCredits,
	usablePrepaidCredits,
} from "@reloop/db/reserve-send-credits";
import { organizationPlan } from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { log } from "evlog";

/**
 * Received (non-spam) mail draws from the same monthly credits as sends, so
 * the limit, overage and quota alerts cover both directions. Charging is
 * idempotent per inbound email, so redelivered events are safe.
 */
export async function initInboundSubscriber() {
	await bus.subscribe(
		BusEvent.INBOUND_EMAIL_RECEIVED,
		async (payload) => {
			if (payload.isSpam) return;
			try {
				const result = await chargeReceiveCredits({
					organizationId: payload.organizationId,
					inboundEmailId: payload.inboundEmailId,
				});
				if (!result.charged) return;

				const credits = await db.query.organizationCredits.findFirst({
					where: (c, { and, eq: equals }) =>
						and(
							equals(c.organizationId, payload.organizationId),
							equals(c.status, "active"),
						),
				});
				if (!credits) return;
				const plan = await db.query.organizationPlan.findFirst({
					where: eq(organizationPlan.organizationId, payload.organizationId),
					columns: { overageEnabled: true },
				});

				await publishUsageAfterCharge({
					organizationId: payload.organizationId,
					charged: 1 - result.fromPrepaid,
					snapshot: {
						creditsUsed: result.creditsUsed,
						creditsRemaining: result.remaining,
						monthlyCredits: credits.monthlyCredits,
						periodStart: credits.currentPeriodStart,
						periodEnd: credits.currentPeriodEnd,
						overageEnabled: plan?.overageEnabled ?? false,
						prepaidRemaining: usablePrepaidCredits(credits, new Date()),
					},
				});
			} catch (error) {
				log.error({
					...{
						error,
						organizationId: payload.organizationId,
						inboundEmailId: payload.inboundEmailId,
					},
					message: "Failed to charge credits for received email",
				});
			}
		},
		{ queue: "credits-inbound-received-worker" },
	);
}
