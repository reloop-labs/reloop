import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import type { DomainStatus } from "@reloop/domain/types/domain.type";
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
	const log = useLogger();

	try {
		await bus.publish(BusEvent.DOMAIN_DNS_REVERIFICATION_REQUESTED, {
			domainId,
			organizationId,
			domain: domainName,
			triggeredAt: new Date().toISOString(),
		});

		log.info("Published domain verification request via NATS");
	} catch (error) {
		log.error("Failed to publish domain verification request");
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
