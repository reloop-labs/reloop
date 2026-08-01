import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import {
	resolveWebhookMaxAttempts,
	WEBHOOK_DELIVERY_JOB,
	WEBHOOK_DELIVERY_QUEUE,
	webhookDeliveryJobOptions,
} from "@reloop/webhook-delivery";
import { Queue } from "bullmq";
import { eq } from "drizzle-orm";
import { createError } from "evlog";
import { webhookConfig } from "../../../webhook.config";

const webhookDeliveryQueue = new Queue(WEBHOOK_DELIVERY_QUEUE, {
	connection: {
		url: webhookConfig.REDIS_URL,
	},
});

/**
 * Manual replay: creates a *new* delivery row (audit-friendly) and enqueues it.
 * Does not mutate the original delivery's status history.
 */
export async function retryWebhookDeliveryController({
	deliveryId,
	organizationId,
}: {
	deliveryId: string;
	organizationId: string;
}): Promise<{ success: boolean; message: string; newDeliveryId?: string }> {
	const delivery = await db.query.webhookDelivery.findFirst({
		where: eq(schema.webhookDelivery.id, deliveryId),
		with: {
			webhook: true,
		},
	});

	if (!delivery || delivery.webhook.organizationId !== organizationId) {
		throw createError({
			status: 404,
			message: "Webhook delivery not found",
			why: `No webhook delivery with ID "${deliveryId}" exists for your organization.`,
			fix: "Verify the delivery ID and ensure it belongs to your active organization.",
		});
	}

	if (
		delivery.webhook.status === "disabled" ||
		delivery.webhook.status === "failed" ||
		delivery.webhook.status === "paused"
	) {
		throw createError({
			status: 400,
			message: "Webhook is not active",
			why: `Cannot replay delivery because the webhook is currently "${delivery.webhook.status}".`,
			fix: "Enable the webhook first before replaying delivery.",
		});
	}

	const newDeliveryId = `whde_${createId()}`;
	const maxAttempts = resolveWebhookMaxAttempts(delivery.webhook.maxRetries);

	await db.insert(schema.webhookDelivery).values({
		id: newDeliveryId,
		webhookId: delivery.webhookId,
		webhookEventId: delivery.webhookEventId,
		replayOfDeliveryId: delivery.id,
		eventType: delivery.eventType,
		eventData: delivery.eventData,
		status: "pending",
		requestUrl: delivery.webhook.url,
		attemptNumber: 0,
		maxAttempts,
	});

	const opts = webhookDeliveryJobOptions(newDeliveryId, {
		attempts: maxAttempts,
	});
	await webhookDeliveryQueue.add(
		WEBHOOK_DELIVERY_JOB,
		{ deliveryId: newDeliveryId },
		{
			...opts,
		},
	);

	return {
		success: true,
		message: "Webhook delivery replay initiated",
		newDeliveryId,
	};
}
