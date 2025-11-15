import type { DomainTypes } from "@be/domain/types/domain.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { logger } from "@reloop/logger";
import { and, count, desc, eq, isNull } from "drizzle-orm";

export async function listDomains(
	query: DomainTypes.DomainQuery,
	organizationId: string,
	userId: string,
): Promise<DomainTypes.DomainListResponse> {
	const { page = 1, limit = 10, status } = query;
	const offset = (page - 1) * limit;

	logger.info(
		{
			page,
			limit,
			status,
			organizationId,
			userId,
		},
		"Listing domains",
	);

	try {
		const conditions = [
			isNull(schema.domain.deletedAt),
			eq(schema.domain.organizationId, organizationId),
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

		return {
			domains,
			total,
			page,
			limit,
		};
	} catch (error) {
		logger.error(
			{
				query,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error listing domains",
		);
		throw error;
	}
}

export async function listDomainsHandler(
	query: DomainTypes.DomainQuery,
	organizationId: string,
	userId: string,
): Promise<DomainTypes.DomainListResponse> {
	logger.info({ query, organizationId, userId }, "Listing domains");

	try {
		const domains = await listDomains(query, organizationId, userId);
		logger.info(
			{ query, organizationId, userId },
			"Domains listed successfully",
		);
		return domains;
	} catch (error) {
		logger.error(
			{
				query,
				organizationId,
				userId,
				error: error instanceof Error ? error.message : String(error),
			},
			"Error listing domains",
		);
		throw error;
	}
}
