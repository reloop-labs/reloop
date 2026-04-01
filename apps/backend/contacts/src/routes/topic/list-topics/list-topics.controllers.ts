import type { TopicTypes } from "@be/contacts/types/topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { TOPIC_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, desc, eq, isNull, sql } from "drizzle-orm";

export const listTopicsController = async ({
  activeOrganizationId,
  page: rawPage,
  limit: rawLimit,
  logger,
}: {
  activeOrganizationId: string;
  page?: number;
  limit?: number;
  logger: Logger;
}): Promise<TopicTypes.TopicListResponse> => {
  const page = rawPage || 1;
  const limit = Math.min(rawLimit || 100, 100);
  const offset = (page - 1) * limit;

  logger.info({ page, limit }, "Listing topics");

  try {
    const whereClause = and(
      isNull(schema.topic.deletedAt),
      eq(schema.topic.organizationId, activeOrganizationId),
    );

    const rows = await db
      .select({
        topic: schema.topic,
        total: sql<number>`COUNT(*) OVER()`,
      })
      .from(schema.topic)
      .where(whereClause)
      .orderBy(desc(schema.topic.createdAt))
      .limit(limit)
      .offset(offset);

    logger.info(
      { total: rows[0]?.total ?? 0, page, limit },
      "Topics listed successfully",
    );
    return {
      object: "topic",
      topics: rows.map(({ topic }) => ({
        id: topic.id,
        name: topic.name,
        description: topic.description,
        defaultSubscription: topic.defaultSubscription,
        visibility: topic.visibility,
        createdAt: topic.createdAt,
        updatedAt: topic.updatedAt,
      })),
      total: Number(rows[0]?.total ?? 0),
      page,
      limit,
      event: TOPIC_LIST_WEBHOOK_EVENT.id,
    };
  } catch (error) {
    logger.error({ error }, "Debug listing topics");
    throw error;
  }
};
