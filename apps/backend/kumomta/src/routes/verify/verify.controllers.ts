import { validateApiKey as validateApiKeyShared } from "@reloop/apikey";
import { redis } from "@reloop/be-kumomta/utils/loader";
import { db } from "@reloop/db/client";
import { domain } from "@reloop/db/schema";
import logger from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

export async function verifyDomainController({ domainName, orgId }: { domainName: string; orgId: string }): Promise<{ isVerified: boolean } | null> {
  try {
    const domainRecord = await db.query.domain.findFirst({
      where: and(
        eq(domain.domain, domainName),
        eq(domain.organizationId, orgId),
        isNull(domain.deletedAt)
      ),
      columns: { status: true },
    });
    if (!domainRecord) return null
    return { isVerified: domainRecord.status === "active" };
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : String(error),
        domain: domainName,
      },
      "Error verifying domain",
    );
    return null;
  }
}

export async function verifyApiKeyController(apiKey: string): Promise<{ userId: string; organizationId: string } | null> {
  try {
    const result = await validateApiKeyShared(apiKey, redis);
    return result
      ? {
        userId: result.userId,
        organizationId: result.activeOrganizationId,
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
