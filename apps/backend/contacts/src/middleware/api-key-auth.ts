import { db } from "@reloop/db/client";

export async function validateApiKey(apiKey: string | null | undefined) {
  if (!apiKey) return null;

  const apiKeyRecord = await db.query.apikey.findFirst({
    where: (apikeys, { eq, and }) =>
      and(eq(apikeys.key, apiKey), eq(apikeys.enabled, true)),
  });

  if (apiKeyRecord) {
    return {
      userId: apiKeyRecord.userId,
      activeOrganizationId: apiKeyRecord.organizationId,
      authType: "apikey" as const,
    };
  }
  return null;
}
