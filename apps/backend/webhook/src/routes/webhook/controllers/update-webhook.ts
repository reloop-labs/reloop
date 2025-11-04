import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import type { WebhookTypes } from "../webhook.type";

export async function updateWebhook(
	webhookId: string,
	organizationId: string,
	updateData: WebhookTypes.UpdateWebhookRequest,
): Promise<WebhookTypes.WebhookResponse> {
	logger.info(
		{
			webhookId,
			organizationId,
			updateData,
		},
		"Updating webhook",
	);

	try {
		// Check if webhook exists and belongs to organization
		const existingWebhook = await db.query.webhook.findFirst({
			where: and(
				eq(schema.webhook.id, webhookId),
				eq(schema.webhook.organizationId, organizationId),
				isNull(schema.webhook.deletedAt),
			),
		});

		if (!existingWebhook) {
			logger.warn({ webhookId, organizationId }, "Webhook not found");
			throw status(404, { message: "Webhook not found" });
		}

		// Check if new name conflicts with existing webhook
		if (updateData.name && updateData.name !== existingWebhook.name) {
			const nameConflict = await db
				.select()
				.from(schema.webhook)
				.where(
					and(
						eq(schema.webhook.name, updateData.name),
						eq(schema.webhook.organizationId, organizationId),
						eq(schema.webhook.id, webhookId),
						isNull(schema.webhook.deletedAt),
					),
				)
				.limit(1);

			if (nameConflict.length > 0) {
				logger.warn(
					{ name: updateData.name, organizationId },
					"Webhook name already exists",
				);
				throw status(409, { message: "Webhook name already exists" });
			}
		}

		// Prepare update data
		const updateValues: Partial<typeof schema.webhook.$inferInsert> = {
			updatedAt: new Date(),
		};

		if (updateData.name !== undefined) updateValues.name = updateData.name;
		if (updateData.url !== undefined) updateValues.url = updateData.url;
		if (updateData.secret !== undefined)
			updateValues.secret = updateData.secret;
		if (updateData.status !== undefined)
			updateValues.status = updateData.status;
		if (updateData.customHeaders !== undefined)
			updateValues.customHeaders = updateData.customHeaders;
		if (updateData.rateLimitEnabled !== undefined)
			updateValues.rateLimitEnabled = updateData.rateLimitEnabled;
		if (updateData.maxRequestsPerMinute !== undefined)
			updateValues.maxRequestsPerMinute = updateData.maxRequestsPerMinute;
		if (updateData.maxRetries !== undefined)
			updateValues.maxRetries = updateData.maxRetries;
		if (updateData.retryBackoffMultiplier !== undefined)
			updateValues.retryBackoffMultiplier = updateData.retryBackoffMultiplier;
		if (updateData.filteringOptions !== undefined)
			updateValues.filteringOptions = updateData.filteringOptions;

		// Update webhook
		const updatedWebhook = await db
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

		if (!updatedWebhook[0]) {
			logger.error(
				{ webhookId },
				"Failed to update webhook - no data returned",
			);
			throw status(500, { message: "Failed to update webhook" });
		}

		logger.info(
			{
				webhookId,
				organizationId,
			},
			"Webhook updated successfully",
		);

		// Format response (mask secret)
		return {
			id: updatedWebhook[0].id,
			name: updatedWebhook[0].name,
			url: updatedWebhook[0].url,
			secret: updatedWebhook[0].secret ? "***masked***" : null,
			organizationId: updatedWebhook[0].organizationId,
			userId: updatedWebhook[0].userId,
			status: updatedWebhook[0].status,
			customHeaders: updatedWebhook[0].customHeaders,
			rateLimitEnabled: updatedWebhook[0].rateLimitEnabled,
			maxRequestsPerMinute: updatedWebhook[0].maxRequestsPerMinute,
			maxRetries: updatedWebhook[0].maxRetries,
			retryBackoffMultiplier: updatedWebhook[0].retryBackoffMultiplier,
			filteringOptions: updatedWebhook[0].filteringOptions,
			lastTriggeredAt: updatedWebhook[0].lastTriggeredAt?.toISOString() || null,
			successCount: updatedWebhook[0].successCount,
			failureCount: updatedWebhook[0].failureCount,
			consecutiveFailures: updatedWebhook[0].consecutiveFailures,
			createdAt: updatedWebhook[0].createdAt.toISOString(),
			updatedAt: updatedWebhook[0].updatedAt.toISOString(),
		};
	} catch (error) {
		logger.error(
			{
				webhookId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error updating webhook",
		);
		throw error;
	}
}

export async function updateWebhookHandler(
	webhookId: string,
	organizationId: string,
	body: WebhookTypes.UpdateWebhookRequest,
): Promise<WebhookTypes.WebhookResponse> {
	logger.info(
		{
			webhookId,
			organizationId,
			body,
		},
		"Updating webhook",
	);

	try {
		const webhook = await updateWebhook(webhookId, organizationId, body);

		logger.info(
			{
				webhookId,
				organizationId,
			},
			"Webhook updated successfully",
		);

		return webhook;
	} catch (error) {
		logger.error(
			{
				webhookId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error updating webhook",
		);
		throw error;
	}
}
