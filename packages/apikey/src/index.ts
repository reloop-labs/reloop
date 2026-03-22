import type { RedisCache } from "@reloop/cache/redis-client";
import { db as defaultDb } from "@reloop/db/client";

export function getApiKeyCacheKey(apiKey: string): string {
  return `apikey:v1:${apiKey}`;
}

export interface ApiKeyValidationResult {
  userId: string;
  activeOrganizationId: string;
  authType: "apikey";
}

export async function validateApiKey(
  apiKey: string | null | undefined,
  redis: RedisCache,
  db = defaultDb,
): Promise<ApiKeyValidationResult | null> {
  if (!apiKey) return null;

  const cacheKey = getApiKeyCacheKey(apiKey);

  // 1. Check Redis Cache
  const cached = await redis.get<{
    userId: string;
    activeOrganizationId: string;
  }>(cacheKey);

  if (cached) {
    return {
      userId: cached.userId,
      activeOrganizationId: cached.activeOrganizationId,
      authType: "apikey",
    };
  }

  // 2. Query Database
  const apiKeyRecord = await db.query.apikey.findFirst({
    where: (apikeys, { eq, and }) =>
      and(eq(apikeys.key, apiKey), eq(apikeys.enabled, true)),
  });

  if (apiKeyRecord) {
    const result = {
      userId: apiKeyRecord.userId,
      activeOrganizationId: apiKeyRecord.organizationId,
    };

    // 3. Store in Redis (1 hour TTL)
    await redis.set(cacheKey, result, 3600);

    return {
      ...result,
      authType: "apikey",
    };
  }

  return null;
}
