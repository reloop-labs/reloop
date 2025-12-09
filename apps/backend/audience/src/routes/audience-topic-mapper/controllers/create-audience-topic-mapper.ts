import type { TopicSubscriptionTypes } from "@be/audience/types/topic-subscription.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import logger from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function createTopicSubscription(params: {
  organizationId: string;
  contactId: string;
  topicId: string;
  subscriptionStatus?: "subscribed" | "unsubscribed";
}): Promise<TopicSubscriptionTypes.TopicSubscriptionResponse> {
  const { organizationId, contactId, topicId, subscriptionStatus = "subscribed" } = params;

  try {
    // Check if subscription already exists
    const existingSubscription = await db.query.topicSubscription.findFirst({
      where: and(
        eq(schema.topicSubscription.contactId, contactId),
        eq(schema.topicSubscription.topicId, topicId),
        isNull(schema.topicSubscription.deletedAt),
      ),
    });

    if (existingSubscription) {
      throw status(409, { message: "Contact is already subscribed to this topic" });
    }

    // Verify contact exists
    const contact = await db.query.contact.findFirst({
      where: and(
        eq(schema.contact.id, contactId),
        eq(schema.contact.organizationId, organizationId),
        isNull(schema.contact.deletedAt),
      ),
    });

    if (!contact) {
      throw status(404, { message: "Contact not found" });
    }

    // Verify topic exists
    const topic = await db.query.topic.findFirst({
      where: and(
        eq(schema.topic.id, topicId),
        eq(schema.topic.organizationId, organizationId),
        isNull(schema.topic.deletedAt),
      ),
    });

    if (!topic) {
      throw status(404, { message: "Topic not found" });
    }

    const [newSubscription] = await db
      .insert(schema.topicSubscription)
      .values({
        contactId,
        topicId,
        organizationId,
        status: subscriptionStatus,
      })
      .returning();

    if (!newSubscription) {
      throw new Error("Failed to create topic subscription");
    }

    return newSubscription;
  } catch (error) {
    logger.error(
      {
        contactId,
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error creating topic subscription",
    );
    throw error;
  }
}

export async function createTopicSubscriptionHandler(params: {
  organizationId: string;
  contactId: string;
  topicId: string;
  subscriptionStatus?: "subscribed" | "unsubscribed";
}): Promise<TopicSubscriptionTypes.TopicSubscriptionResponse> {
  return await createTopicSubscription(params);
}
