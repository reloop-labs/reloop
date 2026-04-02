import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { TOPIC_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export const deleteTopicController = async ({
  activeOrganizationId,
  topic_id,
  logger,
  cookie,
  requestDetails,
}: {
  activeOrganizationId: string;
  topic_id: string;
  logger: Logger;
  cookie?: string;
  requestDetails?: {
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress?: string;
    statusCode?: number;
  };
}): Promise<{ object: "topic"; success: boolean; id: string; name: string; event: string }> => {
  logger.info({ topic_id }, "Deleting topic");
  try {
    const topic = await db.query.topic.findFirst({
      where: and(
        eq(schema.topic.id, topic_id),
        eq(schema.topic.organizationId, activeOrganizationId),
        isNull(schema.topic.deletedAt),
      ),
    });

    if (!topic) {
      logger.warn({ topic_id }, "Topic not found or already deleted");
      throw status(404, { message: "Topic not found" });
    }

    await db
      .update(schema.topic)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(schema.topic.id, topic_id),
          eq(schema.topic.organizationId, activeOrganizationId),
          isNull(schema.topic.deletedAt),
        ),
      );

    // Unsubscribe all contacts gracefully by soft deleting their enrollments
    await db
      .update(schema.topicEnrollment)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(schema.topicEnrollment.topicId, topic_id),
          eq(schema.topicEnrollment.organizationId, activeOrganizationId),
          isNull(schema.topicEnrollment.deletedAt),
        ),
      );

    logger.info({ topic_id }, "Topic deleted successfully");

    const result = {
      object: "topic" as const,
      success: true,
      id: topic.id,
      name: topic.name,
      event: TOPIC_DELETE_WEBHOOK_EVENT.id,
    };

    await createLog({
      event: TOPIC_DELETE_WEBHOOK_EVENT.id,
      cookie,
      metadata: result,
      requestDetails: { ...(requestDetails || {}), statusCode: 200 },
    });

    return result;
  } catch (error) {
    logger.error({ topic_id, error }, "Debug deleting topic");
    throw error;
  }
};
