import { DomainErrors } from "@reloop/domain/lib/errors";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { log } from "evlog";
import { useLogger } from "evlog/elysia";

export async function checkExistingDomain_step1({
	domain,
	organizationId,
}: {
	domain: string;
	organizationId: string;
}) {
	const logger = useLogger();
	log.info({ ...{ domain }, message: "Finding existing domain" });
	const activeDomain = await db.query.domain.findFirst({
		where: and(
			eq(schema.domain.domain, domain),
			eq(schema.domain.organizationId, organizationId),
			isNull(schema.domain.deletedAt),
		),
	});

	if (activeDomain) {
		log.info({ ...{ domain }, message: "Domain already exists" });
		throw DomainErrors.domainAlreadyExists(domain);
	}

	log.info({ ...{ domain }, message: "Finding deleted domain" });
	const deletedDomain = await db.query.domain.findFirst({
		where: and(
			eq(schema.domain.domain, domain),
			eq(schema.domain.organizationId, organizationId),
		),
	});

	return { deletedDomain };
}
