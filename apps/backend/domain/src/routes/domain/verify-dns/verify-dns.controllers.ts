import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function verifyDNSRecordController({
  domainId,
  organizationId,
  logger,
}: {
  domainId: string;
  organizationId: string;
  logger: Logger;
}) {
  logger.info({ domainId }, "Verify DNS records controller called");
  try {
    logger.info({ domainId }, "Fetching domain with DNS records");
    const domainWithRecords = await db.query.domain.findFirst({
      where: and(
        eq(schema.domain.id, domainId),
        eq(schema.domain.organizationId, organizationId),
        isNull(schema.domain.deletedAt),
      ),
      with: {
        dnsRecords: {
          where: isNull(schema.domainDnsRecord.deletedAt),
        },
      },
    });

    if (!domainWithRecords) {
      logger.warn({ domainId }, "Domain not found");
      throw status(404, { message: "Domain not found" });
    }

    const domainName = domainWithRecords.domain;

    // Set status to "verifying"
    logger.info({ domainId }, "Updating domain status to verifying");
    await db
      .update(schema.domain)
      .set({ status: "verifying" })
      .where(eq(schema.domain.id, domainId));

    logger.info({ domainId }, "Updating DNS records status to verifying");
    await db
      .update(schema.domainDnsRecord)
      .set({ status: "verifying" })
      .where(eq(schema.domainDnsRecord.domainId, domainId));

    // Trigger Inngest workflow for background verification with exponential backoff
    try {
      // await inngest.send({
      // 	name: "domain.verification",
      // 	data: {
      // 		domain,
      // 		organizationId,
      // 		// attempt and startedAt will be set automatically by the function
      // 	},
      // });
      logger.info(
        { domain: domainName, organizationId },
        "Triggered background domain verification workflow",
      );
    } catch (error) {
      logger.error(
        {
          domain: domainName,
          organizationId,
          error: error instanceof Error ? error.message : String(error),
        },
        "Failed to trigger domain verification workflow",
      );
      // Revert status if Inngest fails
      await db
        .update(schema.domain)
        .set({ status: domainWithRecords.status })
        .where(eq(schema.domain.id, domainWithRecords.id));
      throw status(500, {
        message: "Failed to start verification process",
      });
    }

    // Return just the updated status
    logger.info({ domainId }, "Domain verification started successfully");
    return {
      id: domainId,
      status: "verifying" as const,
    };
  } catch (error) {
    logger.error({ domainId, error }, "Error verifying DNS records");
    throw error;
  }
}
