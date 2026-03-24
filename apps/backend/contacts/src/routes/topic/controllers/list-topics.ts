import type { TopicTypes } from "@be/contacts/types/topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export async function listTopics(
  query: TopicTypes.TopicListQuery,
  organizationId: string,
  logger: Logger,
): Promise<TopicTypes.TopicListResponse> {
  const { page = 1, limit = 100 } = query;
  const offset = (page - 1) * limit;
  logger.info({ organizationId, page, limit }, "Listing topics");

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

    logger.info({ organizationId, total, page, limit }, "Topics listed successfully");
    return {
      object: "contact_topic",
      topics: topics.map((t) => ({ ...t, object: "contact_topic" as const })),
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
  logger: Logger,
): Promise<TopicTypes.TopicListResponse> {
  return await listTopics(query, organizationId, logger);
}
