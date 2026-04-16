import { validateApiKey as validateApiKeyShared } from "@reloop/apikey";
import { redis } from "@reloop/be-kumomta/utils/loader";
import type { Logger } from "@reloop/logger";

export async function verifyApiKeyController({
  apiKey,
  logger,
}: {
  apiKey: string;
  logger: Logger;
}): Promise<{ userId: string; activeOrganizationId: string } | null> {
  try {
    const result = await validateApiKeyShared(apiKey, redis);
    return result
      ? {
        userId: result.userId,
        activeOrganizationId: result.activeOrganizationId,
      }
      : null;
  } catch (e) {
    logger.error(
      { error: e instanceof Error ? e.message : String(e) },
      "Error authenticating API key",
    );
    return null;
  }
}
