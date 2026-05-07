import { bus, BusEvent } from "@reloop/bus";
import { db } from "@reloop/db/client";
import { credits, creditTransactions } from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { eq, sql } from "drizzle-orm";
import { creditsConfig } from "./credits.config";

export async function loader() {
	logger.info("Initializing Credits Service Subscribers...");

	// Handle Organization Created - Initialize credits
	await bus.subscribe(BusEvent.ORGANIZATION_CREATED, async (payload) => {
		logger.info({ organizationId: payload.id }, "Handling ORGANIZATION_CREATED");
		try {
			await db.transaction(async (tx) => {
				// Create initial credits record
				await tx
					.insert(credits)
					.values({
						organizationId: payload.id,
						amount: creditsConfig.initialCredits,
					})
					.onConflictDoNothing();

				// Log the initial transaction
				await tx
					.insert(creditTransactions)
					.values({
						organizationId: payload.id,
						amount: creditsConfig.initialCredits,
						type: "initial",
						metadata: { reason: "Organization welcome bonus" },
					});
			});
			logger.info({ organizationId: payload.id }, "Initialized credits for new organization");
		} catch (error) {
			logger.error({ error, organizationId: payload.id }, "Failed to initialize credits");
		}
	});

	// Handle Email Sent - Deduct credits
	await bus.subscribe(BusEvent.EMAIL_SENT, async (payload) => {
		logger.info({ organizationId: payload.organizationId, count: payload.recipientCount }, "Handling EMAIL_SENT");
		try {
			await db.transaction(async (tx) => {
				// Deduct from credits table
				const result = await tx
					.update(credits)
					.set({
						amount: sql`${credits.amount} - ${payload.recipientCount}`,
						updatedAt: new Date(),
					})
					.where(eq(credits.organizationId, payload.organizationId))
					.returning();

				// If organization doesn't have a credits record yet, create one (fallback)
				if (result.length === 0) {
					await tx
						.insert(credits)
						.values({
							organizationId: payload.organizationId,
							amount: creditsConfig.initialCredits - payload.recipientCount,
						});
				}

				// Log the transaction
				await tx
					.insert(creditTransactions)
					.values({
						organizationId: payload.organizationId,
						amount: -payload.recipientCount,
						type: "usage",
						metadata: {
							emailLogId: payload.emailLogId,
							recipientCount: payload.recipientCount,
						},
					});
			});
			logger.info({ organizationId: payload.organizationId }, "Deducted credits for email");
		} catch (error) {
			logger.error({ error, organizationId: payload.organizationId }, "Failed to deduct credits");
		}
	});
}
