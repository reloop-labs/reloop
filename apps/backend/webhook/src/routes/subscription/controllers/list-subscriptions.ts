import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import type { SubscriptionTypes } from "@reloop/webhook/routes/subscription/subscription.type";
import { and, count, desc, eq } from "drizzle-orm";

export async function listSubscriptions(
	query: SubscriptionTypes.SubscriptionListQuery,
	organizationId: string,
): Promise<SubscriptionTypes.SubscriptionListResponse> {
	const { page = 1, limit = 10, webhookId, eventId, isEnabled } = query;
	const offset = (page - 1) * limit;

	logger.info(
		{
			page,
			limit,
			webhookId,
			eventId,
			isEnabled,
			organizationId,
		},
		"Listing subscriptions",
	);

	try {
		const conditions = [];
		if (webhookId !== undefined)
			conditions.push(eq(schema.webhookEventSubscription.webhookId, webhookId));
		if (eventId !== undefined)
			conditions.push(eq(schema.webhookEventSubscription.eventId, eventId));
		if (isEnabled !== undefined)
			conditions.push(eq(schema.webhookEventSubscription.isEnabled, isEnabled));
		const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

		const totalResult = await db
			.select({ count: count() })
			.from(schema.webhookEventSubscription)
			.where(whereClause);
		const total = totalResult[0]?.count || 0;

		const result = await db.query.webhookEventSubscription.findMany({
			where: whereClause,
			orderBy: desc(schema.webhookEventSubscription.createdAt),
			limit: limit,
			offset: offset,
		});

		logger.info(
			{
				total,
				page,
				limit,
				count: result.length,
			},
			"Subscriptions listed successfully",
		);

		return {
			subscriptions: result.map((subscription) => ({
				id: subscription.id,
				webhookId: subscription.webhookId,
				eventId: subscription.eventId,
				isEnabled: subscription.isEnabled,
				createdAt: subscription.createdAt.toISOString(),
				updatedAt: subscription.updatedAt.toISOString(),
			})),
			total,
			page,
			limit,
		};
	} catch (error) {
		logger.error(
			{
				query,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error listing subscriptions",
		);
		throw error;
	}
}

export async function listSubscriptionsHandler(
	query: SubscriptionTypes.SubscriptionListQuery,
	organizationId: string,
): Promise<SubscriptionTypes.SubscriptionListResponse> {
	logger.info({ query, organizationId }, "Listing subscriptions");

	try {
		const result = await listSubscriptions(query, organizationId);
		logger.info({ query, organizationId }, "Subscriptions listed successfully");
		return result;
	} catch (error) {
		logger.error(
			{
				query,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error listing subscriptions",
		);
		throw error;
	}
}
