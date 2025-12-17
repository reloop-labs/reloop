import type { TopicSubscriptionTypes } from "@be/contacts/types/topic-subscription.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getTopicSubscription(
  subscriptionId: string,
  organizationId: string,
): Promise<TopicSubscriptionTypes.TopicSubscriptionResponse> {
  try {
    const result = await db.query.topicSubscription.findFirst({
      where: and(
        eq(schema.topicSubscription.id, subscriptionId),
        eq(schema.topicSubscription.organizationId, organizationId),
        isNull(schema.topicSubscription.deletedAt),
      ),
    });

    if (!result) {
      logger.warn({ subscriptionId }, "Topic subscription not found");
      throw status(404, { message: "Topic subscription not found" });
    }

    return result;
  } catch (error) {
    logger.error(
      {
        subscriptionId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error getting topic subscription",
    );
    throw error;
  }
}

export async function getTopicSubscriptionHandler(
  subscriptionId: string,
  organizationId: string,
): Promise<TopicSubscriptionTypes.TopicSubscriptionResponse> {
  return await getTopicSubscription(subscriptionId, organizationId);
}
