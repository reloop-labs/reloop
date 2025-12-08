
import type { AudienceTopicTypes } from "@be/audience/types/audience-topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getAudienceTopic(
  topicId: string,
  organizationId: string,
): Promise<AudienceTopicTypes.AudienceTopicResponse> {
  try {
    const result = await db.query.audienceTopic.findFirst({
      where: and(
        eq(schema.audienceTopic.id, topicId),
        eq(schema.audienceTopic.organizationId, organizationId),
        isNull(schema.audienceTopic.deletedAt),
      ),
    });

    if (!result) {
      logger.warn({ topicId }, "Audience topic not found");
      throw status(404, { message: "Audience topic not found" });
    }

    return result;
  } catch (error) {
    logger.error(
      {
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error getting audience topic",
    );
    throw error;
  }
}

export async function getAudienceTopicHandler(
  topicId: string,
  organizationId: string,
): Promise<AudienceTopicTypes.AudienceTopicResponse> {
  return await getAudienceTopic(topicId, organizationId);
}
