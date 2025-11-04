import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import type { WebhookTypes } from "../webhook.type";

export async function createWebhook(
	organizationId: string,
	userId: string,
	webhookData: WebhookTypes.CreateWebhookRequest,
): Promise<WebhookTypes.WebhookResponse> {
	logger.info(
		{
			name: webhookData.name,
			url: webhookData.url,
			organizationId,
			userId,
		},
		"Creating webhook",
	);

	try {
		// Check if webhook with same name already exists in organization
		const existingWebhook = await db
			.select()
			.from(schema.webhook)
			.where(
				and(
					eq(schema.webhook.name, webhookData.name),
					eq(schema.webhook.organizationId, organizationId),
					isNull(schema.webhook.deletedAt),
				),
			)
			.limit(1);

		if (existingWebhook.length > 0) {
			logger.warn(
				{ name: webhookData.name, organizationId },
				"Webhook name already exists",
			);
			throw status(409, { message: "Webhook name already exists" });
		}

		// Generate secret if not provided
		const secret = webhookData.secret || `whsec_${createId()}`;

		// Create webhook
		const newWebhook = await db
			.insert(schema.webhook)
			.values({
				name: webhookData.name,
				url: webhookData.url,
				secret: secret,
				organizationId: organizationId,
				userId: userId,
				status: "active",
				customHeaders: webhookData.customHeaders || null,
				rateLimitEnabled: webhookData.rateLimitEnabled ?? true,
				maxRequestsPerMinute: webhookData.maxRequestsPerMinute ?? 60,
				maxRetries: webhookData.maxRetries ?? 3,
				retryBackoffMultiplier: webhookData.retryBackoffMultiplier ?? 2,
				filteringOptions: webhookData.filteringOptions || null,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newWebhook[0]) {
			logger.error(
				{ name: webhookData.name },
				"Failed to create webhook - no data returned",
			);
			throw status(500, { message: "Failed to create webhook" });
		}

		logger.info(
			{
				id: newWebhook[0].id,
				name: webhookData.name,
				organizationId,
				userId,
			},
			"Webhook created successfully",
		);

		// Format response (mask secret)
		return {
			id: newWebhook[0].id,
			name: newWebhook[0].name,
			url: newWebhook[0].url,
			secret: newWebhook[0].secret ? "***masked***" : null,
			organizationId: newWebhook[0].organizationId,
			userId: newWebhook[0].userId,
			status: newWebhook[0].status,
			customHeaders: newWebhook[0].customHeaders,
			rateLimitEnabled: newWebhook[0].rateLimitEnabled,
			maxRequestsPerMinute: newWebhook[0].maxRequestsPerMinute,
			maxRetries: newWebhook[0].maxRetries,
			retryBackoffMultiplier: newWebhook[0].retryBackoffMultiplier,
			filteringOptions: newWebhook[0].filteringOptions,
			lastTriggeredAt: newWebhook[0].lastTriggeredAt?.toISOString() || null,
			successCount: newWebhook[0].successCount,
			failureCount: newWebhook[0].failureCount,
			consecutiveFailures: newWebhook[0].consecutiveFailures,
			createdAt: newWebhook[0].createdAt.toISOString(),
			updatedAt: newWebhook[0].updatedAt.toISOString(),
		};
	} catch (error) {
		logger.error(
			{
				name: webhookData.name,
				organizationId,
				userId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error creating webhook",
		);
		throw error;
	}
}

export async function createWebhookHandler(
	organizationId: string,
	userId: string,
	body: WebhookTypes.CreateWebhookRequest,
): Promise<WebhookTypes.WebhookResponse> {
	logger.info(
		{
			name: body.name,
			url: body.url,
			organizationId,
			userId,
		},
		"Creating webhook",
	);

	try {
		const webhook = await createWebhook(organizationId, userId, body);

		logger.info(
			{
				id: webhook.id,
				name: body.name,
				organizationId,
				userId,
			},
			"Webhook created successfully",
		);

		return webhook;
	} catch (error) {
		logger.error(
			{
				name: body.name,
				organizationId,
				userId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error creating webhook",
		);
		throw error;
	}
}
