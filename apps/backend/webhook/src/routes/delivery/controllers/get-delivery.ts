import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import type { DeliveryTypes } from "@reloop/webhook/routes/delivery/delivery.type";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function getDelivery(
    deliveryId: string,
    organizationId: string,
): Promise<DeliveryTypes.DeliveryResponse> {
    logger.info(
        {
            deliveryId,
            organizationId,
        },
        "Getting delivery",
    );

    try {
        const delivery = await db.query.webhookDelivery.findFirst({
            where: and(
                eq(schema.webhookDelivery.id, deliveryId),
                eq(schema.webhook.organizationId, organizationId),
            ),
            with: {
                webhook: true,
            },
        });

        if (!delivery) {
            logger.warn({ deliveryId, organizationId }, "Delivery not found");
            throw status(404, { message: "Delivery not found" });
        }

        logger.info(
            {
                deliveryId,
                organizationId,
            },
            "Delivery retrieved successfully",
        );

        return {
            id: delivery.id,
            webhookId: delivery.webhookId,
            eventId: delivery.eventId,
            eventData: delivery.eventData,
            status: delivery.status,
            requestUrl: delivery.requestUrl,
            requestHeaders: delivery.requestHeaders,
            requestBody: delivery.requestBody,
            responseStatus: delivery.responseStatus,
            responseBody: delivery.responseBody,
            responseHeaders: delivery.responseHeaders,
            attemptNumber: delivery.attemptNumber,
            maxAttempts: delivery.maxAttempts,
            nextRetryAt: delivery.nextRetryAt?.toISOString() || null,
            lastAttemptAt: delivery.lastAttemptAt?.toISOString() || null,
            errorMessage: delivery.errorMessage,
            errorDetails: delivery.errorDetails,
            completedAt: delivery.completedAt?.toISOString() || null,
            createdAt: delivery.createdAt.toISOString(),
        };
    } catch (error) {
        logger.error(
            {
                deliveryId,
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error getting delivery",
        );
        throw error;
    }
}

export async function getDeliveryHandler(
    deliveryId: string,
    organizationId: string,
): Promise<DeliveryTypes.DeliveryResponse> {
    logger.info(
        {
            deliveryId,
            organizationId,
        },
        "Getting delivery",
    );

    try {
        const delivery = await getDelivery(deliveryId, organizationId);

        logger.info(
            {
                deliveryId,
                organizationId,
            },
            "Delivery retrieved successfully",
        );

        return delivery;
    } catch (error) {
        logger.error(
            {
                deliveryId,
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error getting delivery",
        );
        throw error;
    }
}
