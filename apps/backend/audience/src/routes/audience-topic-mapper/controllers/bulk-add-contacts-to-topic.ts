import type { TopicSubscriptionModel } from "@be/audience/model/topic-subscription.model";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { status } from "elysia";

interface BulkAddResult {
  subscribed: number;
  skipped: number;
  errors: Array<{ contactId: string; reason: string }>;
}

export async function bulkAddContactsToTopic(
  organizationId: string,
  body: TopicSubscriptionModel.BulkAddContactsBody,
): Promise<BulkAddResult> {
  const { topicId, contactIds } = body;

  logger.info(
    {
      organizationId,
      topicId,
      contactCount: contactIds.length,
    },
    "Bulk adding contacts to topic",
  );

  const result: BulkAddResult = {
    subscribed: 0,
    skipped: 0,
    errors: [],
  };

  try {
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

    // Verify all contacts exist and belong to this organization
    const existingContacts = await db
      .select({ id: schema.contact.id })
      .from(schema.contact)
      .where(
        and(
          eq(schema.contact.organizationId, organizationId),
          inArray(schema.contact.id, contactIds),
          isNull(schema.contact.deletedAt),
        ),
      );

    const validContactIds = new Set(existingContacts.map((c) => c.id));

    // Find existing subscriptions
    const existingSubscriptions = await db
      .select({ contactId: schema.topicSubscription.contactId })
      .from(schema.topicSubscription)
      .where(
        and(
          eq(schema.topicSubscription.topicId, topicId),
          inArray(schema.topicSubscription.contactId, contactIds),
          isNull(schema.topicSubscription.deletedAt),
        ),
      );

    const alreadySubscribed = new Set(existingSubscriptions.map((s) => s.contactId));

    // Prepare subscriptions to create
    const subscriptionsToCreate: Array<{
      contactId: string;
      topicId: string;
      organizationId: string;
      status: "subscribed" | "unsubscribed";
    }> = [];

    for (const contactId of contactIds) {
      if (!validContactIds.has(contactId)) {
        result.errors.push({
          contactId,
          reason: "Contact not found",
        });
      } else if (alreadySubscribed.has(contactId)) {
        result.skipped++;
      } else {
        subscriptionsToCreate.push({
          contactId,
          topicId,
          organizationId,
          status: "subscribed",
        });
      }
    }

    // Batch insert new subscriptions
    if (subscriptionsToCreate.length > 0) {
      await db.insert(schema.topicSubscription).values(subscriptionsToCreate);
      result.subscribed = subscriptionsToCreate.length;
    }

    logger.info(
      {
        organizationId,
        topicId,
        subscribed: result.subscribed,
        skipped: result.skipped,
        errors: result.errors.length,
      },
      "Bulk add to topic completed",
    );

    return result;
  } catch (error) {
    logger.error(
      {
        topicId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error bulk adding contacts to topic",
    );
    throw error;
  }
}

export async function bulkAddContactsToTopicHandler(
  organizationId: string,
  body: TopicSubscriptionModel.BulkAddContactsBody,
): Promise<BulkAddResult> {
  return bulkAddContactsToTopic(organizationId, body);
}
