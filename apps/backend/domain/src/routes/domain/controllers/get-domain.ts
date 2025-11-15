import type { DomainTypes } from "@be/domain/types/domain.type";
import {
	generateDomainCacheKey,
	getCachedOrFetch,
} from "@be/domain/utils/cache-helpers";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, eq, isNull } from "drizzle-orm";
import { status } from "elysia";

export async function getDomain(
	domainName: string,
	organizationId: string,
): Promise<DomainTypes.DomainResponse> {
	logger.info({ domain: domainName, organizationId }, "Getting domain");

	try {
		const result = await db.query.domain.findFirst({
			where: and(
				eq(schema.domain.domain, domainName),
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
			logger.warn({ domain: domainName }, "Domain not found");
			throw status(404, { message: "Domain not found" });
		}

		logger.info({ domain: domainName }, "Domain retrieved successfully");
		return result;
	} catch (error) {
		logger.error(
			{
				domain: domainName,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting domain",
		);
		throw error;
	}
}

export async function getDomainHandler(
	domainName: string,
	organizationId: string,
): Promise<DomainTypes.DomainResponse> {
	logger.info({ domain: domainName, organizationId }, "Getting domain");

	try {
		const cacheKey = generateDomainCacheKey(domainName, organizationId);
		const domain = await getCachedOrFetch(
			cacheKey,
			() => getDomain(domainName, organizationId),
			{ domain: domainName, organizationId, operation: "getDomain" },
		);
		logger.info(
			{ domain: domainName, organizationId },
			"Domain retrieved successfully",
		);
		return domain;
	} catch (error) {
		logger.error(
			{
				domain: domainName,
				organizationId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error getting domain",
		);
		throw error;
	}
}
