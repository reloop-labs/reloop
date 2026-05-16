import { log } from "evlog";
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
	log.info({ ...({ domainId }), message: "Fetching domain with DNS records" });
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
		log.warn({ ...({ domainId }), message: "Domain not found" });
		throw DomainErrors.domainNotFound(domainId);
	}

	return { domainWithRecords };
}
