import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { DomainErrors } from "@be/domain/lib/errors";
import { useLogger } from "evlog/elysia";

export async function checkExistingDomain_step1({
	domain,
	organizationId,
}: {
	domain: string;
	organizationId: string;
}) {
	const logger = useLogger();
	logger.info("Finding existing domain", { domain });
	const activeDomain = await db.query.domain.findFirst({
		where: and(
			eq(schema.domain.domain, domain),
			eq(schema.domain.organizationId, organizationId),
			isNull(schema.domain.deletedAt),
		),
	});

	if (activeDomain) {
		logger.info("Domain already exists", { domain });
		throw DomainErrors.domainAlreadyExists(domain);
	}

	logger.info("Finding deleted domain", { domain });
	const deletedDomain = await db.query.domain.findFirst({
		where: and(
			eq(schema.domain.domain, domain),
			eq(schema.domain.organizationId, organizationId),
		),
	});

	return { deletedDomain };
}
