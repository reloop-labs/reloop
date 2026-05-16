import { log } from "evlog";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";

import type { WebhookEventName } from "@reloop/webhook-events";
import { and, eq, isNull, ne } from "drizzle-orm";
import { status } from "elysia";
import type { WebhookTypes } from "../webhook.type";

export async function updateWebhookController({
	webhookId,
	organizationId,
	body,
}: {
	webhookId: string;
	organizationId: string;
	body: WebhookTypes.UpdateWebhookRequest;
}): Promise<WebhookTypes.WebhookResponse> {
	log.info({ ...({ webhookId, organizationId, body }), message: "Updating webhook" });

	try {
		const existingWebhook = await db.query.webhook.findFirst({
			where: and(
				eq(schema.webhook.id, webhookId),
				eq(schema.webhook.organizationId, organizationId),
				isNull(schema.webhook.deletedAt),
			),
		});

		if (!existingWebhook) {
			throw status(404, { message: "Webhook not found" });
		}

		const nameToUpdate = body.description ?? body.name;
		if (nameToUpdate && nameToUpdate !== existingWebhook.name) {
			const nameConflict = await db
				.select({ id: schema.webhook.id })
				.from(schema.webhook)
				.where(
					and(
						eq(schema.webhook.name, nameToUpdate),
						eq(schema.webhook.organizationId, organizationId),
						ne(schema.webhook.id, webhookId),
						isNull(schema.webhook.deletedAt),
					),
				)
				.limit(1);

			if (nameConflict[0]) {
				throw status(409, { message: "Webhook name already exists" });
			}
		}

		const updateValues: Partial<typeof schema.webhook.$inferInsert> = {
			updatedAt: new Date(),
		};

		if (nameToUpdate !== undefined) updateValues.name = nameToUpdate;
		if (body.url !== undefined) updateValues.url = body.url;
		if (body.secret !== undefined) updateValues.secret = body.secret;
		if (body.status !== undefined) updateValues.status = body.status;
		if (body.customHeaders !== undefined) {
			updateValues.customHeaders = body.customHeaders;
		}
		if (body.rateLimitEnabled !== undefined) {
			updateValues.rateLimitEnabled = body.rateLimitEnabled;
		}
		if (body.maxRequestsPerMinute !== undefined) {
			updateValues.maxRequestsPerMinute = body.maxRequestsPerMinute;
		}
		if (body.maxRetries !== undefined) {
			updateValues.maxRetries = body.maxRetries;
		}
		if (body.retryBackoffMultiplier !== undefined) {
			updateValues.retryBackoffMultiplier = body.retryBackoffMultiplier;
		}
		if (body.filteringOptions !== undefined) {
			updateValues.filteringOptions = body.filteringOptions;
		}

		const [updatedWebhook] = await db
			.update(schema.webhook)
			.set(updateValues)
			.where(
				and(
					eq(schema.webhook.id, webhookId),
					eq(schema.webhook.organizationId, organizationId),
					isNull(schema.webhook.deletedAt),
				),
			)
			.returning();

		if (!updatedWebhook) {
			throw status(500, { message: "Failed to update webhook" });
		}

		const updatedWebhookWithSubs = await db.query.webhook.findFirst({
			where: and(
				eq(schema.webhook.id, updatedWebhook.id),
				eq(schema.webhook.organizationId, organizationId),
			),
			with: {
				subscriptions: {
					where: eq(schema.webhookEventSubscription.isEnabled, true),
				},
			},
		});

		if (!updatedWebhookWithSubs) {
			throw status(500, { message: "Failed to fetch updated webhook" });
		}

		return {
			id: updatedWebhookWithSubs.id,
			name: updatedWebhookWithSubs.name,
			url: updatedWebhookWithSubs.url,
			secret: updatedWebhookWithSubs.secret,
			status: updatedWebhookWithSubs.status,
			customHeaders: updatedWebhookWithSubs.customHeaders,
			rateLimitEnabled: updatedWebhookWithSubs.rateLimitEnabled,
			maxRequestsPerMinute: updatedWebhookWithSubs.maxRequestsPerMinute,
			maxRetries: updatedWebhookWithSubs.maxRetries,
			retryBackoffMultiplier: updatedWebhookWithSubs.retryBackoffMultiplier,
			filteringOptions: updatedWebhookWithSubs.filteringOptions,
			lastTriggeredAt:
				updatedWebhookWithSubs.lastTriggeredAt?.toISOString() || null,
			successCount: updatedWebhookWithSubs.successCount,
			failureCount: updatedWebhookWithSubs.failureCount,
			consecutiveFailures: updatedWebhookWithSubs.consecutiveFailures,
			events: updatedWebhookWithSubs.subscriptions.map(
				(s) => s.eventId as WebhookEventName,
			),
			createdAt: updatedWebhookWithSubs.createdAt.toISOString(),
			updatedAt: updatedWebhookWithSubs.updatedAt.toISOString(),
		};
	} catch (error) {
		log.error({ ...({ webhookId, organizationId, body, error }), message: "Error updating webhook" });
		throw error;
	}
}
