import { DomainErrors } from "@be/domain/lib/errors";
import type { DomainStatus } from "@be/domain/types/domain.type";
import { bus, BusEvent } from "@reloop/bus";
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

	try {
		await bus.publish(BusEvent.DOMAIN_DNS_REVERIFICATION_REQUESTED, {
			domainId,
			organizationId,
			domain: domainName,
			triggeredAt: new Date().toISOString(),
		});
		
		logger.info("Published domain verification request via NATS", {
			domain: domainName,
		});
	} catch (error) {
		logger.error("Failed to publish domain verification request", {
			domain: domainName,
			error,
		});
		// Revert status if publish fails
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
