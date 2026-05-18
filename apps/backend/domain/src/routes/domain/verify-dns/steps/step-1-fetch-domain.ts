import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@reloop/domain/lib/errors";
import { and, eq, isNull } from "drizzle-orm";

import { useLogger } from "evlog/elysia";

export async function fetchDomain_step1({
	domainId,
	organizationId,
}: {
	domainId: string;
	organizationId: string;
}) {
	const log = useLogger();
	log.info("Fetching domain with DNS records");
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
		log.warn("Domain not found");
		throw DomainErrors.domainNotFound(domainId);
	}

	return { domainWithRecords };
}
