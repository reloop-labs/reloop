import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import {
	billingInvoice,
	creditLedger,
	emailSend,
	plan,
	subscription,
} from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, eq, gte, sql } from "drizzle-orm";

import { billingConfig } from "./billing.config";

export async function loader() {
	logger.info("Initializing Billing Service Subscribers...");

	try {
		await bus.connect(billingConfig.NATS_URL);
		logger.info("NATS connected in Billing Service");
	} catch (error) {
		logger.error({ error }, "Failed to connect to NATS in Billing Service");
	}

	// ── ORGANIZATION_CREATED — Initialize subscription + credits ──────────────
	await bus.subscribe(BusEvent.ORGANIZATION_CREATED, async (payload) => {
		logger.info({ organizationId: payload.id }, "Handling ORGANIZATION_CREATED");
		try {
			await db.transaction(async (tx) => {
				// 1. Get or create a default "Free" plan
				let defaultPlan = await tx.query.plan.findFirst({
					where: eq(plan.name, "Free"),
				});

				if (!defaultPlan) {
					const [insertedPlan] = await tx
						.insert(plan)
						.values({
							name: "Free",
							monthlyCredits: billingConfig.initialCredits,
							basePriceUsd: "0",
							isActive: true,
							// Free plan rate limits
							ratePerSecond: 10,
							ratePerMinute: 200,
							ratePerHour: 5000,
							maxAttachmentSizeMb: 5,
						})
						.returning();

					if (!insertedPlan) throw new Error("Failed to create default plan");
					defaultPlan = insertedPlan;
				}

				// 2. Create subscription
				const now = new Date();
				const nextMonth = new Date(now);
				nextMonth.setMonth(nextMonth.getMonth() + 1);

				const [newSub] = await tx
					.insert(subscription)
					.values({
						organizationId: payload.id,
						planId: defaultPlan.id,
						status: "active",
						creditsRemaining: defaultPlan.monthlyCredits,
						currentPeriodStart: now,
						currentPeriodEnd: nextMonth,
					})
					.onConflictDoNothing()
					.returning();

				if (newSub) {
					// 3. Log initial credits in ledger
					await tx.insert(creditLedger).values({
						organizationId: payload.id,
						subscriptionId: newSub.id,
						entryType: "credit_purchased",
						delta: defaultPlan.monthlyCredits,
						balanceAfter: defaultPlan.monthlyCredits,
						reason: "Initial free plan quota",
					});
				}
			});

			logger.info(
				{ organizationId: payload.id },
				"Initialized subscription for new organization",
			);
		} catch (error) {
			logger.error(
				{ error, organizationId: payload.id },
				"Failed to initialize subscription",
			);
		}
	});

	// ── EMAIL_SENT — Deduct credits + publish USAGE_UPDATED ───────────────────
	await bus.subscribe(BusEvent.EMAIL_SENT, async (payload) => {
		logger.info(
			{ organizationId: payload.organizationId, count: payload.recipientCount },
			"Handling EMAIL_SENT",
		);
		try {
			let usageSnapshot: {
				creditsUsed: number;
				creditsRemaining: number;
				monthlyCredits: number;
				periodStart: Date;
				periodEnd: Date;
			} | null = null;

			await db.transaction(async (tx) => {
				// 1. Find active subscription with plan
				const activeSub = await tx.query.subscription.findFirst({
					where: (s, { and, eq }) =>
						and(
							eq(s.organizationId, payload.organizationId),
							eq(s.status, "active"),
						),
					with: { plan: true },
				});

				if (!activeSub) {
					logger.warn(
						{ organizationId: payload.organizationId },
						"No active subscription found for credit deduction",
					);
					return;
				}

				// 2. Create email_send record for billing audit
				const [sendRecord] = await tx
					.insert(emailSend)
					.values({
						organizationId: payload.organizationId,
						subscriptionId: activeSub.id,
						recipientEmail: "multiple@recipients.info", // simplified for batch events
						countedInCredits: true,
						creditsConsumed: payload.recipientCount,
						status: "sent",
						sentAt: new Date(),
					})
					.returning();

				// 3. Update subscription counters
				const newCreditsUsed = activeSub.creditsUsed + payload.recipientCount;
				const newCreditsRemaining = Math.max(
					0,
					activeSub.creditsRemaining - payload.recipientCount,
				);

				await tx
					.update(subscription)
					.set({
						creditsUsed: sql`${subscription.creditsUsed} + ${payload.recipientCount}`,
						creditsRemaining: sql`GREATEST(0, ${subscription.creditsRemaining} - ${payload.recipientCount})`,
						updatedAt: new Date(),
					})
					.where(eq(subscription.id, activeSub.id));

				// 4. Log in credit ledger
				if (sendRecord) {
					await tx.insert(creditLedger).values({
						organizationId: payload.organizationId,
						subscriptionId: activeSub.id,
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
					monthlyCredits: activeSub.plan.monthlyCredits,
					periodStart: activeSub.currentPeriodStart,
					periodEnd: activeSub.currentPeriodEnd,
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
				logger.warn(
					{ organizationId: payload.organizationId },
					"Quota exceeded — published QUOTA_EXCEEDED",
				);
			} else if (usageRatio >= 0.8) {
				// Fire QUOTA_WARNING at 80% and again at 90%
				await bus.publish(BusEvent.QUOTA_WARNING, {
					email: "", // email service enriches this from org lookup if needed
					percentage: Math.round(usageRatio * 100),
					resourceType: "email_credits",
				});
				logger.warn(
					{ organizationId: payload.organizationId, usageRatio },
					"Quota warning threshold reached",
				);
			}

			logger.info(
				{ organizationId: payload.organizationId },
				"Deducted credits, published USAGE_UPDATED",
			);
		} catch (error) {
			logger.error(
				{ error, organizationId: payload.organizationId },
				"Failed to deduct credits",
			);
		}
	});
}
