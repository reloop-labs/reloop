
import type { AudienceTopicMapperTypes } from "@be/audience/types/audience-topic-mapper.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export async function listAudienceTopicMappers(
  query: AudienceTopicMapperTypes.AudienceTopicMapperQuery,
  organizationId: string,
): Promise<AudienceTopicMapperTypes.AudienceTopicMapperListResponse> {
  const { page = 1, limit = 10, audienceId, audienceTopicId, status: subscriptionStatus } = query;
  const offset = (page - 1) * limit;

  try {
    const conditions = [
      isNull(schema.audienceTopicMapper.deletedAt),
      eq(schema.audienceTopicMapper.organizationId, organizationId),
    ];

    if (audienceId) {
      conditions.push(eq(schema.audienceTopicMapper.audienceId, audienceId));
    }
    if (audienceTopicId) {
      conditions.push(eq(schema.audienceTopicMapper.audienceTopicId, audienceTopicId));
    }
    if (subscriptionStatus) {
      conditions.push(eq(schema.audienceTopicMapper.status, subscriptionStatus));
    }

    const whereClause = and(...conditions);

    const totalResult = await db
      .select({ count: count() })
      .from(schema.audienceTopicMapper)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    const mappings = await db.query.audienceTopicMapper.findMany({
      where: whereClause,
      orderBy: desc(schema.audienceTopicMapper.createdAt),
      limit: limit,
      offset: offset,
    });

    return {
      mappings,
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
      "Error listing audience topic mappings",
    );
    throw error;
  }
}

export async function listAudienceTopicMappersHandler(
  query: AudienceTopicMapperTypes.AudienceTopicMapperQuery,
  organizationId: string,
): Promise<AudienceTopicMapperTypes.AudienceTopicMapperListResponse> {
  return await listAudienceTopicMappers(query, organizationId);
}
