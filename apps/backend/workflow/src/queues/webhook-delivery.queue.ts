import { workflowConfig } from "@be/workflow/workflow.config";
import {
	WEBHOOK_DELIVERY_JOB,
	WEBHOOK_DELIVERY_QUEUE,
	type WebhookDeliveryJobData,
	webhookDeliveryJobOptions,
} from "@reloop/webhook-delivery";
import { Queue } from "bullmq";

const connection = {
	url: workflowConfig.REDIS_URL,
};

export const webhookDeliveryQueue = new Queue<WebhookDeliveryJobData>(
	WEBHOOK_DELIVERY_QUEUE,
	{
		connection,
		defaultJobOptions: {
			removeOnComplete: { count: 500 },
			removeOnFail: { count: 1000 },
		},
	},
);

export async function enqueueWebhookDelivery(
	deliveryId: string,
	options?: {
		attempts?: number;
		delayMs?: number;
	},
) {
	return webhookDeliveryQueue.add(
		WEBHOOK_DELIVERY_JOB,
		{ deliveryId },
		webhookDeliveryJobOptions(deliveryId, options),
	);
}

export { WEBHOOK_DELIVERY_QUEUE, WEBHOOK_DELIVERY_JOB };
