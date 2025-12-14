import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq } from "drizzle-orm";
import { status } from "elysia";

export async function getUsageStats(
  id: string,
  organizationId: string,
  userId: string,
): Promise<ApiKeyTypes.UsageStatsResponse> {
  try {
    const apiKey = await db.query.apikey.findFirst({
      where: and(
        eq(schema.apikey.id, id),
        eq(schema.apikey.organizationId, organizationId),
        eq(schema.apikey.userId, userId),
      ),
    });

    if (!apiKey) {
      logger.warn({ id, organizationId, userId }, "API key not found");
      throw status(404, { message: "API key not found" });
    }

    logger.info({ id, organizationId, userId }, "Usage stats retrieved successfully");

    return {
      id: apiKey.id,
      requestCount: apiKey.requestCount,
      remaining: apiKey.remaining,
      lastRequest: apiKey.lastRequest?.toISOString() || null,
      rateLimitEnabled: apiKey.rateLimitEnabled,
      rateLimitMax: apiKey.rateLimitMax,
      rateLimitTimeWindow: apiKey.rateLimitTimeWindow,
      lastRefillAt: apiKey.lastRefillAt?.toISOString() || null,
    };
  } catch (error) {
    logger.error(
      {
        id,
        organizationId,
        userId,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error getting usage stats",
    );
    throw error;
  }
}

export async function getUsageStatsHandler(
  id: string,
  organizationId: string,
  userId: string,
): Promise<ApiKeyTypes.UsageStatsResponse> {
  logger.info({ id, organizationId, userId }, "Getting usage stats");
  return getUsageStats(id, organizationId, userId);
}
