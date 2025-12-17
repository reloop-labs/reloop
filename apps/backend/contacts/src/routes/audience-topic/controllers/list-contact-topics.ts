import type { TopicTypes } from "@be/contacts/types/topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export async function listTopics(
  query: TopicTypes.TopicListQuery,
  organizationId: string,
): Promise<TopicTypes.TopicListResponse> {
  const { page = 1, limit = 10 } = query;
  const offset = (page - 1) * limit;

  try {
    const conditions = [
      isNull(schema.topic.deletedAt),
      eq(schema.topic.organizationId, organizationId),
    ];
    const whereClause = and(...conditions);

    const totalResult = await db
      .select({ count: count() })
      .from(schema.topic)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    const topics = await db.query.topic.findMany({
      where: whereClause,
      orderBy: desc(schema.topic.createdAt),
      limit: limit,
      offset: offset,
    });

    return {
      topics: topics,
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
      "Error listing topics",
    );
    throw error;
  }
}

export async function listTopicsHandler(
  query: TopicTypes.TopicListQuery,
  organizationId: string,
): Promise<TopicTypes.TopicListResponse> {
  return await listTopics(query, organizationId);
}
