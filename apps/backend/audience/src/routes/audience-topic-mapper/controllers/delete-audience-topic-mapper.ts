import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function deleteTopicSubscription(
  subscriptionId: string,
  organizationId: string,
): Promise<{ success: boolean }> {
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

    // Soft delete the subscription
    await db
      .update(schema.topicSubscription)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.topicSubscription.id, subscriptionId));

    return { success: true };
  } catch (error) {
    logger.error(
      {
        subscriptionId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error deleting topic subscription",
    );
    throw error;
  }
}

export async function deleteTopicSubscriptionHandler(
  subscriptionId: string,
  organizationId: string,
): Promise<{ success: boolean }> {
  return await deleteTopicSubscription(subscriptionId, organizationId);
}
