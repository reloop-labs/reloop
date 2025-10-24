import type { AudienceTypes } from "@reloop/audience/routes/audience/audience.type";
import { formatAudienceResponse } from "@reloop/audience/routes/audience/controllers/format-audience-response";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm";

export async function listAudiences(
    organizationId: string,
    query: AudienceTypes.AudienceListQuery,
): Promise<AudienceTypes.AudienceListResponse> {
    logger.info(
        {
            organizationId,
            query,
        },
        "Listing audiences",
    );

    try {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const offset = (page - 1) * limit;

        // Build where conditions
        const whereConditions: Array<SQL<unknown>> = [
            eq(schema.audience.organizationId, organizationId),
        ];

        if (query.search) {
            const searchCondition = or(
                ilike(schema.audience.email, `%${query.search}%`),
                ilike(schema.audience.firstName, `%${query.search}%`),
                ilike(schema.audience.lastName, `%${query.search}%`),
            );

            if (searchCondition) {
                whereConditions.push(searchCondition);
            }
        }

        if (query.status) {
            whereConditions.push(eq(schema.audience.status, query.status));
        }

        if (query.audienceGroupId) {
            whereConditions.push(
                eq(schema.audience.audienceGroupId, query.audienceGroupId),
            );
        }

        if (query.userId) {
            whereConditions.push(eq(schema.audience.organizationId, organizationId));
        }

        // Get total count
        const totalResult = await db
            .select({ count: count() })
            .from(schema.audience)
            .where(and(...whereConditions));

        const total = totalResult[0]?.count || 0;

        // Get audiences with group information
        const audiences = await db.query.audience.findMany({
            where: and(...whereConditions),
            with: {
                audienceGroup: true,
            },
            orderBy: desc(schema.audience.createdAt),
            limit,
            offset,
        });

        const formattedAudiences = audiences.map(formatAudienceResponse);

        logger.info(
            {
                organizationId,
                total,
                page,
                limit,
            },
            "Audiences listed successfully",
        );

        return {
            audiences: formattedAudiences,
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
            "Error listing audiences",
        );
        throw error;
    }
}

export async function listAudiencesHandler(
    organizationId: string,
    query: AudienceTypes.AudienceListQuery,
): Promise<AudienceTypes.AudienceListResponse> {
    return listAudiences(organizationId, query);
}
