import type { DomainTypes } from "@be/domain/types/domain.type";
import { createLog } from "@be/domain/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { DOMAIN_DELETE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function deleteDomainController({
  domainId,
  organizationId,
  logger,
  cookie,
  requestDetails,
}: {
  domainId: string;
  organizationId: string;
  logger: Logger;
  cookie?: string;
  requestDetails?: {
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ipAddress?: string;
    statusCode?: number;
  };
}): Promise<DomainTypes.DomainResponse> {
  try {
    logger.info({ domainId }, "Fetching domain with DNS records");
    const domainWithDnsRecords = await db.query.domain.findFirst({
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

    if (!domainWithDnsRecords) {
      logger.warn({ domainId }, "Domain not found for deletion");
      throw status(404, { message: "Domain not found" });
    }

    const now = new Date();

    logger.info({ domainId }, "Soft deleting domain");
    const domainUpdateResult = await db
      .update(schema.domain)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(schema.domain.id, domainId))
      .returning();

    if (domainUpdateResult.length === 0) {
      logger.warn({ domainId }, "Failed to delete domain");
      throw status(500, { message: "Failed to delete domain" });
    }

    logger.info({ domainId }, "Soft deleting domain DNS records");
    await db
      .update(schema.domainDnsRecord)
      .set({ deletedAt: now, updatedAt: now })
      .where(eq(schema.domainDnsRecord.domainId, domainId));

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

    logger.info({ domainId }, "Domain and DNS records deleted successfully");

    const finalDomain = {
      object: "domain" as const,
      ...deletedDomain,
      event: DOMAIN_DELETE_WEBHOOK_EVENT.id,
    };

    await createLog({
      event: DOMAIN_DELETE_WEBHOOK_EVENT.id,
      cookie,
      metadata: { domainId, domain: domainWithDnsRecords.domain },
      requestDetails: { ...(requestDetails || {}), statusCode: 200 },
    });

    return finalDomain;
  } catch (error) {
    logger.error({ domainId, error }, "Error deleting domain");
    throw error;
  }
}
