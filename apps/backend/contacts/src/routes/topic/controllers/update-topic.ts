import type { TopicTypes } from "@be/contacts/types/topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function updateTopic(
  params: {
    contactTopicId: string;
    organizationId: string;
    name?: string;
    description?: string;
    autoEnroll?: "enrolled" | "unenrolled";
    visibility?: "private" | "public";
  },
  logger: Logger,
): Promise<TopicTypes.TopicResponse> {
  const { contactTopicId, organizationId, name, description, autoEnroll, visibility } = params;
  logger.info({ contactTopicId, organizationId }, "Updating topic");

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
        logger.warn({ contactTopicId, name }, "Topic with this name already exists");
        throw status(409, { message: "Topic with this name already exists" });
      }
    }

    const [updatedTopic] = await db
      .update(schema.topic)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(autoEnroll && { autoEnroll }),
        ...(visibility && { visibility }),
        updatedAt: new Date(),
      })
      .where(eq(schema.topic.id, contactTopicId))
      .returning();

    if (!updatedTopic) {
      logger.error({ contactTopicId }, "Failed to update topic - no data returned");
      throw new Error("Failed to update topic");
    }

    logger.info({ contactTopicId }, "Topic updated successfully");
    const { organizationId: _, deletedAt: __, ...responseTopic } = updatedTopic;
    return { ...responseTopic, object: "topic" as const };
  } catch (error) {
    logger.error(
      {
        contactTopicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error updating topic",
    );
    throw error;
  }
}

export async function updateTopicHandler(
  params: {
    contactTopicId: string;
    organizationId: string;
    name?: string;
    description?: string;
    autoEnroll?: "enrolled" | "unenrolled";
    visibility?: "private" | "public";
  },
  logger: Logger,
): Promise<TopicTypes.TopicResponse> {
  return await updateTopic(params, logger);
}
