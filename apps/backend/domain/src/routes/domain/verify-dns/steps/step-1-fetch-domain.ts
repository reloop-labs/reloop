import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { DomainErrors } from "@be/domain/lib/errors";
import { useLogger } from "evlog/elysia";

export async function fetchDomain_step1({
	domainId,
	organizationId,
}: {
	domainId: string;
	organizationId: string;
}) {
	const logger = useLogger();
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

	return { domainWithRecords };
}
