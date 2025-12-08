
import type { AudienceTopicMapperTypes } from "@be/audience/types/audience-topic-mapper.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function updateAudienceTopicMapper(params: {
  mapperId: string;
  organizationId: string;
  subscriptionStatus: "subscribed" | "unsubscribed";
}): Promise<AudienceTopicMapperTypes.AudienceTopicMapperResponse> {
  const { mapperId, organizationId, subscriptionStatus } = params;

  try {
    // Check if mapping exists
    const existingMapping = await db.query.audienceTopicMapper.findFirst({
      where: and(
        eq(schema.audienceTopicMapper.id, mapperId),
        eq(schema.audienceTopicMapper.organizationId, organizationId),
        isNull(schema.audienceTopicMapper.deletedAt),
      ),
    });

    if (!existingMapping) {
      throw status(404, { message: "Audience topic mapping not found" });
    }

    const [updatedMapping] = await db
      .update(schema.audienceTopicMapper)
      .set({
        status: subscriptionStatus,
        updatedAt: new Date(),
      })
      .where(eq(schema.audienceTopicMapper.id, mapperId))
      .returning();

    if (!updatedMapping) {
      throw new Error("Failed to update audience topic mapping");
    }

    return updatedMapping;
  } catch (error) {
    logger.error(
      {
        mapperId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error updating audience topic mapping",
    );
    throw error;
  }
}

export async function updateAudienceTopicMapperHandler(params: {
  mapperId: string;
  organizationId: string;
  subscriptionStatus: "subscribed" | "unsubscribed";
}): Promise<AudienceTopicMapperTypes.AudienceTopicMapperResponse> {
  return await updateAudienceTopicMapper(params);
}
