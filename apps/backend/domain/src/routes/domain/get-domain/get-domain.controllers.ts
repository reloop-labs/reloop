import type { DomainTypes } from "@be/domain/types/domain.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@be/domain/lib/errors";
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
	const logger = useLogger();
	try {
		logger.info("Fetching domain with DNS records", { domainId });
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
			logger.warn("Domain not found", { domainId });
			throw DomainErrors.domainNotFound(domainId);
		}

		logger.info("Domain fetched successfully", { domainId });
		return {
			object: "domain" as const,
			...result,
			event: DOMAIN_GET_WEBHOOK_EVENT.id,
		};
	} catch (error) {
		logger.error("Error getting domain", { domainId, error });
		throw error;
	}
}
