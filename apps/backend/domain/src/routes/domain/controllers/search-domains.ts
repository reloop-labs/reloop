import type { DomainTypes } from "@be/domain/routes/domain/domain.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, isNull, like } from "drizzle-orm";

export async function searchDomains(
	searchTerm: string,
	query: Omit<DomainTypes.DomainQuery, "organizationId" | "userId">,
): Promise<DomainTypes.DomainListResponse> {
	const { page = 1, limit = 10, status } = query;
	const offset = (page - 1) * limit;

	logger.info({ searchTerm, page, limit, status }, "Searching domains");

	try {
		const conditions = [
			like(schema.domain.domain, `%${searchTerm}%`),
			isNull(schema.domain.deletedAt),
		];
		if (status !== undefined) conditions.push(eq(schema.domain.status, status));
		const whereClause = and(...conditions);
		const totalResult = await db
			.select({ count: count() })
			.from(schema.domain)
			.where(whereClause);
		const total = totalResult[0]?.count || 0;

		const domains = await db.query.domain.findMany({
			where: whereClause,
			orderBy: desc(schema.domain.createdAt),
			limit: limit,
			offset: offset,
			with: {
				dnsRecords: true,
			},
		});

		logger.info(
			{
				searchTerm,
				total,
				page,
				limit,
				count: domains.length,
			},
			"Domain search completed",
		);

		return {
			domains,
			total,
			page,
			limit,
		};
	} catch (error) {
		logger.error(
			{
				searchTerm,
				query,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error searching domains",
		);
		throw error;
	}
}

export async function searchDomainsHandler(
	searchTerm: string,
	query: Omit<DomainTypes.DomainQuery, "organizationId" | "userId">,
): Promise<DomainTypes.DomainListResponse> {
	logger.info({ searchTerm, query }, "Searching domains");

	try {
		const result = await searchDomains(searchTerm, query);
		logger.info(
			{
				searchTerm,
				total: result.total,
				page: result.page,
				limit: result.limit,
				count: result.domains.length,
			},
			"Domain search completed",
		);
		return result;
	} catch (error) {
		logger.error(
			{
				searchTerm,
				query,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error searching domains",
		);
		throw error;
	}
}
