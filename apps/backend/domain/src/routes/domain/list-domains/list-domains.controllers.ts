import { db } from "@reloop/db/client";
import {
	afterCursor,
	cursorOrderBy,
	decodeCursor,
	toCursorPage,
} from "@reloop/db/pagination";
import * as schema from "@reloop/db/schema";
import type { DomainTypes } from "@reloop/domain/types/domain.type";
import { DOMAIN_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, count, eq, ilike, inArray, isNull } from "drizzle-orm";

import { useLogger } from "evlog/elysia";

export async function listDomainsController({
	query,
	organizationId,
}: {
	query: DomainTypes.DomainQuery;
	organizationId: string;
}): Promise<DomainTypes.DomainListResponse> {
	const log = useLogger();
	const { page = 1, limit = 10, status, q, cursor } = query;
	// With a cursor, pagination is keyset-based and `page` is ignored.
	const position = cursor ? decodeCursor(cursor) : null;
	const offset = position ? 0 : (page - 1) * limit;

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
		const rows = await db.query.domain.findMany({
			where: position
				? and(whereClause, afterCursor(schema.domain, position))
				: whereClause,
			orderBy: cursorOrderBy(schema.domain),
			limit: limit + 1,
			offset: offset,
			with: {
				dnsRecords: true,
			},
		});
		const { items: domains, hasMore, nextCursor } = toCursorPage(rows, limit);

		// One grouped query per direction instead of one query per domain.
		const domainIds = domains.map((d) => d.id);
		const [sentRows, receivedRows] = domainIds.length
			? await Promise.all([
					db
						.select({ domainId: schema.emailLog.domainId, count: count() })
						.from(schema.emailLog)
						.where(inArray(schema.emailLog.domainId, domainIds))
						.groupBy(schema.emailLog.domainId),
					db
						.select({ domainId: schema.mailbox.domainId, count: count() })
						.from(schema.inboundEmail)
						.innerJoin(
							schema.mailbox,
							eq(schema.inboundEmail.mailboxId, schema.mailbox.id),
						)
						.where(inArray(schema.mailbox.domainId, domainIds))
						.groupBy(schema.mailbox.domainId),
				])
			: [[], []];
		const sentByDomain = new Map(
			sentRows.map((r) => [r.domainId, Number(r.count)]),
		);
		const receivedByDomain = new Map(
			receivedRows.map((r) => [r.domainId, Number(r.count)]),
		);

		const domainsWithCounts = domains.map((d) => ({
			...d,
			sentCount: sentByDomain.get(d.id) ?? 0,
			receivedCount: receivedByDomain.get(d.id) ?? 0,
			object: "domain" as const,
		}));

		const finalResponse = {
			object: "domain" as const,
			domains: domainsWithCounts,
			total,
			page,
			limit,
			hasMore,
			nextCursor,
			event: DOMAIN_LIST_WEBHOOK_EVENT.id,
		};

		return finalResponse;
	} catch (error) {
		log.error("Error listing domains");
		throw error;
	}
}
