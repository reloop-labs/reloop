import type { TopicSubscriptionModel } from "@be/audience/model/topic-subscription.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

type TopicSubscriptionResponse = TopicSubscriptionModel.TopicSubscriptionResponse;

export async function unsubscribeContact(
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
    "Unsubscribing contact from topic",
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

    // Update to unsubscribed
    const [updated] = await db
      .update(schema.topicSubscription)
      .set({
        status: "unsubscribed",
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
      "Contact unsubscribed successfully",
    );

    return updated;
  } catch (error) {
    logger.error(
      {
        contactId,
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error unsubscribing contact",
    );
    throw error;
  }
}

export async function unsubscribeContactHandler(
  organizationId: string,
  body: TopicSubscriptionModel.UnsubscribeBody,
): Promise<TopicSubscriptionResponse> {
  return unsubscribeContact(organizationId, body);
}

