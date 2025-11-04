import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import type { WebhookTypes } from "../webhook.type";

export async function getWebhook(
	webhookId: string,
	organizationId: string,
): Promise<WebhookTypes.WebhookResponse> {
	logger.info(
		{
			webhookId,
			organizationId,
		},
		"Getting webhook",
	);

	try {
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

		logger.info(
			{
				webhookId,
				organizationId,
			},
			"Webhook retrieved successfully",
		);

		// Format response (return actual secret)
		return {
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
			createdAt: webhook.createdAt.toISOString(),
			updatedAt: webhook.updatedAt.toISOString(),
		};
	} catch (error) {
		logger.error(
			{
				webhookId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting webhook",
		);
		throw error;
	}
}

export async function getWebhookHandler(
	webhookId: string,
	organizationId: string,
): Promise<WebhookTypes.WebhookResponse> {
	logger.info(
		{
			webhookId,
			organizationId,
		},
		"Getting webhook",
	);

	try {
		const webhook = await getWebhook(webhookId, organizationId);

		logger.info(
			{
				webhookId,
				organizationId,
			},
			"Webhook retrieved successfully",
		);

		return webhook;
	} catch (error) {
		logger.error(
			{
				webhookId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting webhook",
		);
		throw error;
	}
}
