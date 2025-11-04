import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import type { WebhookTypes } from "../webhook.type";

export async function listWebhooks(
	query: WebhookTypes.WebhookQuery,
	organizationId: string,
): Promise<WebhookTypes.WebhookListResponse> {
	const { page = 1, limit = 10, status } = query;
	const offset = (page - 1) * limit;

	logger.info(
		{
			page,
			limit,
			status,
			organizationId,
		},
		"Listing webhooks",
	);

	try {
		const conditions = [
			isNull(schema.webhook.deletedAt),
			eq(schema.webhook.organizationId, organizationId),
		];
		if (status !== undefined)
			conditions.push(eq(schema.webhook.status, status));
		const whereClause = and(...conditions);

		const totalResult = await db
			.select({ count: count() })
			.from(schema.webhook)
			.where(whereClause);
		const total = totalResult[0]?.count || 0;

		const result = await db.query.webhook.findMany({
			where: whereClause,
			orderBy: desc(schema.webhook.createdAt),
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
			"Webhooks listed successfully",
		);

		return {
			webhooks: result.map((webhook) => ({
				id: webhook.id,
				name: webhook.name,
				url: webhook.url,
				secret: webhook.secret ? "***masked***" : null,
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
				createdAt: webhook.createdAt.toISOString(),
				updatedAt: webhook.updatedAt.toISOString(),
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
			"Error listing webhooks",
		);
		throw error;
	}
}

export async function listWebhooksHandler(
	query: WebhookTypes.WebhookQuery,
	organizationId: string,
): Promise<WebhookTypes.WebhookListResponse> {
	logger.info({ query, organizationId }, "Listing webhooks");

	try {
		const result = await listWebhooks(query, organizationId);
		logger.info({ query, organizationId }, "Webhooks listed successfully");
		return result;
	} catch (error) {
		logger.error(
			{
				query,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error listing webhooks",
		);
		throw error;
	}
}
