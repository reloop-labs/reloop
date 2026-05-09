import { domainVerificationQueue } from "@be/domain/queues/domain-verification.queue";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@be/domain/lib/errors";
import { DOMAIN_VERIFY_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function verifyDNSRecordController({
	domainId,
	organizationId,
}: {
	domainId: string;
	organizationId: string;
}) {
	const logger = useLogger();
	try {
		logger.info("Fetching domain with DNS records", { domainId });
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
			logger.warn("Domain not found", { domainId });
			throw DomainErrors.domainNotFound(domainId);
		}

		const domainName = domainWithRecords.domain;

		// Already in-flight — don't queue again
		if (domainWithRecords.status === "verifying") {
			logger.info(
				"Domain is already in verifying status, skipping re-queue",
				{ domainId },
			);
			return {
				id: domainId,
				status: "verifying" as const,
				event: DOMAIN_VERIFY_WEBHOOK_EVENT.id,
			};
		}

		// Set status to "verifying"
		logger.info("Updating domain status to verifying", { domainId });
		await db
			.update(schema.domain)
			.set({ status: "verifying" })
			.where(eq(schema.domain.id, domainId));

		logger.info("Updating DNS records status to verifying", { domainId });
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
				"Enqueued background domain verification job",
				{ domain: domainName },
			);
		} catch (error) {
			logger.error(
				"Failed to enqueue domain verification job",
				{ domain: domainName, error },
			);
			// Revert status if enqueue fails
			await db
				.update(schema.domain)
				.set({ status: domainWithRecords.status })
				.where(eq(schema.domain.id, domainWithRecords.id));
			throw DomainErrors.verificationFailed(domainName, error instanceof Error ? error.message : String(error));
		}

		logger.info("Domain verification started successfully", { domainId });
		return {
			id: domainId,
			status: "verifying" as const,
			event: DOMAIN_VERIFY_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		logger.error("Error verifying DNS records", { domainId, error });
		throw error;
	}
}
