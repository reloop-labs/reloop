import type { TopicSubscriptionModel } from "@be/contacts/model/topic-subscription.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

type TopicSubscriptionResponse = TopicSubscriptionModel.TopicSubscriptionResponse;

export async function subscribeContact(
  organizationId: string,
  body: TopicSubscriptionModel.UnsubscribeBody,
): Promise<TopicSubscriptionResponse> {
  const { contactId, topicId } = body;

  logger.info(
    {
      organizationId,
      contactId,
      topicId,
    },
    "Subscribing contact to topic",
  );

  try {
    // Find existing subscription
    const existingSubscription = await db.query.topicSubscription.findFirst({
      where: and(
        eq(schema.topicSubscription.contactId, contactId),
        eq(schema.topicSubscription.topicId, topicId),
        eq(schema.topicSubscription.organizationId, organizationId),
        isNull(schema.topicSubscription.deletedAt),
      ),
    });

    if (!existingSubscription) {
      logger.warn(
        { contactId, topicId },
        "Subscription not found",
      );
      throw status(404, { message: "Topic subscription not found" });
    }

    // Update to subscribed
    const [updated] = await db
      .update(schema.topicSubscription)
      .set({
        status: "subscribed",
        updatedAt: new Date(),
      })
      .where(eq(schema.topicSubscription.id, existingSubscription.id))
      .returning();

    if (!updated) {
      throw new Error("Failed to update subscription");
    }

    logger.info(
      {
        subscriptionId: updated.id,
        contactId,
        topicId,
      },
      "Contact subscribed successfully",
    );

    return updated;
  } catch (error) {
    logger.error(
      {
        contactId,
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error subscribing contact",
    );
    throw error;
  }
}

export async function subscribeContactHandler(
  organizationId: string,
  body: TopicSubscriptionModel.UnsubscribeBody,
): Promise<TopicSubscriptionResponse> {
  return subscribeContact(organizationId, body);
}
