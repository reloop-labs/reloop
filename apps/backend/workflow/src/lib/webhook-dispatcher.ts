import { enqueueWebhookDelivery } from "@be/workflow/queues/webhook-delivery.queue";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { WEBHOOK_MAX_ATTEMPTS } from "@reloop/webhook-delivery";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";

export type DispatchWebhookInput = {
	/** Event type, e.g. email.delivered */
	type: string;
	/** Canonical data object placed under envelope.data */
	data: Record<string, unknown>;
	organizationId: string;
	/** Source system label: email | kumomta | manual | test */
	source: string;
	/**
	 * Stable key for dedupe, e.g. `org:email.delivered:em_xxx:Delivery`.
	 * When omitted, every call creates a new event (manual/test).
	 */
	idempotencyKey?: string;
	userId?: string | null;
};

/**
 * Match active org webhooks subscribed to `type`, persist event + deliveries,
 * and enqueue HTTP delivery jobs. Org-scoped only (creator userId is ignored).
 */
export async function dispatchWebhookEvent(
	input: DispatchWebhookInput,
): Promise<{ eventId: string | null; deliveryCount: number }> {
	const { type, data, organizationId, source, idempotencyKey, userId } = input;

	if (!organizationId) {
		log.warn({
			message: "Webhook dispatch skipped — missing organizationId",
			type,
		});
		return { eventId: null, deliveryCount: 0 };
	}

	// 1. Idempotent event insert
	let webhookEvent: typeof schema.webhookEvent.$inferSelect | undefined;

	if (idempotencyKey) {
		const existing = await db.query.webhookEvent.findFirst({
			where: eq(schema.webhookEvent.idempotencyKey, idempotencyKey),
		});
		if (existing) {
			log.info({
				message: "Webhook event already dispatched (idempotent skip)",
				eventId: existing.id,
				idempotencyKey,
				type,
			});
			return { eventId: existing.id, deliveryCount: 0 };
		}
	}

	const eventId = `whev_${createId()}`;
	try {
		const [inserted] = await db
			.insert(schema.webhookEvent)
			.values({
				id: eventId,
				event: type,
				payload: data,
				source,
				idempotencyKey: idempotencyKey ?? null,
				organizationId,
				userId: userId ?? null,
			})
			.returning();
		webhookEvent = inserted;
	} catch (err) {
		// Unique violation on idempotency key — concurrent insert won
		if (idempotencyKey) {
			const existing = await db.query.webhookEvent.findFirst({
				where: eq(schema.webhookEvent.idempotencyKey, idempotencyKey),
			});
			if (existing) {
				return { eventId: existing.id, deliveryCount: 0 };
			}
		}
		log.error({
			message: "Failed to create webhook event",
			type,
			organizationId,
			error: err instanceof Error ? err.message : String(err),
		});
		return { eventId: null, deliveryCount: 0 };
	}

	if (!webhookEvent) {
		return { eventId: null, deliveryCount: 0 };
	}

	// 2. Find subscribed active webhooks for this org + event type
	const webhooks = await db.query.webhook.findMany({
		where: and(
			eq(schema.webhook.organizationId, organizationId),
			eq(schema.webhook.status, "active"),
			isNull(schema.webhook.deletedAt),
		),
		with: {
			subscriptions: {
				where: and(
					eq(schema.webhookEventSubscription.eventId, type),
					eq(schema.webhookEventSubscription.isEnabled, true),
				),
			},
		},
	});

	const subscribed = webhooks.filter((w) => w.subscriptions.length > 0);

	if (subscribed.length === 0) {
		log.info({
			message: "No webhooks subscribed to this event",
			type,
			organizationId,
			eventId: webhookEvent.id,
		});
		return { eventId: webhookEvent.id, deliveryCount: 0 };
	}

	// 3. Create deliveries + enqueue
	let deliveryCount = 0;
	await Promise.all(
		subscribed.map(async (hook) => {
			const deliveryId = `whde_${createId()}`;
			await db.insert(schema.webhookDelivery).values({
				id: deliveryId,
				webhookId: hook.id,
				webhookEventId: webhookEvent.id,
				eventType: type,
				eventData: data,
				status: "pending",
				requestUrl: hook.url,
				attemptNumber: 0,
				maxAttempts: WEBHOOK_MAX_ATTEMPTS,
			});

			await enqueueWebhookDelivery(deliveryId);
			deliveryCount += 1;

			log.info({
				message: "Enqueued webhook delivery",
				deliveryId,
				webhookId: hook.id,
				type,
				eventId: webhookEvent.id,
			});
		}),
	);

	return { eventId: webhookEvent.id, deliveryCount };
}
