import { BusEvent, bus } from "@reloop/bus";
import { getOrProvisionCredits } from "@reloop/credits/utils/credits";
import { db } from "@reloop/db/client";
import {
	creditLedger,
	emailSend,
	organizationCredits,
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
				let usageSnapshot: {
					creditsUsed: number;
					creditsRemaining: number;
					monthlyCredits: number;
					periodStart: Date;
					periodEnd: Date;
				} | null = null;

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

					// 3. Update credit counters
					const newCreditsUsed =
						activeCredits.creditsUsed + payload.recipientCount;
					const newCreditsRemaining = Math.max(
						0,
						activeCredits.creditsRemaining - payload.recipientCount,
					);

					await tx
						.update(organizationCredits)
						.set({
							creditsUsed: sql`${organizationCredits.creditsUsed} + ${payload.recipientCount}`,
							creditsRemaining: sql`GREATEST(0, ${organizationCredits.creditsRemaining} - ${payload.recipientCount})`,
							updatedAt: new Date(),
						})
						.where(eq(organizationCredits.id, activeCredits.id));

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

					usageSnapshot = {
						creditsUsed: newCreditsUsed,
						creditsRemaining: newCreditsRemaining,
						monthlyCredits: activeCredits.monthlyCredits,
						periodStart: activeCredits.currentPeriodStart,
						periodEnd: activeCredits.currentPeriodEnd,
					};
				});

				if (!usageSnapshot) return;

				// 5. Count emails sent today for the USAGE_UPDATED payload
				const todayStart = new Date();
				todayStart.setHours(0, 0, 0, 0);

				const [todayRow] = await db
					.select({ total: count() })
					.from(emailSend)
					.where(
						and(
							eq(emailSend.organizationId, payload.organizationId),
							gte(emailSend.sentAt, todayStart),
						),
					);

				const snap = usageSnapshot as {
					creditsUsed: number;
					creditsRemaining: number;
					monthlyCredits: number;
					periodStart: Date;
					periodEnd: Date;
				};

				const usageUpdatedPayload = {
					organizationId: payload.organizationId,
					creditsUsed: snap.creditsUsed,
					creditsRemaining: snap.creditsRemaining,
					monthlyCredits: snap.monthlyCredits,
					periodStart: snap.periodStart.toISOString(),
					periodEnd: snap.periodEnd.toISOString(),
					emailsSentToday: Number(todayRow?.total ?? 0),
				};

				await bus.publish(BusEvent.USAGE_UPDATED, usageUpdatedPayload);

				// 7. Quota threshold alerts
				const usageRatio = snap.creditsUsed / snap.monthlyCredits;

				if (snap.creditsRemaining <= 0) {
					await bus.publish(BusEvent.QUOTA_EXCEEDED, {
						organizationId: payload.organizationId,
						creditsUsed: snap.creditsUsed,
						monthlyCredits: snap.monthlyCredits,
					});
					log.warn({
						...{ organizationId: payload.organizationId },
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
						...{ organizationId: payload.organizationId, usageRatio },
						message: "Quota warning threshold reached",
					});
				}

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
