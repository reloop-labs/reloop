import { DomainErrors } from "@be/domain/lib/errors";
import type { DomainTypes } from "@be/domain/types/domain.type";
import { createLog } from "@be/domain/utils/logger";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DOMAIN_CREATE_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, eq, isNull } from "drizzle-orm";
import { useLogger } from "evlog/elysia";

export async function finalizeDomainCreation_step6({
	domainId,
	organizationId,
	domain,
	cookie,
	requestDetails,
}: {
	domainId: string;
	organizationId: string;
	domain: string;
	cookie?: string;
	requestDetails?: {
		endpoint?: string;
		method?: string;
		userAgent?: string;
		ipAddress?: string;
		statusCode?: number;
	};
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

	logger.info("Domain created successfully", { domainWithDnsRecords });

	await createLog({
		event: DOMAIN_CREATE_WEBHOOK_EVENT.id,
		cookie,
		metadata: { domain, domainId },
		requestDetails: { ...(requestDetails || {}), statusCode: 201 },
	});

	return {
		...domainWithDnsRecords,
		object: "domain" as const,
		event: DOMAIN_CREATE_WEBHOOK_EVENT.id,
	};
}
