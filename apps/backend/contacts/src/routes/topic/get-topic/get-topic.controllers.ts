import type { TopicTypes } from "@be/contacts/types/topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { TOPIC_GET_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export const getTopicController = async ({
  activeOrganizationId,
  topic_id,
  logger,
}: {
  activeOrganizationId: string;
  topic_id: string;
  logger: Logger;
}): Promise<TopicTypes.TopicResponse> => {
  logger.info({ topic_id }, "Getting topic");
  try {
    const result = await db.query.topic.findFirst({
      where: and(
        eq(schema.topic.id, topic_id),
        eq(schema.topic.organizationId, activeOrganizationId),
        isNull(schema.topic.deletedAt),
      ),
    });

    if (!result) {
      logger.warn({ topic_id }, "Topic not found");
      throw status(404, { message: "Topic not found" });
    }

    logger.info({ topic_id }, "Topic retrieved successfully");
    return { ...result, object: "topic", event: TOPIC_GET_WEBHOOK_EVENT.id };
  } catch (error) {
    logger.error({ topic_id, error }, "Debug getting topic");
    throw error;
  }
};
