import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function deleteTopic(
  contactTopicId: string,
  organizationId: string,
  logger: Logger,
): Promise<{ success: boolean }> {
  logger.info({ contactTopicId, organizationId }, "Deleting topic");
  try {
    // Check if topic exists
    const existingTopic = await db.query.topic.findFirst({
      where: and(
        eq(schema.topic.id, contactTopicId),
        eq(schema.topic.organizationId, organizationId),
        isNull(schema.topic.deletedAt),
      ),
    });

    if (!existingTopic) {
      logger.warn({ contactTopicId }, "Topic not found");
      throw status(404, { message: "Topic not found" });
    }

    // Soft delete the topic
    await db
      .update(schema.topic)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.topic.id, contactTopicId));

    logger.info({ contactTopicId }, "Topic deleted successfully");
    return { success: true };
  } catch (error) {
    logger.error(
      {
        contactTopicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error deleting topic",
    );
    throw error;
  }
}

export async function deleteTopicHandler(
  contactTopicId: string,
  organizationId: string,
  logger: Logger,
): Promise<{ success: boolean }> {
  return await deleteTopic(contactTopicId, organizationId, logger);
}
