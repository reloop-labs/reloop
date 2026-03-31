import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { WEBHOOK_EVENTS_BY_ID } from "@reloop/webhook-events";
import type { SubscriptionTypes } from "@reloop/webhook/routes/subscription/subscription.type";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function subscribeEvent(
	webhookId: string,
	eventIds: string[],
	organizationId: string,
): Promise<SubscriptionTypes.SubscriptionResponse[]> {
	logger.info(
		{
			webhookId,
			eventIds,
			organizationId,
		},
		"Subscribing webhook to events",
	);

	try {
		// Verify webhook exists and belongs to organization
		const webhook = await db.query.webhook.findFirst({
			where: and(
				eq(schema.webhook.id, webhookId),
				eq(schema.webhook.organizationId, organizationId),
				isNull(schema.webhook.deletedAt),
			),
		});

		if (!webhook) {
			logger.warn({ webhookId, organizationId }, "Webhook not found");
			throw status(404, { message: "Webhook not found" });
		}

		const allEventsExist = eventIds.every((eventId) =>
			WEBHOOK_EVENTS_BY_ID.has(eventId),
		);

		if (!allEventsExist) {
			logger.warn({ eventIds }, "Some events not found");
			throw status(404, { message: "Some events not found" });
		}

		// Create subscriptions
		const subscriptions = [];
		for (const eventId of eventIds) {
			// Check if subscription already exists
			const existingSubscription =
				await db.query.webhookEventSubscription.findFirst({
					where: and(
						eq(schema.webhookEventSubscription.webhookId, webhookId),
						eq(schema.webhookEventSubscription.eventId, eventId),
					),
				});

			if (existingSubscription) {
				logger.warn({ webhookId, eventId }, "Subscription already exists");
				continue; // Skip existing subscriptions
			}

			const newSubscription = await db
				.insert(schema.webhookEventSubscription)
				.values({
					webhookId: webhookId,
					eventId: eventId,
					isEnabled: true,
					createdAt: new Date(),
					updatedAt: new Date(),
				})
				.returning();

			if (newSubscription[0]) {
				subscriptions.push({
					id: newSubscription[0].id,
					webhookId: newSubscription[0].webhookId,
					eventId: newSubscription[0].eventId,
					isEnabled: newSubscription[0].isEnabled,
					createdAt: newSubscription[0].createdAt.toISOString(),
					updatedAt: newSubscription[0].updatedAt.toISOString(),
				});
			}
		}

		logger.info(
			{
				webhookId,
				eventIds,
				subscriptionsCreated: subscriptions.length,
			},
			"Event subscriptions created successfully",
		);

		return subscriptions;
	} catch (error) {
		logger.error(
			{
				webhookId,
				eventIds,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error subscribing to events",
		);
		throw error;
	}
}

export async function subscribeEventHandler(
	webhookId: string,
	body: SubscriptionTypes.SubscribeRequest,
	organizationId: string,
): Promise<SubscriptionTypes.SubscriptionResponse[]> {
	logger.info(
		{
			webhookId,
			eventIds: body.eventIds,
			organizationId,
		},
		"Subscribing webhook to events",
	);

	try {
		const subscriptions = await subscribeEvent(
			webhookId,
			body.eventIds,
			organizationId,
		);

		logger.info(
			{
				webhookId,
				eventIds: body.eventIds,
				subscriptionsCreated: subscriptions.length,
			},
			"Event subscriptions created successfully",
		);

		return subscriptions;
	} catch (error) {
		logger.error(
			{
				webhookId,
				eventIds: body.eventIds,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error subscribing to events",
		);
		throw error;
	}
}
