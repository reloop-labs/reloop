import type { TopicTypes } from "@be/contacts/types/topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export const updateTopicController = async ({
  activeOrganizationId,
  topic_id,
  name,
  description,
  visibility,
  logger,
}: {
  activeOrganizationId: string;
  topic_id: string;
  name?: string;
  description?: string;
  visibility?: "private" | "public";
  logger: Logger;
}): Promise<TopicTypes.TopicResponse> => {
  logger.info({ topic_id, name }, "Updating topic");

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

    if (name && name !== existingTopic.name) {
      const duplicateName = await db.query.topic.findFirst({
        where: and(
          eq(schema.topic.name, name),
          eq(schema.topic.organizationId, activeOrganizationId),
          isNull(schema.topic.deletedAt),
        ),
      });

      if (duplicateName) {
        logger.warn({ topic_id, name }, "Topic with this name already exists");
        throw status(409, { message: "Topic with this name already exists" });
      }
    }

    const [updatedTopic] = await db
      .update(schema.topic)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(visibility && { visibility }),
        updatedAt: new Date(),
      })
      .where(eq(schema.topic.id, topic_id))
      .returning();

    if (!updatedTopic) {
      logger.error({ topic_id }, "Failed to update topic - no data returned");
      throw new Error("Failed to update topic");
    }

    logger.info({ topic_id }, "Topic updated successfully");
    const { organizationId: _, deletedAt: __, ...responseTopic } = updatedTopic;
    return { ...responseTopic, object: "topic" };
  } catch (error) {
    logger.error({ topic_id, error }, "Debug updating topic");
    throw error;
  }
};
