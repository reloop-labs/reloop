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
	previousUserVerifiedDomain,
	previousDnsStatuses,
}: {
	domainId: string;
	organizationId: string;
	domainName: string;
	previousStatus: DomainStatus;
	previousUserVerifiedDomain: boolean;
	previousDnsStatuses: { id: string; status: DomainStatus }[];
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
			.set({
				status: previousStatus,
				userVerifiedDomain: previousUserVerifiedDomain,
			})
			.where(eq(schema.domain.id, domainId));

		await Promise.all(
			previousDnsStatuses.map((record) =>
				db
					.update(schema.domainDnsRecord)
					.set({ status: record.status })
					.where(eq(schema.domainDnsRecord.id, record.id)),
			),
		);

		throw DomainErrors.verificationFailed(
			domainName,
			error instanceof Error ? error.message : String(error),
		);
	}

	return { success: true };
}
