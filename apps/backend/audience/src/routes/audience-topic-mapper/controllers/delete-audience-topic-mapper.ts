import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function deleteAudienceTopicMapper(
  mapperId: string,
  organizationId: string,
): Promise<{ success: boolean }> {
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

    // Soft delete the mapping
    await db
      .update(schema.audienceTopicMapper)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.audienceTopicMapper.id, mapperId));

    return { success: true };
  } catch (error) {
    logger.error(
      {
        mapperId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error deleting audience topic mapping",
    );
    throw error;
  }
}

export async function deleteAudienceTopicMapperHandler(
  mapperId: string,
  organizationId: string,
): Promise<{ success: boolean }> {
  return await deleteAudienceTopicMapper(mapperId, organizationId);
}
