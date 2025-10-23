import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import type { EventTypes } from "@reloop/webhook/routes/event/event.type";
import { eq } from "drizzle-orm";
import { status } from "elysia";

export async function getEvent(
    eventId: string,
): Promise<EventTypes.EventResponse> {
    logger.info(
        {
            eventId,
        },
        "Getting event",
    );

    try {
        const event = await db.query.webhookEvent.findFirst({
            where: eq(schema.webhookEvent.id, eventId),
        });

        if (!event) {
            logger.warn({ eventId }, "Event not found");
            throw status(404, { message: "Event not found" });
        }

        logger.info(
            {
                eventId,
            },
            "Event retrieved successfully",
        );

        return {
            id: event.id,
            name: event.name,
            description: event.description,
            category: event.category,
            isActive: event.isActive,
            createdAt: event.createdAt.toISOString(),
            updatedAt: event.updatedAt.toISOString(),
        };
    } catch (error) {
        logger.error(
            {
                eventId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error getting event",
        );
        throw error;
    }
}

export async function getEventHandler(
    eventId: string,
): Promise<EventTypes.EventResponse> {
    logger.info(
        {
            eventId,
        },
        "Getting event",
    );

    try {
        const event = await getEvent(eventId);

        logger.info(
            {
                eventId,
            },
            "Event retrieved successfully",
        );

        return event;
    } catch (error) {
        logger.error(
            {
                eventId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error getting event",
        );
        throw error;
    }
}
