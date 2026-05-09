import { DomainErrors } from "@be/domain/lib/errors";
import type { DomainTypes } from "@be/domain/types/domain.type";
import { BusEvent, bus } from "@reloop/bus";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DOMAIN_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function finalizeDomainCreation_step6({
	domainId,
	organizationId,
	domain,
}: {
	domainId: string;
	organizationId: string;
	domain: string;
}): Promise<DomainTypes.DomainResponse> {
	const logger = useLogger();
	logger.info("Fetching domain with DNS records", { domainId });

	const domainWithDnsRecords = await db.query.domain.findFirst({
		where: and(
			eq(schema.domain.domain, domain),
			eq(schema.domain.organizationId, organizationId),
			isNull(schema.domain.deletedAt),
		),
		with: {
			dnsRecords: {
				where: isNull(schema.domainDnsRecord.deletedAt),
			},
		},
	});

	if (!domainWithDnsRecords) {
		throw DomainErrors.databaseError(
			"Failed to fetch domain with DNS records after creation",
		);
	}

	await bus.publish(BusEvent.DOMAIN_CREATED, {
		domainId,
		domain,
		organizationId,
	});

	return {
		...domainWithDnsRecords,
		object: "domain" as const,
		event: DOMAIN_CREATE_WEBHOOK_EVENT.id,
	};
}
