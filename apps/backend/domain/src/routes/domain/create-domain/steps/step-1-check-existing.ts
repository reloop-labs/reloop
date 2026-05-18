import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import { and, eq, isNull } from "drizzle-orm";

import { useLogger } from "evlog/elysia";

export async function checkExistingDomain_step1({
	domain,
	organizationId,
}: {
	domain: string;
	organizationId: string;
}) {
	const log = useLogger();
	log.info("Finding existing domain");
	const activeDomain = await db.query.domain.findFirst({
		where: and(
			eq(schema.domain.domain, domain),
			eq(schema.domain.organizationId, organizationId),
			isNull(schema.domain.deletedAt),
		),
	});

	if (activeDomain) {
		log.info("Domain already exists");
		throw DomainErrors.domainAlreadyExists(domain);
	}

	log.info("Finding deleted domain");
	const deletedDomain = await db.query.domain.findFirst({
		where: and(
			eq(schema.domain.domain, domain),
			eq(schema.domain.organizationId, organizationId),
		),
	});

	return { deletedDomain };
}
