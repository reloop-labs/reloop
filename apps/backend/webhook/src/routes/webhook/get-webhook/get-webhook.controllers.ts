import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import type { WebhookTypes } from "../webhook.type";

export async function getWebhookController({
	webhookId,
	organizationId,
}: {
	webhookId: string;
	organizationId: string;
}): Promise<WebhookTypes.WebhookResponse> {
	logger.info({ webhookId, organizationId }, "Getting webhook");

	try {
		const webhook = await db.query.webhook.findFirst({
			where: and(
				eq(schema.webhook.id, webhookId),
				eq(schema.webhook.organizationId, organizationId),
				isNull(schema.webhook.deletedAt),
			),
			with: {
				subscriptions: {
					where: eq(schema.webhookEventSubscription.isEnabled, true),
				},
			},
		});

		if (!webhook) {
			throw status(404, { message: "Webhook not found" });
		}

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
			events: webhook.subscriptions.map((s) => s.eventId),
			createdAt: webhook.createdAt.toISOString(),
			updatedAt: webhook.updatedAt.toISOString(),
		};
	} catch (error) {
		logger.error({ webhookId, organizationId, error }, "Error getting webhook");
		throw error;
	}
}
