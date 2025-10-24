import type { AudienceTypes } from "@reloop/audience/routes/audience/audience.type";
import { formatAudienceGroupResponse } from "@reloop/audience/routes/audience/controllers/format-audience-group-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, eq, isNull, sql } from "drizzle-orm";
import { status } from "elysia";

export async function updateAudienceGroup(
    groupId: string,
    organizationId: string,
    body: AudienceTypes.UpdateAudienceGroupRequest,
): Promise<AudienceTypes.AudienceGroupResponse> {
    logger.info(
        {
            groupId,
            organizationId,
            body,
        },
        "Updating audience group",
    );

    try {
        // Check if audience group exists
        const existingGroup = await db.query.audienceGroup.findFirst({
            where: and(
                eq(schema.audienceGroup.id, groupId),
                eq(schema.audienceGroup.organizationId, organizationId),
                isNull(schema.audienceGroup.deletedAt),
            ),
        });

        if (!existingGroup) {
            logger.warn({ groupId, organizationId }, "Audience group not found");
            throw status(404, { message: "Audience group not found" });
        }

        // Check if name is being updated and if it conflicts
        if (body.name && body.name !== existingGroup.name) {
            const conflictingGroup = await db
                .select()
                .from(schema.audienceGroup)
                .where(
                    and(
                        eq(schema.audienceGroup.name, body.name),
                        eq(schema.audienceGroup.organizationId, organizationId),
                        isNull(schema.audienceGroup.deletedAt),
                    ),
                )
                .limit(1);

            if (conflictingGroup.length > 0) {
                logger.warn(
                    { name: body.name, organizationId },
                    "Audience group name already exists",
                );
                throw status(409, {
                    message: "Audience group with this name already exists",
                });
            }
        }

        // Update the audience group
        const updateData: Partial<typeof schema.audienceGroup.$inferInsert> = {
            updatedAt: new Date(),
        };

        if (body.name !== undefined) {
            updateData.name = body.name;
        }
        if (body.description !== undefined) {
            updateData.description = body.description;
        }

        const updatedGroup = await db
            .update(schema.audienceGroup)
            .set(updateData)
            .where(
                and(
                    eq(schema.audienceGroup.id, groupId),
                    eq(schema.audienceGroup.organizationId, organizationId),
                ),
            )
            .returning();

        if (!updatedGroup[0]) {
            logger.error(
                { groupId },
                "Failed to update audience group - no data returned",
            );
            throw status(500, { message: "Failed to update audience group" });
        }

        // Get audience counts
        const audienceCounts = await db
            .select({
                total: count(),
                subscribed: sql<number>`COUNT(CASE WHEN ${schema.audience.status} = 'subscribed' THEN 1 END)`,
                unsubscribed: sql<number>`COUNT(CASE WHEN ${schema.audience.status} = 'unsubscribed' THEN 1 END)`,
            })
            .from(schema.audience)
            .where(
                and(
                    eq(schema.audience.audienceGroupId, groupId),
                    eq(schema.audience.organizationId, organizationId),
                ),
            );

        const groupWithCounts = {
            ...updatedGroup[0],
            audienceCount: audienceCounts[0]?.total || 0,
            subscribedCount: audienceCounts[0]?.subscribed || 0,
            unsubscribedCount: audienceCounts[0]?.unsubscribed || 0,
        };

        logger.info(
            {
                groupId,
                organizationId,
            },
            "Audience group updated successfully",
        );

        return formatAudienceGroupResponse(groupWithCounts);
    } catch (error) {
        logger.error(
            {
                groupId,
                organizationId,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error updating audience group",
        );
        throw error;
    }
}

export async function updateAudienceGroupHandler(
    groupId: string,
    organizationId: string,
    body: AudienceTypes.UpdateAudienceGroupRequest,
): Promise<AudienceTypes.AudienceGroupResponse> {
    return updateAudienceGroup(groupId, organizationId, body);
}
