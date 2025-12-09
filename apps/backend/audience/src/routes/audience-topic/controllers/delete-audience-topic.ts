import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function deleteTopic(
  topicId: string,
  organizationId: string,
): Promise<{ success: boolean }> {
  try {
    // Check if topic exists
    const existingTopic = await db.query.topic.findFirst({
      where: and(
        eq(schema.topic.id, topicId),
        eq(schema.topic.organizationId, organizationId),
        isNull(schema.topic.deletedAt),
      ),
    });

    if (!existingTopic) {
      throw status(404, { message: "Topic not found" });
    }

    // Soft delete the topic
    await db
      .update(schema.topic)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.topic.id, topicId));

    return { success: true };
  } catch (error) {
    logger.error(
      {
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error deleting topic",
    );
    throw error;
  }
}

export async function deleteTopicHandler(
  topicId: string,
  organizationId: string,
): Promise<{ success: boolean }> {
  return await deleteTopic(topicId, organizationId);
}
