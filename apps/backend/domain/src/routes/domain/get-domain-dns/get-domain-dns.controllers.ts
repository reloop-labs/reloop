import type { DNSTypes } from "@be/domain/types/dns.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { resolveNs } from "node:dns/promises";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getDomainDNSController({
	domainId,
	organizationId,
	logger,
}: {
	domainId: string;
	organizationId: string;
	logger: Logger;
}): Promise<DNSTypes.DomainNameserversResponse> {
	try {
		const foundDomain = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.id, domainId),
				eq(schema.domain.organizationId, organizationId),
				isNull(schema.domain.deletedAt),
			),
		});

		if (!foundDomain) {
			throw status(404, { message: "Domain not found" });
		}

		let nameservers: string[] | null = null;

		try {
			nameservers = await resolveNs(foundDomain.domain);
		} catch (error) {
			logger.warn(
				{
					domainId,
					domain: foundDomain.domain,
					error: error instanceof Error ? error.message : String(error),
				},
				"Unable to resolve nameservers for domain",
			);
		}

		return {
			domainId: foundDomain.id,
			domain: foundDomain.domain,
			nameservers,
		};
	} catch (error) {
		logger.error({ domainId, error }, "Error getting domain nameservers");
		throw error;
	}
}
