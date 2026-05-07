import type { DomainTypes } from "@be/domain/types/domain.type";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { Logger } from "@reloop/logger";
import { DOMAIN_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, count, desc, eq, ilike, isNull } from "drizzle-orm";

export async function listDomainsController({
	query,
	organizationId,
	logger,
}: {
	query: DomainTypes.DomainQuery;
	organizationId: string;
	logger: Logger;
}): Promise<DomainTypes.DomainListResponse> {
	const { page = 1, limit = 10, status, q } = query;
	const offset = (page - 1) * limit;

	try {
		const conditions = [
			isNull(schema.domain.deletedAt),
			eq(schema.domain.organizationId, organizationId),
		];
		if (status) {
			conditions.push(eq(schema.domain.status, status));
		}
		if (q) {
			conditions.push(ilike(schema.domain.domain, `%${q}%`));
		}
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

		const finalResponse = {
			object: "domain" as const,
			domains: domains.map((d) => ({ ...d, object: "domain" as const })),
			total,
			page,
			limit,
			event: DOMAIN_LIST_WEBHOOK_EVENT.id,
		};

		return finalResponse;
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
