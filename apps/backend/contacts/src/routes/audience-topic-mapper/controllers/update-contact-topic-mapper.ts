import type { TopicSubscriptionTypes } from "@be/contacts/types/topic-subscription.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function updateTopicSubscription(params: {
  subscriptionId: string;
  organizationId: string;
  subscriptionStatus: "subscribed" | "unsubscribed";
}): Promise<TopicSubscriptionTypes.TopicSubscriptionResponse> {
  const { subscriptionId, organizationId, subscriptionStatus } = params;

  try {
    // Check if subscription exists
    const existingSubscription = await db.query.topicSubscription.findFirst({
      where: and(
        eq(schema.topicSubscription.id, subscriptionId),
        eq(schema.topicSubscription.organizationId, organizationId),
        isNull(schema.topicSubscription.deletedAt),
      ),
    });

    if (!existingSubscription) {
      throw status(404, { message: "Topic subscription not found" });
    }

    const [updatedSubscription] = await db
      .update(schema.topicSubscription)
      .set({
        status: subscriptionStatus,
        updatedAt: new Date(),
      })
      .where(eq(schema.topicSubscription.id, subscriptionId))
      .returning();

    if (!updatedSubscription) {
      throw new Error("Failed to update topic subscription");
    }

    return updatedSubscription;
  } catch (error) {
    logger.error(
      {
        subscriptionId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error updating topic subscription",
    );
    throw error;
  }
}

export async function updateTopicSubscriptionHandler(params: {
  subscriptionId: string;
  organizationId: string;
  subscriptionStatus: "subscribed" | "unsubscribed";
}): Promise<TopicSubscriptionTypes.TopicSubscriptionResponse> {
  return await updateTopicSubscription(params);
}
