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
    const [deletedAction] = await db
      .update(schema.topic)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(schema.topic.id, topic_id),
          eq(schema.topic.organizationId, activeOrganizationId),
          isNull(schema.topic.deletedAt),
        ),
      )
      .returning({ id: schema.topic.id });

    if (!deletedAction) {
      logger.warn({ topic_id }, "Topic not found or already deleted");
      throw status(404, { message: "Topic not found" });
    }

    logger.info({ topic_id }, "Topic deleted successfully");
    return { object: "topic", success: true };
  } catch (error) {
    logger.error({ topic_id, error }, "Debug deleting topic");
    throw error;
  }
};
