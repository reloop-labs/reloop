import type { AudienceTypes } from "@reloop/audience/routes/audience/audience.type";
import { formatAudienceResponse } from "@reloop/audience/routes/audience/controllers/format-audience-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function unsubscribeAudience(
    audienceId: string,
    organizationId: string,
    body: AudienceTypes.UnsubscribeAudienceRequest,
): Promise<AudienceTypes.AudienceResponse> {
    logger.info(
        {
            audienceId,
            organizationId,
            reason: body.reason,
        },
        "Unsubscribing audience",
    );

    try {
        // Check if audience exists
        const existingAudience = await db.query.audience.findFirst({
            where: and(
                eq(schema.audience.id, audienceId),
                eq(schema.audience.organizationId, organizationId),
            ),
        });

        if (!existingAudience) {
            logger.warn({ audienceId, organizationId }, "Audience not found");
            throw status(404, { message: "Audience not found" });
        }

        // Update audience status to unsubscribed
        const updatedAudience = await db
            .update(schema.audience)
            .set({
                status: "unsubscribed",
                unsubscribedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(
                and(
                    eq(schema.audience.id, audienceId),
                    eq(schema.audience.organizationId, organizationId),
                ),
            )
            .returning();

        if (!updatedAudience[0]) {
            logger.error(
                { audienceId },
                "Failed to unsubscribe audience - no data returned",
            );
            throw status(500, { message: "Failed to unsubscribe audience" });
        }

        // Get the updated audience with group information
        const audienceWithGroup = await db.query.audience.findFirst({
            where: eq(schema.audience.id, audienceId),
            with: {
                audienceGroup: true,
            },
        });

        if (!audienceWithGroup) {
            logger.error(
                { audienceId },
                "Failed to fetch updated audience with group information",
            );
            throw status(500, { message: "Failed to fetch audience data" });
        }

        logger.info(
            {
                audienceId,
                organizationId,
            },
            "Audience unsubscribed successfully",
        );

        return formatAudienceResponse(audienceWithGroup);
    } catch (error) {
        logger.error(
            {
                audienceId,
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error unsubscribing audience",
        );
        throw error;
    }
}

export async function unsubscribeAudienceHandler(
    audienceId: string,
    organizationId: string,
    body: AudienceTypes.UnsubscribeAudienceRequest,
): Promise<AudienceTypes.AudienceResponse> {
    return unsubscribeAudience(audienceId, organizationId, body);
}
