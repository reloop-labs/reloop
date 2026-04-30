import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export async function listSubscriptionsController({
  organizationId,
  query,
  logger,
}: {
  organizationId: string;
  query: { channelId: string; limit?: number; page?: number };
  logger: Logger;
}) {
  logger.info({ ...query }, "Listing subscriptions");
  try {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 100, 100);
    const offset = (page - 1) * limit;

    const whereConditions = [
      eq(schema.channelSubscription.organizationId, organizationId),
      eq(schema.channelSubscription.channelId, query.channelId),
      isNull(schema.channelSubscription.deletedAt),
    ];

    const totalResult = await db
      .select({ count: count() })
      .from(schema.channelSubscription)
      .where(and(...whereConditions));
    const total = totalResult[0]?.count || 0;

    const subscriptions = await db.query.channelSubscription.findMany({
      where: and(...whereConditions),
      orderBy: desc(schema.channelSubscription.createdAt),
      limit,
      offset,
    });

    logger.info({ total, page, limit }, "Subscriptions listed successfully");
    
    return {
      object: "subscription" as const,
      subscriptions,
      total,
      page,
      limit,
    };
  } catch (error) {
    logger.error({ query, error }, "Error listing subscriptions");
    throw error;
  }
}
