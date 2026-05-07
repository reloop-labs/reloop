import { bus, BusEvent } from "@reloop/bus";
import { db } from "@reloop/db/client";
import {
	billingInvoice,
	creditLedger,
	emailSend,
	plan,
	subscription,
} from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, sql } from "drizzle-orm";
import { billingConfig } from "./billing.config";

export async function loader() {
	logger.info("Initializing Billing Service Subscribers...");

	// Handle Organization Created - Initialize subscription and credits
	await bus.subscribe(BusEvent.ORGANIZATION_CREATED, async (payload) => {
		logger.info({ organizationId: payload.id }, "Handling ORGANIZATION_CREATED");
		try {
			await db.transaction(async (tx) => {
				// 1. Get or create a default "Free" plan
				let defaultPlan = await tx.query.plan.findFirst({
					where: eq(plan.name, "Free"),
				});

				if (!defaultPlan) {
					[defaultPlan] = await tx
						.insert(plan)
						.values({
							name: "Free",
							monthlyCredits: billingConfig.initialCredits,
							basePriceUsd: "0",
							isActive: true,
						})
						.returning();
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
			logger.info({ organizationId: payload.id }, "Initialized subscription for new organization");
		} catch (error) {
			logger.error({ error, organizationId: payload.id }, "Failed to initialize subscription");
		}
	});

	// Handle Email Sent - Deduct credits
	await bus.subscribe(BusEvent.EMAIL_SENT, async (payload) => {
		logger.info({ organizationId: payload.organizationId, count: payload.recipientCount }, "Handling EMAIL_SENT");
		try {
			await db.transaction(async (tx) => {
				// 1. Find active subscription
				const activeSub = await tx.query.subscription.findFirst({
					where: (s, { and, eq }) => and(
						eq(s.organizationId, payload.organizationId),
						eq(s.status, "active")
					),
				});

				if (!activeSub) {
					logger.warn({ organizationId: payload.organizationId }, "No active subscription found for credit deduction");
					return;
				}

				// 2. Create email_send record for billing audit
				const [sendRecord] = await tx.insert(emailSend).values({
					organizationId: payload.organizationId,
					subscriptionId: activeSub.id,
					recipientEmail: "multiple@recipients.info", // simplified for batch events
					countedInCredits: true,
					creditsConsumed: payload.recipientCount,
					status: "sent",
					sentAt: new Date(),
				}).returning();

				// 3. Update subscription counters
				await tx
					.update(subscription)
					.set({
						creditsUsed: sql`${subscription.creditsUsed} + ${payload.recipientCount}`,
						creditsRemaining: sql`${subscription.creditsRemaining} - ${payload.recipientCount}`,
						updatedAt: new Date(),
					})
					.where(eq(subscription.id, activeSub.id));

				// 4. Log in credit ledger
				await tx.insert(creditLedger).values({
					organizationId: payload.organizationId,
					subscriptionId: activeSub.id,
					entryType: "email_sent",
					delta: -payload.recipientCount,
					balanceAfter: activeSub.creditsRemaining - payload.recipientCount,
					reason: `Sent email with ${payload.recipientCount} recipients`,
					referenceId: sendRecord.id,
				});
			});
			logger.info({ organizationId: payload.organizationId }, "Deducted credits and updated ledger");
		} catch (error) {
			logger.error({ error, organizationId: payload.organizationId }, "Failed to deduct credits");
		}
	});
}
