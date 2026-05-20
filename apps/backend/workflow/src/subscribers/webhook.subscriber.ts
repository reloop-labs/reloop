import { workflowQueue } from "@be/workflow/queues/workflow.queue";
import { createId } from "@paralleldrive/cuid2";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { log } from "evlog";

export async function initWebhookSubscribers() {
	// Subscribe to webhook triggered events
	await bus.subscribe(
		BusEvent.WEBHOOK_TRIGGERED,
		async (payload) => {
			log.info({
				message: "Received webhook triggered event via NATS",
				event: payload.event,
				organizationId: payload.organizationId,
			});

			const event = payload.event;
			const orgId = payload.organizationId;
			const userId = payload.userId;

			// 1. Find all active webhooks subscribed to this event
			const webhooks = await db.query.webhook.findMany({
				where: (webhooks, { and, eq, isNull }) =>
					and(
						orgId ? eq(webhooks.organizationId, orgId) : undefined,
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
					message: "No webhooks subscribed to this event",
					event,
					organizationId: orgId,
				});
				return;
			}

			// 2. Create the webhook event record
			const [webhookEvent] = await db
				.insert(schema.webhookEvent)
				.values({
					id: `whev_${createId()}`,
					event,
					payload: payload.payload,
					source: "user-api",
					organizationId: orgId || subscribedWebhooks[0]?.organizationId || "",
					userId: userId || null,
				})
				.returning();

			if (!webhookEvent) {
				log.error({
					message: "Failed to create webhook event record",
					event,
					organizationId: orgId,
				});
				return;
			}

			// 3. For each webhook, create a delivery record and enqueue a BullMQ job
			const deliverySetup = subscribedWebhooks.map(async (webhook) => {
				const deliveryId = `whde_${createId()}`;

				await db.insert(schema.webhookDelivery).values({
					id: deliveryId,
					webhookId: webhook.id,
					webhookEventId: webhookEvent.id,
					eventType: event,
					eventData: payload.payload,
					status: "pending",
					requestUrl: webhook.url,
					attemptNumber: 1,
				});

				await workflowQueue.add(
					"deliver-webhook",
					{
						workflowId: webhook.id,
						organizationId: orgId || webhook.organizationId || "",
						type: "deliver-webhook",
						payload: {
							deliveryId,
							webhookId: webhook.id,
							webhookUrl: webhook.url,
							webhookSecret: webhook.secret,
							customHeaders: webhook.customHeaders as Record<string, string> | null,
							eventId: webhookEvent.id,
							eventType: event,
							payload: payload.payload,
							maxRetries: webhook.maxRetries ?? 3,
							retryBackoffMultiplier: webhook.retryBackoffMultiplier ?? 2,
						},
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
					message: "Enqueued webhook delivery job",
					deliveryId,
					webhookId: webhook.id,
					event,
				});
			});

			await Promise.all(deliverySetup);
		},
	);
}
