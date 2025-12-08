
import type { AudienceTopicTypes } from "@be/audience/types/audience-topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export async function listAudienceTopics(
  query: AudienceTopicTypes.AudienceTopicQuery,
  organizationId: string,
): Promise<AudienceTopicTypes.AudienceTopicListResponse> {
  const { page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;

  try {
    const conditions = [
      isNull(schema.audienceTopic.deletedAt),
      eq(schema.audienceTopic.organizationId, organizationId),
    ];
    const whereClause = and(...conditions);

    const totalResult = await db
      .select({ count: count() })
      .from(schema.audienceTopic)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    const topics = await db.query.audienceTopic.findMany({
      where: whereClause,
      orderBy: desc(schema.audienceTopic.createdAt),
      limit: limit,
      offset: offset,
    });

    return {
      audienceTopics: topics,
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
      "Error listing audience topics",
    );
    throw error;
  }
}

export async function listAudienceTopicsHandler(
  query: AudienceTopicTypes.AudienceTopicQuery,
  organizationId: string,
): Promise<AudienceTopicTypes.AudienceTopicListResponse> {
  return await listAudienceTopics(query, organizationId);
}
