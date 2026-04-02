import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import type { WebhookTypes } from "../webhook.type";

export async function createWebhookController({
	organizationId,
	userId,
	body,
}: {
	organizationId: string;
	userId: string;
	body: WebhookTypes.CreateWebhookRequest;
}): Promise<WebhookTypes.WebhookResponse> {
	logger.info(
		{
			name: body.name,
			url: body.url,
		},
		"Creating webhook",
	);

	try {
		const existingWebhook = await db
			.select({ id: schema.webhook.id })
			.from(schema.webhook)
			.where(
				and(
					eq(schema.webhook.name, body.name),
					eq(schema.webhook.organizationId, organizationId),
					isNull(schema.webhook.deletedAt),
				),
			)
			.limit(1);

		if (existingWebhook[0]) {
			throw status(409, { message: "Webhook name already exists" });
		}

		const [newWebhook] = await db
			.insert(schema.webhook)
			.values({
				name: body.name,
				url: body.url,
				secret: body.secret || `whsec_${createId()}`,
				organizationId,
				userId,
				status: "active",
				customHeaders: body.customHeaders || null,
				rateLimitEnabled: body.rateLimitEnabled ?? true,
				maxRequestsPerMinute: body.maxRequestsPerMinute ?? 60,
				maxRetries: body.maxRetries ?? 3,
				retryBackoffMultiplier: body.retryBackoffMultiplier ?? 2,
				filteringOptions: body.filteringOptions || null,
				createdAt: new Date(),
				updatedAt: new Date(),
			})
			.returning();

		if (!newWebhook) {
			throw status(500, { message: "Failed to create webhook" });
		}

		return {
			id: newWebhook.id,
			name: newWebhook.name,
			url: newWebhook.url,
			secret: newWebhook.secret ? "***masked***" : null,
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
			createdAt: newWebhook.createdAt.toISOString(),
			updatedAt: newWebhook.updatedAt.toISOString(),
		};
	} catch (error) {
		logger.error(
			{
				name: body.name,
				organizationId,
				userId,
				error,
			},
			"Error creating webhook",
		);
		throw error;
	}
}
