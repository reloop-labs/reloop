import type { TopicTypes } from "@be/contacts/types/topic.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function createTopic(
  params: {
    organizationId: string;
    userId: string;
    name: string;
    description?: string;
    autoEnroll?: "enrolled" | "unenrolled";
    visibility?: "private" | "public";
  },
  logger: Logger,
): Promise<TopicTypes.TopicResponse> {
  const { organizationId, userId, name, description, autoEnroll, visibility } = params;
  logger.info({ organizationId, name }, "Creating topic");
  try {
    // Check if topic with same name already exists
    const existingTopic = await db.query.topic.findFirst({
      where: and(
        eq(schema.topic.name, name),
        eq(schema.topic.organizationId, organizationId),
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
        organizationId,
        userId,
        autoEnroll: autoEnroll ?? "enrolled",
        visibility: visibility ?? "private",
      })
      .returning();

    if (!newTopic) {
      logger.error({ name }, "Failed to create topic - no data returned");
      throw new Error("Failed to create topic");
    }

    logger.info({ name, id: newTopic.id }, "Topic created successfully");
    return { ...newTopic, object: "contact_topic" as const };
  } catch (error) {
    logger.error(
      {
        name,
        organizationId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error creating topic",
    );
    throw error;
  }
}

export async function createTopicHandler(
  params: {
    organizationId: string;
    userId: string;
    name: string;
    description?: string;
    autoEnroll?: "enrolled" | "unenrolled";
    visibility?: "private" | "public";
  },
  logger: Logger,
): Promise<TopicTypes.TopicResponse> {
  return await createTopic(params, logger);
}
