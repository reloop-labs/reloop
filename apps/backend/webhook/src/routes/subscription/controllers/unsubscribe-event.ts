import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function unsubscribeEvent(
    webhookId: string,
    eventId: string,
    organizationId: string,
): Promise<{ message: string }> {
    logger.info(
        {
            webhookId,
            eventId,
            organizationId,
        },
        "Unsubscribing webhook from event",
    );

    try {
        // Verify webhook exists and belongs to organization
        const webhook = await db.query.webhook.findFirst({
            where: and(
                eq(schema.webhook.id, webhookId),
                eq(schema.webhook.organizationId, organizationId),
                isNull(schema.webhook.deletedAt),
            ),
        });

        if (!webhook) {
            logger.warn({ webhookId, organizationId }, "Webhook not found");
            throw status(404, { message: "Webhook not found" });
        }

        // Find and delete subscription
        const subscription = await db.query.webhookEventSubscription.findFirst({
            where: and(
                eq(schema.webhookEventSubscription.webhookId, webhookId),
                eq(schema.webhookEventSubscription.eventId, eventId),
            ),
        });

        if (!subscription) {
            logger.warn({ webhookId, eventId }, "Subscription not found");
            throw status(404, { message: "Subscription not found" });
        }

        await db
            .delete(schema.webhookEventSubscription)
            .where(
                and(
                    eq(schema.webhookEventSubscription.webhookId, webhookId),
                    eq(schema.webhookEventSubscription.eventId, eventId),
                ),
            );

        logger.info(
            {
                webhookId,
                eventId,
            },
            "Event unsubscribed successfully",
        );

        return { message: "Event unsubscribed successfully" };
    } catch (error) {
        logger.error(
            {
                webhookId,
                eventId,
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error unsubscribing from event",
        );
        throw error;
    }
}

export async function unsubscribeEventHandler(
    webhookId: string,
    eventId: string,
    organizationId: string,
): Promise<{ message: string }> {
    logger.info(
        {
            webhookId,
            eventId,
            organizationId,
        },
        "Unsubscribing webhook from event",
    );

    try {
        const result = await unsubscribeEvent(webhookId, eventId, organizationId);

        logger.info(
            {
                webhookId,
                eventId,
            },
            "Event unsubscribed successfully",
        );

        return result;
    } catch (error) {
        logger.error(
            {
                webhookId,
                eventId,
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error unsubscribing from event",
        );
        throw error;
    }
}
