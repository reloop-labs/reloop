import type { CodeSample } from "../types";

import { createWebhookXCodeSamples } from "./create-webhook/create-webhook";
import { deleteWebhookXCodeSamples } from "./delete-webhook/delete-webhook";
import { getWebhookXCodeSamples } from "./get-webhook/get-webhook";
import { listWebhookDeliveriesXCodeSamples } from "./list-webhook-deliveries/list-webhook-deliveries";
import { listWebhooksXCodeSamples } from "./list-webhooks/list-webhooks";
import { retryWebhookDeliveryXCodeSamples } from "./retry-webhook-delivery/retry-webhook-delivery";
import { triggerWebhookXCodeSamples } from "./trigger-webhook/trigger-webhook";
import { updateWebhookXCodeSamples } from "./update-webhook/update-webhook";

export { createWebhookXCodeSamples };
export { deleteWebhookXCodeSamples };
export { getWebhookXCodeSamples };
export { listWebhookDeliveriesXCodeSamples };
export { listWebhooksXCodeSamples };
export { retryWebhookDeliveryXCodeSamples };
export { triggerWebhookXCodeSamples };
export { updateWebhookXCodeSamples };

export const webhookSamples = {
	createWebhook: createWebhookXCodeSamples,
	deleteWebhook: deleteWebhookXCodeSamples,
	getWebhook: getWebhookXCodeSamples,
	listWebhookDeliveries: listWebhookDeliveriesXCodeSamples,
	listWebhooks: listWebhooksXCodeSamples,
	retryWebhookDelivery: retryWebhookDeliveryXCodeSamples,
	triggerWebhook: triggerWebhookXCodeSamples,
	updateWebhook: updateWebhookXCodeSamples,
} as const satisfies Record<string, readonly CodeSample[]>;

export type WebhookSampleKey = keyof typeof webhookSamples;
