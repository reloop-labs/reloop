
import type { AudienceTopicMapperTypes } from "@be/audience/types/audience-topic-mapper.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getAudienceTopicMapper(
  mapperId: string,
  organizationId: string,
): Promise<AudienceTopicMapperTypes.AudienceTopicMapperResponse> {
  try {
    const result = await db.query.audienceTopicMapper.findFirst({
      where: and(
        eq(schema.audienceTopicMapper.id, mapperId),
        eq(schema.audienceTopicMapper.organizationId, organizationId),
        isNull(schema.audienceTopicMapper.deletedAt),
      ),
    });

    if (!result) {
      logger.warn({ mapperId }, "Audience topic mapping not found");
      throw status(404, { message: "Audience topic mapping not found" });
    }

    return result;
  } catch (error) {
    logger.error(
      {
        mapperId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error getting audience topic mapping",
    );
    throw error;
  }
}

export async function getAudienceTopicMapperHandler(
  mapperId: string,
  organizationId: string,
): Promise<AudienceTopicMapperTypes.AudienceTopicMapperResponse> {
  return await getAudienceTopicMapper(mapperId, organizationId);
}
