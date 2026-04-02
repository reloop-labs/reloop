import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import type { WebhookTypes } from "../webhook.type";

export async function listWebhooksController({
	query,
	organizationId,
}: {
	query: WebhookTypes.WebhookQuery;
	organizationId: string;
}): Promise<WebhookTypes.WebhookListResponse> {
	const { page = 1, limit = 10, status } = query;
	const offset = (page - 1) * limit;

	logger.info({ query, organizationId }, "Listing webhooks");

	try {
		const conditions = [
			isNull(schema.webhook.deletedAt),
			eq(schema.webhook.organizationId, organizationId),
		];

		if (status !== undefined) {
			conditions.push(eq(schema.webhook.status, status));
		}

		const whereClause = and(...conditions);
		const [{ count: total = 0 } = { count: 0 }] = await db
			.select({ count: count() })
			.from(schema.webhook)
			.where(whereClause);

		const webhooks = await db.query.webhook.findMany({
			where: whereClause,
			orderBy: desc(schema.webhook.createdAt),
			limit,
			offset,
			with: {
				subscriptions: {
					where: eq(schema.webhookEventSubscription.isEnabled, true),
				},
			},
		});

		return {
			webhooks: webhooks.map((webhook) => ({
				id: webhook.id,
				name: webhook.name,
				url: webhook.url,
				secret: webhook.secret,
				organizationId: webhook.organizationId,
				userId: webhook.userId,
				status: webhook.status,
				customHeaders: webhook.customHeaders,
				rateLimitEnabled: webhook.rateLimitEnabled,
				maxRequestsPerMinute: webhook.maxRequestsPerMinute,
				maxRetries: webhook.maxRetries,
				retryBackoffMultiplier: webhook.retryBackoffMultiplier,
				filteringOptions: webhook.filteringOptions,
				lastTriggeredAt: webhook.lastTriggeredAt?.toISOString() || null,
				successCount: webhook.successCount,
				failureCount: webhook.failureCount,
				consecutiveFailures: webhook.consecutiveFailures,
				events: webhook.subscriptions.map((s) => s.eventId),
				createdAt: webhook.createdAt.toISOString(),
				updatedAt: webhook.updatedAt.toISOString(),
			})),
			total,
			page,
			limit,
		};
	} catch (error) {
		logger.error({ query, organizationId, error }, "Error listing webhooks");
		throw error;
	}
}
