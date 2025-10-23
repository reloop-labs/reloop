import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import type { EventTypes } from "@reloop/webhook/routes/event/event.type";
import { and, count, desc, eq } from "drizzle-orm";

export async function listEvents(
    query: EventTypes.EventListQuery,
): Promise<EventTypes.EventListResponse> {
    const { page = 1, limit = 10, category, isActive } = query;
    const offset = (page - 1) * limit;

    logger.info(
        {
            page,
            limit,
            category,
            isActive,
        },
        "Listing events",
    );

    try {
        const conditions = [];
        if (category !== undefined)
            conditions.push(eq(schema.webhookEvent.category, category));
        if (isActive !== undefined)
            conditions.push(eq(schema.webhookEvent.isActive, isActive));
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const totalResult = await db
            .select({ count: count() })
            .from(schema.webhookEvent)
            .where(whereClause);
        const total = totalResult[0]?.count || 0;

        const result = await db.query.webhookEvent.findMany({
            where: whereClause,
            orderBy: desc(schema.webhookEvent.createdAt),
            limit: limit,
            offset: offset,
        });

        logger.info(
            {
                total,
                page,
                limit,
                count: result.length,
            },
            "Events listed successfully",
        );

        return {
            events: result.map((event) => ({
                id: event.id,
                name: event.name,
                description: event.description,
                category: event.category,
                isActive: event.isActive,
                createdAt: event.createdAt.toISOString(),
                updatedAt: event.updatedAt.toISOString(),
            })),
            total,
            page,
            limit,
        };
    } catch (error) {
        logger.error(
            {
                query,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error listing events",
        );
        throw error;
    }
}

export async function listEventsHandler(
    query: EventTypes.EventListQuery,
): Promise<EventTypes.EventListResponse> {
    logger.info({ query }, "Listing events");

    try {
        const result = await listEvents(query);
        logger.info({ query }, "Events listed successfully");
        return result;
    } catch (error) {
        logger.error(
            {
                query,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error listing events",
        );
        throw error;
    }
}
