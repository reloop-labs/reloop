import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@reloop/domain/lib/errors";
import type { DomainTypes } from "@reloop/domain/types/domain.type";
import { DOMAIN_GET_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";

import { useLogger } from "evlog/elysia";

export async function getDomainController({
	organizationId,
	domainId,
}: {
	organizationId: string;
	domainId: string;
}): Promise<DomainTypes.DomainResponse> {
	const log = useLogger();
	try {
		log.info("Fetching domain with DNS records");
		const result = await db.query.domain.findFirst({
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

		if (!result) {
			log.warn("Domain not found");
			throw DomainErrors.domainNotFound(domainId);
		}

		log.info("Domain fetched successfully");
		return {
			object: "domain" as const,
			...result,
			event: DOMAIN_GET_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error("Error getting domain");
		throw error;
	}
}
