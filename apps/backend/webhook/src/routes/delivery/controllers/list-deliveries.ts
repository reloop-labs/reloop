import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import type { DeliveryTypes } from "@reloop/webhook/routes/delivery/delivery.type";
import { and, count, desc, eq, gte, lte } from "drizzle-orm";

export async function listDeliveries(
    query: DeliveryTypes.DeliveryListQuery,
    organizationId: string,
): Promise<DeliveryTypes.DeliveryListResponse> {
    const {
        page = 1,
        limit = 10,
        webhookId,
        eventId,
        status,
        fromDate,
        toDate,
    } = query;
    const offset = (page - 1) * limit;

    logger.info(
        {
            page,
            limit,
            webhookId,
            eventId,
            status,
            fromDate,
            toDate,
            organizationId,
        },
        "Listing deliveries",
    );

    try {
        const conditions = [];
        if (webhookId !== undefined)
            conditions.push(eq(schema.webhookDelivery.webhookId, webhookId));
        if (eventId !== undefined)
            conditions.push(eq(schema.webhookDelivery.eventId, eventId));
        if (status !== undefined)
            conditions.push(eq(schema.webhookDelivery.status, status));
        if (fromDate !== undefined)
            conditions.push(
                gte(schema.webhookDelivery.createdAt, new Date(fromDate)),
            );
        if (toDate !== undefined)
            conditions.push(lte(schema.webhookDelivery.createdAt, new Date(toDate)));
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const totalResult = await db
            .select({ count: count() })
            .from(schema.webhookDelivery)
            .innerJoin(
                schema.webhook,
                eq(schema.webhookDelivery.webhookId, schema.webhook.id),
            )
            .where(
                and(eq(schema.webhook.organizationId, organizationId), whereClause),
            );
        const total = totalResult[0]?.count || 0;

        const result = await db.query.webhookDelivery.findMany({
            where: whereClause,
            orderBy: desc(schema.webhookDelivery.createdAt),
            limit: limit,
            offset: offset,
            with: {
                webhook: true,
            },
        });

        // Filter results to only include deliveries from webhooks in the organization
        const filteredResults = result.filter(
            (delivery) => delivery.webhook?.organizationId === organizationId,
        );

        logger.info(
            {
                total,
                page,
                limit,
                count: filteredResults.length,
            },
            "Deliveries listed successfully",
        );

        return {
            deliveries: filteredResults.map((delivery) => ({
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
            })),
            total,
            page,
            limit,
        };
    } catch (error) {
        logger.error(
            {
                query,
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error listing deliveries",
        );
        throw error;
    }
}

export async function listDeliveriesHandler(
    query: DeliveryTypes.DeliveryListQuery,
    organizationId: string,
): Promise<DeliveryTypes.DeliveryListResponse> {
    logger.info({ query, organizationId }, "Listing deliveries");

    try {
        const result = await listDeliveries(query, organizationId);
        logger.info({ query, organizationId }, "Deliveries listed successfully");
        return result;
    } catch (error) {
        logger.error(
            {
                query,
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error listing deliveries",
        );
        throw error;
    }
}
