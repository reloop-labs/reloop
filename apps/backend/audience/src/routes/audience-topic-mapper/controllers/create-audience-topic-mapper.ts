
import type { AudienceTopicMapperTypes } from "@be/audience/types/audience-topic-mapper.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import logger from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function createAudienceTopicMapper(params: {
  organizationId: string;
  audienceId: string;
  audienceTopicId: string;
  subscriptionStatus?: "subscribed" | "unsubscribed";
}): Promise<AudienceTopicMapperTypes.AudienceTopicMapperResponse> {
  const { organizationId, audienceId, audienceTopicId, subscriptionStatus = "subscribed" } = params;

  try {
    // Check if mapping already exists
    const existingMapping = await db.query.audienceTopicMapper.findFirst({
      where: and(
        eq(schema.audienceTopicMapper.audienceId, audienceId),
        eq(schema.audienceTopicMapper.audienceTopicId, audienceTopicId),
        isNull(schema.audienceTopicMapper.deletedAt),
      ),
    });

    if (existingMapping) {
      throw status(409, { message: "Audience is already mapped to this topic" });
    }

    // Verify audience exists
    const audience = await db.query.audience.findFirst({
      where: and(
        eq(schema.audience.id, audienceId),
        eq(schema.audience.organizationId, organizationId),
        isNull(schema.audience.deletedAt),
      ),
    });

    if (!audience) {
      throw status(404, { message: "Audience not found" });
    }

    // Verify topic exists
    const topic = await db.query.audienceTopic.findFirst({
      where: and(
        eq(schema.audienceTopic.id, audienceTopicId),
        eq(schema.audienceTopic.organizationId, organizationId),
        isNull(schema.audienceTopic.deletedAt),
      ),
    });

    if (!topic) {
      throw status(404, { message: "Audience topic not found" });
    }

    const [newMapping] = await db
      .insert(schema.audienceTopicMapper)
      .values({
        audienceId,
        audienceTopicId,
        organizationId,
        status: subscriptionStatus,
      })
      .returning();

    if (!newMapping) {
      throw new Error("Failed to create audience topic mapping");
    }

    return newMapping;
  } catch (error) {
    logger.error(
      {
        audienceId,
        audienceTopicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error creating audience topic mapping",
    );
    throw error;
  }
}

export async function createAudienceTopicMapperHandler(params: {
  organizationId: string;
  audienceId: string;
  audienceTopicId: string;
  subscriptionStatus?: "subscribed" | "unsubscribed";
}): Promise<AudienceTopicMapperTypes.AudienceTopicMapperResponse> {
  return await createAudienceTopicMapper(params);
}
