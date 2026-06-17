import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import type { DomainTypes } from "@reloop/domain/types/domain.type";
import { DOMAIN_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, count, desc, eq, ilike, isNull } from "drizzle-orm";

import { useLogger } from "evlog/elysia";

export async function listDomainsController({
	query,
	organizationId,
}: {
	query: DomainTypes.DomainQuery;
	organizationId: string;
}): Promise<DomainTypes.DomainListResponse> {
	const log = useLogger();
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

		const domainsWithCounts = await Promise.all(
			domains.map(async (d) => {
				const [sentCountResult] = await db
					.select({ count: count() })
					.from(schema.emailLog)
					.where(eq(schema.emailLog.domainId, d.id));
				return {
					...d,
					sentCount: Number(sentCountResult?.count || 0),
					object: "domain" as const,
				};
			})
		);

		const finalResponse = {
			object: "domain" as const,
			domains: domainsWithCounts,
			total,
			page,
			limit,
			event: DOMAIN_LIST_WEBHOOK_EVENT.id,
		};

		return finalResponse;
	} catch (error) {
		log.error("Error listing domains");
		throw error;
	}
}
