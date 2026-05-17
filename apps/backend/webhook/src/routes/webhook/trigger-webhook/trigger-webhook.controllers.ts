import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { webhookDeliveryQueue } from "@reloop/webhook/queues/webhook-delivery.queue";
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
	log.info({
		...{ event, organizationId, userId },
		message: "Triggering webhooks",
	});

	try {
		// 1. Find all active webhooks subscribed to this event
		const webhooks = await db.query.webhook.findMany({
			where: (webhooks, { and, eq, isNull }) =>
				and(
					organizationId
						? eq(webhooks.organizationId, organizationId)
						: undefined,
					userId ? eq(webhooks.userId, userId) : undefined,
					eq(webhooks.status, "active"),
					isNull(webhooks.deletedAt),
				),
			with: {
				subscriptions: {
					where: (subs, { and, eq }) =>
						and(eq(subs.eventId, event), eq(subs.isEnabled, true)),
				},
			},
		});

		const subscribedWebhooks = webhooks.filter(
			(w) => w.subscriptions.length > 0,
		);

		if (subscribedWebhooks.length === 0) {
			log.info({
				...{ event, organizationId },
				message: "No webhooks subscribed to this event",
			});
			return {
				success: true,
				message: "No webhooks subscribed to this event",
			};
		}

		// 2. Create the webhook event record
		const [webhookEvent] = await db
			.insert(schema.webhookEvent)
			.values({
				event,
				payload,
				source: "user-api",
				organizationId:
					organizationId || subscribedWebhooks[0]?.organizationId || "",
				userId: userId || null,
			})
			.returning();

		if (!webhookEvent) {
			throw new Error("Failed to create webhook event record");
		}

		// 3. For each webhook, create a delivery record and enqueue a BullMQ job
		const deliverySetup = subscribedWebhooks.map(async (webhook) => {
			const deliveryId = `whde_${createId()}`;

			await db.insert(schema.webhookDelivery).values({
				id: deliveryId,
				webhookId: webhook.id,
				webhookEventId: webhookEvent.id,
				eventType: event,
				eventData: payload,
				status: "pending",
				requestUrl: webhook.url,
				attemptNumber: 1,
			});

			await webhookDeliveryQueue.add(
				"deliver",
				{
					deliveryId,
					webhookId: webhook.id,
					webhookUrl: webhook.url,
					webhookSecret: webhook.secret,
					customHeaders: webhook.customHeaders as Record<string, string> | null,
					eventId: webhookEvent.id,
					eventType: event,
					payload,
					maxRetries: webhook.maxRetries ?? 3,
					retryBackoffMultiplier: webhook.retryBackoffMultiplier ?? 2,
				},
				{
					jobId: deliveryId,
					attempts: webhook.maxRetries ?? 3,
					backoff: {
						type: "exponential",
						delay: 60_000,
					},
				},
			);

			log.info({
				...{ deliveryId, webhookId: webhook.id, event },
				message: "Enqueued webhook delivery job",
			});
		});

		await Promise.all(deliverySetup);

		return {
			success: true,
			message: `Event triggered for ${subscribedWebhooks.length} webhooks`,
		};
	} catch (error) {
		log.error({
			...{ event, organizationId, error },
			message: "Error triggering webhooks",
		});
		throw error;
	}
}
