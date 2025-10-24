import type { AudienceTypes } from "@reloop/audience/routes/audience/audience.type";
import { formatAudienceGroupResponse } from "@reloop/audience/routes/audience/controllers/format-audience-group-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, ilike, isNull, sql } from "drizzle-orm";

export async function listAudienceGroups(
    organizationId: string,
    query: AudienceTypes.AudienceGroupListQuery,
): Promise<AudienceTypes.AudienceGroupListResponse> {
    logger.info(
        {
            organizationId,
            query,
        },
        "Listing audience groups",
    );

    try {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;

        // Build where conditions
        const whereConditions = [
            eq(schema.audienceGroup.organizationId, organizationId),
            isNull(schema.audienceGroup.deletedAt),
        ];

        if (query.search) {
            whereConditions.push(
                ilike(schema.audienceGroup.name, `%${query.search}%`),
            );
        }

        if (query.userId) {
            whereConditions.push(eq(schema.audienceGroup.userId, query.userId));
        }

        // Get total count
        const totalResult = await db
            .select({ count: count() })
            .from(schema.audienceGroup)
            .where(and(...whereConditions));

        const total = totalResult[0]?.count || 0;

        // Get audience groups with counts
        const groups = await db
            .select({
                id: schema.audienceGroup.id,
                name: schema.audienceGroup.name,
                description: schema.audienceGroup.description,
                organizationId: schema.audienceGroup.organizationId,
                userId: schema.audienceGroup.userId,
                deletedAt: schema.audienceGroup.deletedAt,
                createdAt: schema.audienceGroup.createdAt,
                updatedAt: schema.audienceGroup.updatedAt,
                audienceCount: sql<number>`COUNT(${schema.audience.id})`,
                subscribedCount: sql<number>`COUNT(CASE WHEN ${schema.audience.status} = 'subscribed' THEN 1 END)`,
                unsubscribedCount: sql<number>`COUNT(CASE WHEN ${schema.audience.status} = 'unsubscribed' THEN 1 END)`,
            })
            .from(schema.audienceGroup)
            .leftJoin(
                schema.audience,
                and(
                    eq(schema.audience.audienceGroupId, schema.audienceGroup.id),
                    eq(schema.audience.organizationId, organizationId),
                ),
            )
            .where(and(...whereConditions))
            .groupBy(
                schema.audienceGroup.id,
                schema.audienceGroup.name,
                schema.audienceGroup.description,
                schema.audienceGroup.organizationId,
                schema.audienceGroup.userId,
                schema.audienceGroup.deletedAt,
                schema.audienceGroup.createdAt,
                schema.audienceGroup.updatedAt,
            )
            .orderBy(desc(schema.audienceGroup.createdAt))
            .limit(limit)
            .offset(offset);

        const audienceGroups = groups.map(formatAudienceGroupResponse);

        logger.info(
            {
                organizationId,
                total,
                page,
                limit,
            },
            "Audience groups listed successfully",
        );

        return {
            audienceGroups,
            total,
            page,
            limit,
        };
    } catch (error) {
        logger.error(
            {
                organizationId,
                query,
                error: error instanceof Error ? error.message : String(error),
            },
            "Error listing audience groups",
        );
        throw error;
    }
}

export async function listAudienceGroupsHandler(
    organizationId: string,
    query: AudienceTypes.AudienceGroupListQuery,
): Promise<AudienceTypes.AudienceGroupListResponse> {
    return listAudienceGroups(organizationId, query);
}
