import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { DomainErrors } from "@reloop/domain/error/domain.error-response";
import { and, eq, isNull, sql } from "drizzle-orm";

import { useLogger } from "evlog/elysia";

/**
 * Application-level uniqueness for active domains (org + domain name).
 * There is no DB unique constraint on (organization_id, domain) so soft-deleted
 * rows and shared platform domains remain flexible — this check is the gate.
 */
export async function checkExistingDomain_step1({
	domain,
	organizationId,
}: {
	domain: string;
	organizationId: string;
}) {
	const log = useLogger();
	const normalized = domain.toLowerCase().trim();

	log.info("Finding existing domain");
	const activeDomain = await db.query.domain.findFirst({
		where: and(
			sql`lower(${schema.domain.domain}) = ${normalized}`,
			eq(schema.domain.organizationId, organizationId),
			isNull(schema.domain.deletedAt),
		),
	});

	if (activeDomain) {
		log.info("Domain already exists");
		throw DomainErrors.domainAlreadyExists(domain);
	}

	log.info("Finding deleted domain");
	// Prefer exact match, then case-insensitive — undelete path reuses this row.
	const deletedDomain =
		(await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.domain, domain),
				eq(schema.domain.organizationId, organizationId),
			),
		})) ??
		(await db.query.domain.findFirst({
			where: and(
				sql`lower(${schema.domain.domain}) = ${normalized}`,
				eq(schema.domain.organizationId, organizationId),
			),
		}));

	return { deletedDomain };
}
