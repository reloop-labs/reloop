import { DomainErrors } from "@reloop/domain/lib/errors";
import type { DomainTypes } from "@reloop/domain/types/domain.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DOMAIN_GET_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";
import { useLogger } from "evlog/elysia";

export async function getDomainController({
	organizationId,
	domainId,
}: {
	organizationId: string;
	domainId: string;
}): Promise<DomainTypes.DomainResponse> {
	const logger = useLogger();
	try {
		log.info({ ...{ domainId }, message: "Fetching domain with DNS records" });
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
			log.warn({ ...{ domainId }, message: "Domain not found" });
			throw DomainErrors.domainNotFound(domainId);
		}

		log.info({ ...{ domainId }, message: "Domain fetched successfully" });
		return {
			object: "domain" as const,
			...result,
			event: DOMAIN_GET_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		log.error({ ...{ domainId, error }, message: "Error getting domain" });
		throw error;
	}
}
