import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function deleteWebhook(
	webhookId: string,
	organizationId: string,
): Promise<{ message: string }> {
	logger.info(
		{
			webhookId,
			organizationId,
		},
		"Deleting webhook",
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

		// Soft delete webhook
		await db
			.update(schema.webhook)
			.set({
				deletedAt: new Date(),
				updatedAt: new Date(),
			})
			.where(
				and(
					eq(schema.webhook.id, webhookId),
					eq(schema.webhook.organizationId, organizationId),
					isNull(schema.webhook.deletedAt),
				),
			);

		logger.info(
			{
				webhookId,
				organizationId,
			},
			"Webhook deleted successfully",
		);

		return { message: "Webhook deleted successfully" };
	} catch (error) {
		logger.error(
			{
				webhookId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deleting webhook",
		);
		throw error;
	}
}

export async function deleteWebhookHandler(
	webhookId: string,
	organizationId: string,
): Promise<{ message: string }> {
	logger.info(
		{
			webhookId,
			organizationId,
		},
		"Deleting webhook",
	);

	try {
		const result = await deleteWebhook(webhookId, organizationId);

		logger.info(
			{
				webhookId,
				organizationId,
			},
			"Webhook deleted successfully",
		);

		return result;
	} catch (error) {
		logger.error(
			{
				webhookId,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error deleting webhook",
		);
		throw error;
	}
}
