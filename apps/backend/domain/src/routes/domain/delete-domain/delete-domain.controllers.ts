import type { DomainTypes } from "@be/domain/types/domain.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function deleteDomainController({
  domain: domainName,
  organizationId,
  logger,
}: {
  domain: string;
  organizationId: string;
  logger: Logger;
}): Promise<DomainTypes.DomainResponse> {
  logger.info({ domain: domainName }, "Soft deleting domain");

  try {
    // Fetch the domain with DNS records before deletion
    const domainWithDnsRecords = await db.query.domain.findFirst({
      where: and(
        eq(schema.domain.domain, domainName),
        isNull(schema.domain.deletedAt),
        eq(schema.domain.organizationId, organizationId),
      ),
      with: {
        dnsRecords: {
          where: isNull(schema.domainDnsRecord.deletedAt),
        },
      },
    });

    if (!domainWithDnsRecords) {
      logger.warn({ domain: domainName }, "Domain not found for deletion");
      throw status(404, { message: "Domain not found" });
    }

    const domainId = domainWithDnsRecords.id;
    const now = new Date();

    // Soft delete the domain
    const domainUpdateResult = await db
      .update(schema.domain)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(schema.domain.id, domainId))
      .returning();

    if (domainUpdateResult.length === 0) {
      logger.warn({ domain: domainName }, "Failed to delete domain");
      throw status(500, { message: "Failed to delete domain" });
    }

    // Soft delete DNS records
    await db
      .update(schema.domainDnsRecord)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(schema.domainDnsRecord.domainId, domainId));

    // Update the domain object with deletedAt timestamp
    const deletedDomain = {
      ...domainWithDnsRecords,
      deletedAt: now,
      updatedAt: now,
      dnsRecords: domainWithDnsRecords.dnsRecords.map((record) => ({
        ...record,
        deletedAt: now,
        updatedAt: now,
      })),
    };

    logger.info(
      { domain: domainName },
      "Domain and DNS records deleted successfully",
    );

    return deletedDomain;
  } catch (error) {
    logger.error(
      {
        domain: domainName,
        error: error instanceof Error ? error.message : String(error),
      },
      "Error deleting domain",
    );
    throw error;
  }
}
