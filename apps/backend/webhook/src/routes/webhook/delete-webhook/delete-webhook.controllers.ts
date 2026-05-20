import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { WebhookErrors } from "@reloop/webhook/error/webhook.error-response";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";
import type { WebhookTypes } from "../webhook.type";

export async function deleteWebhookController({
	webhookId,
	organizationId,
}: {
	webhookId: string;
	organizationId: string;
}): Promise<WebhookTypes.DeleteWebhookResponse> {
	log.info({ ...{ webhookId, organizationId }, message: "Deleting webhook" });

	try {
		const existingWebhook = await db.query.webhook.findFirst({
			where: and(
				eq(schema.webhook.id, webhookId),
				eq(schema.webhook.organizationId, organizationId),
				isNull(schema.webhook.deletedAt),
			),
		});

		if (!existingWebhook) {
			throw WebhookErrors.notFound(webhookId);
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
		log.error({
			...{ webhookId, organizationId, error },
			message: "Error deleting webhook",
		});
		throw error;
	}
}
