import type { TopicTypes } from "@be/contacts/types/topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function updateTopic(params: {
  topicId: string;
  organizationId: string;
  name?: string;
  description?: string;
}): Promise<TopicTypes.TopicResponse> {
  const { topicId, organizationId, name, description } = params;

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

    // Check for duplicate name if name is being updated
    if (name && name !== existingTopic.name) {
      const duplicateName = await db.query.topic.findFirst({
        where: and(
          eq(schema.topic.name, name),
          eq(schema.topic.organizationId, organizationId),
          isNull(schema.topic.deletedAt),
        ),
      });

      if (duplicateName) {
        throw status(409, { message: "Topic with this name already exists" });
      }
    }

    const [updatedTopic] = await db
      .update(schema.topic)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        updatedAt: new Date(),
      })
      .where(eq(schema.topic.id, topicId))
      .returning();

    if (!updatedTopic) {
      throw new Error("Failed to update topic");
    }

    return updatedTopic;
  } catch (error) {
    logger.error(
      {
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error updating topic",
    );
    throw error;
  }
}

export async function updateTopicHandler(params: {
  topicId: string;
  organizationId: string;
  name?: string;
  description?: string;
}): Promise<TopicTypes.TopicResponse> {
  return await updateTopic(params);
}
