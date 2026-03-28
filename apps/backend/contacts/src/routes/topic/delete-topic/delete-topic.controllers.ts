import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export const deleteTopicController = async ({
  activeOrganizationId,
  topic_id,
  logger,
}: {
  activeOrganizationId: string;
  topic_id: string;
  logger: Logger;
}): Promise<{ object: "topic"; success: boolean }> => {
  logger.info({ topic_id }, "Deleting topic");
  try {
    const existingTopic = await db.query.topic.findFirst({
      where: and(
        eq(schema.topic.id, topic_id),
        eq(schema.topic.organizationId, activeOrganizationId),
        isNull(schema.topic.deletedAt),
      ),
    });

    if (!existingTopic) {
      logger.warn({ topic_id }, "Topic not found");
      throw status(404, { message: "Topic not found" });
    }

    await db
      .update(schema.topic)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.topic.id, topic_id));

    logger.info({ topic_id }, "Topic deleted successfully");
    return { object: "topic", success: true };
  } catch (error) {
    logger.error({ topic_id, error }, "Debug deleting topic");
    throw error;
  }
};
