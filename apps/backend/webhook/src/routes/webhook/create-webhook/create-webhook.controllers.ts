import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { status } from "elysia";
import type { WebhookTypes } from "../webhook.type";

export async function createWebhookController({
	organizationId,
	userId,
	url,
	events,
}: {
	organizationId: string;
	userId: string;
	url: string;
	events: string[];
}): Promise<WebhookTypes.WebhookResponse> {
	logger.info({ url, events }, "Creating webhook");

	try {
		const [newWebhook] = await db
			.insert(schema.webhook)
			.values({
				name: `webhook_${createId()}`,
				url,
				secret: `whsec_${createId()}`,
				organizationId,
				userId,
				status: "active",
				customHeaders: null,
				rateLimitEnabled: true,
				maxRequestsPerMinute: 60,
				maxRetries: 3,
				retryBackoffMultiplier: 2,
				filteringOptions: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newWebhook) {
			throw status(500, { message: "Failed to create webhook" });
		}

		if (events.length > 0) {
			await db.insert(schema.webhookEventSubscription).values(
				events.map((eventId) => ({
					webhookId: newWebhook.id,
					eventId,
					isEnabled: true,
				})),
			);
		}

		return {
			id: newWebhook.id,
			name: newWebhook.name,
			url: newWebhook.url,
			secret: newWebhook.secret,
			organizationId: newWebhook.organizationId,
			userId: newWebhook.userId,
			status: newWebhook.status,
			customHeaders: newWebhook.customHeaders,
			rateLimitEnabled: newWebhook.rateLimitEnabled,
			maxRequestsPerMinute: newWebhook.maxRequestsPerMinute,
			maxRetries: newWebhook.maxRetries,
			retryBackoffMultiplier: newWebhook.retryBackoffMultiplier,
			filteringOptions: newWebhook.filteringOptions,
			lastTriggeredAt: newWebhook.lastTriggeredAt?.toISOString() || null,
			successCount: newWebhook.successCount,
			failureCount: newWebhook.failureCount,
			consecutiveFailures: newWebhook.consecutiveFailures,
			events,
			createdAt: newWebhook.createdAt.toISOString(),
			updatedAt: newWebhook.updatedAt.toISOString(),
		};
	} catch (error) {
		logger.error({ url, error, }, "Error creating webhook",);
		throw error;
	}
}
