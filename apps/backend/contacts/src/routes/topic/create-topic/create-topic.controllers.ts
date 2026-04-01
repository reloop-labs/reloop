import type { TopicTypes } from "@be/contacts/types/topic.type";
import { createLog } from "@be/contacts/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { TOPIC_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export const createTopicController = async ({
  activeOrganizationId,
  userId,
  name,
  description,
  defaultSubscription,
  visibility,
  logger,
  cookie,
  requestDetails,
}: {
  activeOrganizationId: string;
  userId: string;
  name: string;
  description?: string;
  defaultSubscription?: "opt_in" | "opt_out";
  visibility?: "private" | "public";
  logger: Logger;
  cookie?: string;
  requestDetails?: {
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress?: string;
  };
}): Promise<TopicTypes.TopicResponse> => {
  logger.info({ name }, "Creating topic");
  try {
    const existingTopic = await db.query.topic.findFirst({
      where: and(
        eq(schema.topic.name, name),
        eq(schema.topic.organizationId, activeOrganizationId),
        isNull(schema.topic.deletedAt),
      ),
    });

    if (existingTopic) {
      logger.warn({ name }, "Topic already exists");
      throw status(409, { message: "Topic already exists" });
    }

    const [newTopic] = await db
      .insert(schema.topic)
      .values({
        name,
        description: description ?? null,
        organizationId: activeOrganizationId,
        userId,
        defaultSubscription: defaultSubscription ?? "opt_in",
        visibility: visibility ?? "private",
      })
      .returning();

    if (!newTopic) {
      logger.error({ name }, "Failed to create topic - no data returned");
      throw new Error("Failed to create topic");
    }

    logger.info({ name, id: newTopic.id }, "Topic created successfully");

    const result = {
      ...newTopic,
      object: "topic" as const,
      event: TOPIC_CREATE_WEBHOOK_EVENT.id,
    };

    await createLog({
      event: TOPIC_CREATE_WEBHOOK_EVENT.id,
      cookie,
      metadata: result,
      requestDetails,
    });

    return result;
  } catch (error) {
    logger.error({ name, error }, "Debug creating topic");
    throw error;
  }
};
