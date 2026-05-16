import { log } from "evlog";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";

import type { WebhookEventName } from "@reloop/webhook-events";
import { status } from "elysia";
import type { WebhookTypes } from "../webhook.type";

export async function createWebhookController({
	organizationId,
	userId,
	description,
	url,
	events,
}: {
	organizationId: string;
	userId: string;
	description: string;
	url: string;
	events: WebhookEventName[];
}): Promise<WebhookTypes.WebhookResponse> {
	log.info({ ...({ url, events, description }), message: "Creating webhook" });
	try {
		const [newWebhook] = await db
			.insert(schema.webhook)
			.values({
				name: description,
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
			log.error({ ...({ url, events }), message: "Failed to create webhook" });
			throw status(500, { message: "Failed to create webhook" });
		}

		log.info({ ...({ webhookId: newWebhook.id }), message: "Creating webhook subscriptions" });
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
		log.error({ ...({ url, error }), message: "Error creating webhook" });
		throw error;
	}
}
