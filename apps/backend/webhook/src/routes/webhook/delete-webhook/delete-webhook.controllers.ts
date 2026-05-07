import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";
import type { WebhookTypes } from "../webhook.type";

export async function deleteWebhookController({
	webhookId,
	organizationId,
}: {
	webhookId: string;
	organizationId: string;
}): Promise<WebhookTypes.DeleteWebhookResponse> {
	logger.info({ webhookId, organizationId }, "Deleting webhook");

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

		return {
			id: webhookId,
			message: "Webhook deleted successfully",
		};
	} catch (error) {
		logger.error(
			{ webhookId, organizationId, error },
			"Error deleting webhook",
		);
		throw error;
	}
}
