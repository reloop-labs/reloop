import type { TopicTypes } from "@be/contacts/types/topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getTopic(
  topicId: string,
  organizationId: string,
): Promise<TopicTypes.TopicResponse> {
  try {
    const result = await db.query.topic.findFirst({
      where: and(
        eq(schema.topic.id, topicId),
        eq(schema.topic.organizationId, organizationId),
        isNull(schema.topic.deletedAt),
      ),
    });

    if (!result) {
      logger.warn({ topicId }, "Topic not found");
      throw status(404, { message: "Topic not found" });
    }

    return result;
  } catch (error) {
    logger.error(
      {
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error getting topic",
    );
    throw error;
  }
}

export async function getTopicHandler(
  topicId: string,
  organizationId: string,
): Promise<TopicTypes.TopicResponse> {
  return await getTopic(topicId, organizationId);
}
