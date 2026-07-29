import { createId } from "@paralleldrive/cuid2";
import { decryptSecret, encryptSecret } from "@reloop/db";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { WebhookErrors } from "@reloop/webhook/error/webhook.error-response";
import type { WebhookEventName } from "@reloop/webhook-events";
import { eq } from "drizzle-orm";
import { log } from "evlog";
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
	log.info({ ...{ url, events, description }, message: "Creating webhook" });
	try {
		const rawSecret = `whsec_${createId()}`;
		const encryptedSecret = encryptSecret(rawSecret);

		const [newWebhook] = await db
			.insert(schema.webhook)
			.values({
				name: description,
				url,
				secret: encryptedSecret,
				organizationId,
				userId,
				status: "active",
				customHeaders: null,
				rateLimitEnabled: true,
				maxRequestsPerMinute: 60,
				// Align with documented default of 7 total delivery attempts.
				maxRetries: 7,
				retryBackoffMultiplier: 2,
				filteringOptions: null,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newWebhook) {
			log.error({ ...{ url, events }, message: "Failed to create webhook" });
			throw WebhookErrors.createFailed();
		}

		log.info({
			...{ webhookId: newWebhook.id },
			message: "Creating webhook subscriptions",
		});
		if (events.length > 0) {
			await db.insert(schema.webhookEventSubscription).values(
				events.map((eventId) => ({
					webhookId: newWebhook.id,
					eventId,
					isEnabled: true,
				})),
			);
		}

		const creator = await db.query.user.findFirst({
			where: eq(schema.user.id, userId),
			columns: { id: true, name: true, email: true, image: true },
		});

		return {
			id: newWebhook.id,
			name: newWebhook.name,
			url: newWebhook.url,
			secret: decryptSecret(newWebhook.secret),
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
			createdBy: creator
				? {
						id: creator.id,
						name: creator.name,
						email: creator.email,
						image: creator.image,
					}
				: undefined,
			createdAt: newWebhook.createdAt.toISOString(),
			updatedAt: newWebhook.updatedAt.toISOString(),
		};
	} catch (error) {
		log.error({ ...{ url, error }, message: "Error creating webhook" });
		if (error && typeof error === "object" && "status" in error) {
			throw error;
		}
		throw WebhookErrors.createFailed();
	}
}
