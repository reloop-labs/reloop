import type { DomainTypes } from "@be/domain/types/domain.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getDomainController({
  organizationId,
  logger,
  domainId,
}: {
  organizationId: string;
  logger: Logger;
  domainId: string;
}): Promise<DomainTypes.DomainResponse> {
  try {
    logger.info({ domainId }, "Fetching domain with DNS records");
    const result = await db.query.domain.findFirst({
      where: and(
        eq(schema.domain.id, domainId),
        isNull(schema.domain.deletedAt),
        eq(schema.domain.organizationId, organizationId),
      ),
      with: {
        dnsRecords: {
          where: isNull(schema.domainDnsRecord.deletedAt),
        },
      },
    });

    if (!result) {
      logger.warn({ domainId }, "Domain not found");
      throw status(404, { message: "Domain not found" });
    }

    logger.info({ domainId }, "Domain fetched successfully");
    return result;
  } catch (error) {
    logger.error({ domainId, error }, "Error getting domain");
    throw error;
  }
}
