import { DomainErrors } from "@be/domain/lib/errors";
import { domainVerificationQueue } from "@be/domain/queues/domain-verification.queue";
import type { DomainStatus } from "@be/domain/types/domain.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { eq } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function enqueueVerificationJob_step3({
	domainId,
	organizationId,
	domainName,
	previousStatus,
}: {
	domainId: string;
	organizationId: string;
	domainName: string;
	previousStatus: DomainStatus;
}) {
	const logger = useLogger();

	// Enqueue BullMQ job — jobId deduplicates concurrent requests for the same domain
	try {
		await domainVerificationQueue.add(
			"verify",
			{ domainId, organizationId },
			{ jobId: domainId },
		);
		logger.info("Enqueued background domain verification job", {
			domain: domainName,
		});
	} catch (error) {
		logger.error("Failed to enqueue domain verification job", {
			domain: domainName,
			error,
		});
		// Revert status if enqueue fails
		await db
			.update(schema.domain)
			.set({ status: previousStatus })
			.where(eq(schema.domain.id, domainId));

		throw DomainErrors.verificationFailed(
			domainName,
			error instanceof Error ? error.message : String(error),
		);
	}

	return { success: true };
}
