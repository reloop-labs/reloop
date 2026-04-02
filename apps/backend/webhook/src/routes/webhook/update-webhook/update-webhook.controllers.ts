import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
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
	logger.info({ webhookId, organizationId, body }, "Updating webhook");

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

		if (body.name && body.name !== existingWebhook.name) {
			const nameConflict = await db
				.select({ id: schema.webhook.id })
				.from(schema.webhook)
				.where(
					and(
						eq(schema.webhook.name, body.name),
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

		if (body.name !== undefined) updateValues.name = body.name;
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

		return {
			id: updatedWebhook.id,
			name: updatedWebhook.name,
			url: updatedWebhook.url,
			secret: updatedWebhook.secret,
			organizationId: updatedWebhook.organizationId,
			userId: updatedWebhook.userId,
			status: updatedWebhook.status,
			customHeaders: updatedWebhook.customHeaders,
			rateLimitEnabled: updatedWebhook.rateLimitEnabled,
			maxRequestsPerMinute: updatedWebhook.maxRequestsPerMinute,
			maxRetries: updatedWebhook.maxRetries,
			retryBackoffMultiplier: updatedWebhook.retryBackoffMultiplier,
			filteringOptions: updatedWebhook.filteringOptions,
			lastTriggeredAt: updatedWebhook.lastTriggeredAt?.toISOString() || null,
			successCount: updatedWebhook.successCount,
			failureCount: updatedWebhook.failureCount,
			consecutiveFailures: updatedWebhook.consecutiveFailures,
			createdAt: updatedWebhook.createdAt.toISOString(),
			updatedAt: updatedWebhook.updatedAt.toISOString(),
		};
	} catch (error) {
		logger.error({ webhookId, organizationId, body, error }, "Error updating webhook");
		throw error;
	}
}
