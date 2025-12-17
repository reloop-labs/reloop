import type { TopicSubscriptionModel } from "@be/contacts/model/topic-subscription.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function removeContactFromTopic(
  organizationId: string,
  body: TopicSubscriptionModel.UnsubscribeBody,
): Promise<{ success: boolean }> {
  const { contactId, topicId } = body;

  logger.info(
    {
      organizationId,
      contactId,
      topicId,
    },
    "Removing contact from topic",
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

    // Soft delete the subscription
    await db
      .update(schema.topicSubscription)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.topicSubscription.id, existingSubscription.id));

    logger.info(
      {
        subscriptionId: existingSubscription.id,
        contactId,
        topicId,
      },
      "Contact removed from topic successfully",
    );

    return { success: true };
  } catch (error) {
    logger.error(
      {
        contactId,
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error removing contact from topic",
    );
    throw error;
  }
}

export async function removeContactFromTopicHandler(
  organizationId: string,
  body: TopicSubscriptionModel.UnsubscribeBody,
): Promise<{ success: boolean }> {
  return removeContactFromTopic(organizationId, body);
}
