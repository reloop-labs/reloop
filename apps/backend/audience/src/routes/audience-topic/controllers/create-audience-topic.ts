
import type { AudienceTopicTypes } from "@be/audience/types/audience-topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import logger from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function createAudienceTopic(params: {
  organizationId: string;
  name: string;
  description?: string;
}): Promise<AudienceTopicTypes.AudienceTopicResponse> {
  const { organizationId, name, description } = params;
  try {
    // Check if topic with same name already exists
    const existingTopic = await db.query.audienceTopic.findFirst({
      where: and(
        eq(schema.audienceTopic.name, name),
        eq(schema.audienceTopic.organizationId, organizationId),
        isNull(schema.audienceTopic.deletedAt),
      ),
    });

    if (existingTopic) {
      throw status(409, { message: "Audience topic already exists" });
    }

    const [newTopic] = await db
      .insert(schema.audienceTopic)
      .values({
        name,
        description: description ?? null,
        organizationId,
      })
      .returning();

    if (!newTopic) {
      throw new Error("Failed to create audience topic");
    }

    return newTopic;
  } catch (error) {
    logger.error(
      {
        name,
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error creating audience topic",
    );
    throw error;
  }
}

export async function createAudienceTopicHandler(params: {
  organizationId: string;
  name: string;
  description?: string;
}): Promise<AudienceTopicTypes.AudienceTopicResponse> {
  return await createAudienceTopic(params);
}
