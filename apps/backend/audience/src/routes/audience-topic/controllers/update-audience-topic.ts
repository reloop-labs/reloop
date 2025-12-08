
import type { AudienceTopicTypes } from "@be/audience/types/audience-topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function updateAudienceTopic(params: {
  topicId: string;
  organizationId: string;
  name?: string;
  description?: string;
}): Promise<AudienceTopicTypes.AudienceTopicResponse> {
  const { topicId, organizationId, name, description } = params;

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

    // Check for duplicate name if name is being updated
    if (name && name !== existingTopic.name) {
      const duplicateName = await db.query.audienceTopic.findFirst({
        where: and(
          eq(schema.audienceTopic.name, name),
          eq(schema.audienceTopic.organizationId, organizationId),
          isNull(schema.audienceTopic.deletedAt),
        ),
      });

      if (duplicateName) {
        throw status(409, { message: "Audience topic with this name already exists" });
      }
    }

    const [updatedTopic] = await db
      .update(schema.audienceTopic)
      .set({
        ...(name && { name }),
        ...(description !== undefined && { description }),
        updatedAt: new Date(),
      })
      .where(eq(schema.audienceTopic.id, topicId))
      .returning();

    if (!updatedTopic) {
      throw new Error("Failed to update audience topic");
    }

    return updatedTopic;
  } catch (error) {
    logger.error(
      {
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error updating audience topic",
    );
    throw error;
  }
}

export async function updateAudienceTopicHandler(params: {
  topicId: string;
  organizationId: string;
  name?: string;
  description?: string;
}): Promise<AudienceTopicTypes.AudienceTopicResponse> {
  return await updateAudienceTopic(params);
}
