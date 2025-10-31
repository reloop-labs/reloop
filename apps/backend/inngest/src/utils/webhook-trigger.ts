import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { inngest } from "@reloop/inngest/client";
import { logger } from "@reloop/logger";
import { eq } from "drizzle-orm";

interface TriggerWebhookDeliveryParams {
    eventId: string;
    eventData: Record<string, unknown>;
    organizationId?: string;
}

/**
 * Trigger webhook deliveries for an event
 * This function finds all active webhooks subscribed to the event and triggers deliveries
 */
export async function triggerWebhookDelivery({
    eventId,
    eventData,
    organizationId,
}: TriggerWebhookDeliveryParams): Promise<void> {
    try {
        // Find all webhooks subscribed to this event
        const subscriptions = await db.query.webhookEventSubscription.findMany({
            where: eq(schema.webhookEventSubscription.eventId, eventId),
            with: {
                webhook: true,
            },
        });

        // Filter for active webhooks
        const activeSubscriptions = subscriptions.filter((sub) => {
            if (!sub.isEnabled || !sub.webhook) return false;
            if (sub.webhook.status !== "active") return false;
            if (sub.webhook.deletedAt !== null) return false;
            if (organizationId && sub.webhook.organizationId !== organizationId)
                return false;
            return true;
        });

        logger.info(
            {
                eventId,
                subscriptionsFound: activeSubscriptions.length,
            },
            "Triggering webhook deliveries",
        );

        // Create delivery records and trigger Inngest
        for (const subscription of activeSubscriptions) {
            const webhook = subscription.webhook;
            if (!webhook) continue;

            try {
                // Create delivery record
                const delivery = await db
                    .insert(schema.webhookDelivery)
                    .values({
                        webhookId: webhook.id,
                        eventId: eventId,
                        eventData: eventData,
                        status: "pending",
                        requestUrl: webhook.url,
                        requestHeaders: webhook.customHeaders || null,
                        requestBody: eventData,
                        maxAttempts: webhook.maxRetries || 3,
                        attemptNumber: 1,
                        createdAt: new Date(),
                    })
                    .returning();

                if (delivery[0]) {
                    // Trigger Inngest webhook delivery
                    await inngest.send({
                        name: "webhook/deliver",
                        data: {
                            deliveryId: delivery[0].id,
                            webhookId: webhook.id,
                            eventId: eventId,
                            eventData: eventData,
                            requestUrl: webhook.url,
                            requestHeaders: webhook.customHeaders || undefined,
                            requestBody: eventData,
                            maxAttempts: webhook.maxRetries || 3,
                        },
                    });

                    logger.info(
                        {
                            deliveryId: delivery[0].id,
                            webhookId: webhook.id,
                            eventId,
                        },
                        "Webhook delivery triggered",
                    );
                }
            } catch (error) {
                logger.error(
                    {
                        webhookId: webhook.id,
                        eventId,
                        error: error instanceof Error ? error.message : String(error),
                    },
                    "Failed to trigger webhook delivery",
                );
            }
        }
    } catch (error) {
        logger.error(
            {
                eventId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error triggering webhook deliveries",
        );
        throw error;
    }
}
