import { BusEvent, bus } from "@reloop/bus";
import { log } from "evlog";
import type { WebhookTypes } from "../webhook.type";

export async function triggerWebhookController({
	event,
	payload,
	organizationId,
	userId,
}: WebhookTypes.TriggerWebhookRequest): Promise<{
	success: boolean;
	message: string;
}> {
	try {
		log.info({
			...{ event, organizationId, userId },
			message: "Triggering webhook event publication",
		});

		await bus.publish(BusEvent.WEBHOOK_TRIGGERED, {
			event,
			payload,
			organizationId,
			userId,
		});

		return {
			success: true,
			message: "Webhook event published successfully",
		};
	} catch (error) {
		log.error({
			...{ event, organizationId, userId },
			message: "Failed to trigger webhook event",
			error: error instanceof Error ? error.message : String(error),
		});

		return {
			success: false,
			message:
				error instanceof Error
					? error.message
					: "Failed to trigger webhook event",
		};
	}
}
