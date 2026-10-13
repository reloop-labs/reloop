import { BusEvent, bus } from "@reloop/bus";
import {
	publishUsageAfterCharge,
	type UsageSnapshot,
} from "@reloop/credits/lib/usage-events";
import { getOrProvisionCredits } from "@reloop/credits/utils/credits";
import { db } from "@reloop/db/client";
import {
	creditLedger,
	emailSend,
	organizationCredits,
	organizationPlan,
} from "@reloop/db/schema";
import { and, count, eq, gte, sql } from "drizzle-orm";
import { log } from "evlog";

export async function initEmailSubscriber() {
	// Hot reload test comment
	await bus.subscribe(
		BusEvent.EMAIL_SENT,
		async (payload) => {
			log.info({
				...{
					organizationId: payload.organizationId,
					count: payload.recipientCount,
				},
				message: "Handling EMAIL_SENT",
			});
			try {
				let usageSnapshot: UsageSnapshot | null = null;

				await db.transaction(async (tx) => {
					// 0. Check for duplicate processing (idempotency)
					if (payload.emailLogId) {
						const existingSend = await tx.query.emailSend.findFirst({
							where: (e, { eq }) => eq(e.emailLogId, payload.emailLogId),
						});
						if (existingSend) {
							log.info({
								...{
									organizationId: payload.organizationId,
									emailLogId: payload.emailLogId,
								},
								message: "Email already processed, skipping credit deduction",
							});
							return;
						}
					}

					// 1. Find active credits (provision if missing)
					const activeCredits = await getOrProvisionCredits(
						payload.organizationId,
						tx,
					);

					// 2. Create email_send record for billing audit
					const [sendRecord] = await tx
						.insert(emailSend)
						.values({
							organizationId: payload.organizationId,
							organizationCreditsId: activeCredits.id,
							emailLogId: payload.emailLogId,
							recipientEmail: "multiple@recipients.info", // simplified for batch events
							countedInCredits: true,
							creditsConsumed: payload.recipientCount,
							status: "sent",
							sentAt: new Date(),
						})
						.returning();

					// 3. Update credit counters unless the send path already reserved.
					const creditsReserved = payload.creditsReserved === true;
					const newCreditsUsed = creditsReserved
						? activeCredits.creditsUsed
						: activeCredits.creditsUsed + payload.recipientCount;
					const newCreditsRemaining = creditsReserved
						? activeCredits.creditsRemaining
						: Math.max(
								0,
								activeCredits.creditsRemaining - payload.recipientCount,
							);

					if (!creditsReserved) {
						await tx
							.update(organizationCredits)
							.set({
								creditsUsed: sql`${organizationCredits.creditsUsed} + ${payload.recipientCount}`,
								creditsRemaining: sql`GREATEST(0, ${organizationCredits.creditsRemaining} - ${payload.recipientCount})`,
								updatedAt: new Date(),
							})
							.where(eq(organizationCredits.id, activeCredits.id));
					}

					// 4. Log in credit ledger
					if (sendRecord) {
						await tx.insert(creditLedger).values({
							organizationId: payload.organizationId,
							organizationCreditsId: activeCredits.id,
							entryType: "email_sent",
							delta: -payload.recipientCount,
							balanceAfter: newCreditsRemaining,
							reason: `Sent email with ${payload.recipientCount} recipients`,
							referenceId: sendRecord.id,
						});
					}

					const plan = await tx.query.organizationPlan.findFirst({
						where: eq(organizationPlan.organizationId, payload.organizationId),
					});

					usageSnapshot = {
						creditsUsed: newCreditsUsed,
						creditsRemaining: newCreditsRemaining,
						monthlyCredits: activeCredits.monthlyCredits,
						periodStart: activeCredits.currentPeriodStart,
						periodEnd: activeCredits.currentPeriodEnd,
						overageEnabled: plan?.overageEnabled ?? false,
					};
				});

				if (!usageSnapshot) return;

				await publishUsageAfterCharge({
					organizationId: payload.organizationId,
					charged: payload.recipientCount,
					snapshot: usageSnapshot,
				});

				log.info({
					...{ organizationId: payload.organizationId },
					message: "Deducted credits, published USAGE_UPDATED",
				});
			} catch (error) {
				log.error({
					...{ error, organizationId: payload.organizationId },
					message: "Failed to deduct credits",
				});
			}
		},
		{ queue: "credits-email-sent-worker" },
	);
}
