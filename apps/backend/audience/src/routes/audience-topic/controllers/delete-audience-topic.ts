import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function deleteAudienceTopic(
  topicId: string,
  organizationId: string,
): Promise<{ success: boolean }> {
  try {
    // Check if topic exists
    const existingTopic = await db.query.audienceTopic.findFirst({
      where: and(
        eq(schema.audienceTopic.id, topicId),
        eq(schema.audienceTopic.organizationId, organizationId),
        isNull(schema.audienceTopic.deletedAt),
      ),
    });

    if (!existingTopic) {
      throw status(404, { message: "Audience topic not found" });
    }

    // Soft delete the topic
    await db
      .update(schema.audienceTopic)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.audienceTopic.id, topicId));

    return { success: true };
  } catch (error) {
    logger.error(
      {
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error deleting audience topic",
    );
    throw error;
  }
}

export async function deleteAudienceTopicHandler(
  topicId: string,
  organizationId: string,
): Promise<{ success: boolean }> {
  return await deleteAudienceTopic(topicId, organizationId);
}
