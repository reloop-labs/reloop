import type { TopicSubscriptionTypes } from "@be/audience/types/topic-subscription.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export async function listTopicSubscriptions(
  query: TopicSubscriptionTypes.TopicSubscriptionListQuery,
  organizationId: string,
): Promise<TopicSubscriptionTypes.TopicSubscriptionListResponse> {
  const { page = 1, limit = 10, contactId, topicId, status: subscriptionStatus } = query;
  const offset = (page - 1) * limit;

  try {
    const conditions = [
      isNull(schema.topicSubscription.deletedAt),
      eq(schema.topicSubscription.organizationId, organizationId),
    ];

    if (contactId) {
      conditions.push(eq(schema.topicSubscription.contactId, contactId));
    }
    if (topicId) {
      conditions.push(eq(schema.topicSubscription.topicId, topicId));
    }
    if (subscriptionStatus) {
      conditions.push(eq(schema.topicSubscription.status, subscriptionStatus));
    }

    const whereClause = and(...conditions);

    const totalResult = await db
      .select({ count: count() })
      .from(schema.topicSubscription)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    const subscriptions = await db.query.topicSubscription.findMany({
      where: whereClause,
      orderBy: desc(schema.topicSubscription.createdAt),
      limit: limit,
      offset: offset,
      with: {
        contact: true,
      },
    });

    return {
      subscriptions,
      total,
      page,
      limit,
    };
  } catch (error) {
    logger.error(
      {
        query,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error listing topic subscriptions",
    );
    throw error;
  }
}

export async function listTopicSubscriptionsHandler(
  query: TopicSubscriptionTypes.TopicSubscriptionListQuery,
  organizationId: string,
): Promise<TopicSubscriptionTypes.TopicSubscriptionListResponse> {
  return await listTopicSubscriptions(query, organizationId);
}
