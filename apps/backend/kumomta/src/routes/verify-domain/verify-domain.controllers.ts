import { db } from "@reloop/db/client";
import { domain } from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";

export async function verifyDomainController({
  domainName,
  logger,
}: {
  domainName: string;
  logger: Logger;
}): Promise<{ isVerified: boolean } | null> {
  try {
    const domainRecord = await db.query.domain.findFirst({
      where: and(
        eq(domain.domain, domainName),
        isNull(domain.deletedAt),
      ),
      columns: {
        status: true,
      },
    });

    if (!domainRecord) {
      return null;
    }

    return {
      isVerified: domainRecord.status === "active",
    };
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error), domain: domainName },
      "Error verifying domain",
    );
    return null;
  }
}
