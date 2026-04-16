import { domainVerificationQueue } from "@be/domain/queues/domain-verification.queue";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { DOMAIN_VERIFY_WEBHOOK_EVENT } from "@reloop/webhook-events";
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

    // Already in-flight — don't queue again
    if (domainWithRecords.status === "verifying") {
      logger.info(
        { domainId },
        "Domain is already in verifying status, skipping re-queue",
      );
      return {
        id: domainId,
        status: "verifying" as const,
        event: DOMAIN_VERIFY_WEBHOOK_EVENT.id,
      };
    }

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

    // Enqueue BullMQ job — jobId deduplicates concurrent requests for the same domain
    try {
      await domainVerificationQueue.add(
        "verify",
        { domainId, organizationId },
        { jobId: domainId },
      );
      logger.info(
        { domain: domainName },
        "Enqueued background domain verification job",
      );
    } catch (error) {
      logger.error(
        { domain: domainName, error },
        "Failed to enqueue domain verification job",
      );
      // Revert status if enqueue fails
      await db
        .update(schema.domain)
        .set({ status: domainWithRecords.status })
        .where(eq(schema.domain.id, domainWithRecords.id));
      throw status(500, {
        message: "Failed to start verification process",
      });
    }

    logger.info({ domainId }, "Domain verification started successfully");
    return {
      id: domainId,
      status: "verifying" as const,
      event: DOMAIN_VERIFY_WEBHOOK_EVENT.id,
    };
  } catch (error) {
    logger.error({ domainId, error }, "Error verifying DNS records");
    throw error;
  }
}
