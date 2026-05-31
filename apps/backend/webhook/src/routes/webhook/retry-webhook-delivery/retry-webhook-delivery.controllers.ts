import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { Queue } from "bullmq";
import { eq } from "drizzle-orm";
import { createError } from "evlog";
import { webhookConfig } from "../../../webhook.config";

const workflowQueue = new Queue("workflow-tasks", {
	connection: {
		url: webhookConfig.REDIS_URL,
	},
});

export async function retryWebhookDeliveryController({
	deliveryId,
	organizationId,
}: {
	deliveryId: string;
	organizationId: string;
}): Promise<{ success: boolean; message: string }> {
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

	if (delivery.webhook.status === "disabled") {
		throw createError({
			status: 400,
			message: "Webhook is disabled",
			why: "Cannot retry delivery for a disabled webhook.",
			fix: "Enable the webhook first before retrying delivery.",
		});
	}

	const nextAttemptNumber = delivery.attemptNumber + 1;

	// Reset status to pending in DB
	await db
		.update(schema.webhookDelivery)
		.set({
			status: "pending",
			attemptNumber: nextAttemptNumber,
			errorMessage: null,
			errorDetails: null,
			responseStatus: null,
			responseBody: null,
			responseHeaders: null,
			completedAt: null,
			durationMs: null,
		})
		.where(eq(schema.webhookDelivery.id, deliveryId));

	// Add to workflow queue
	await workflowQueue.add(
		"deliver-webhook",
		{
			workflowId: delivery.webhookId,
			organizationId: delivery.webhook.organizationId,
			type: "deliver-webhook",
			payload: {
				deliveryId: delivery.id,
				webhookId: delivery.webhookId,
				webhookUrl: delivery.webhook.url,
				webhookSecret: delivery.webhook.secret,
				customHeaders: delivery.webhook.customHeaders,
				eventId: delivery.webhookEventId,
				eventType: delivery.eventType,
				payload: delivery.eventData,
				maxRetries: delivery.webhook.maxRetries ?? 3,
				retryBackoffMultiplier: delivery.webhook.retryBackoffMultiplier ?? 2,
			},
		},
		{
			jobId: `${delivery.id}-retry-${Date.now()}`,
			attempts: 1, // Only 1 attempt for manual retries
		},
	);

	return {
		success: true,
		message: "Webhook delivery retry initiated",
	};
}
