import { toApiKeyResponse } from "@reloop/api-key/mappers/api-key-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import { loadScopeViews } from "@reloop/api-key/utils/api-key-scope";
import {
	isDefaultApiKeySort,
	parseApiKeySort,
	toApiKeyOrderBy,
} from "@reloop/api-key/utils/api-key-sort";
import { controllerLog } from "@reloop/api-key/utils/controller-log";
import { db } from "@reloop/db/client";
import {
	afterCursor,
	cursorOrderBy,
	decodeCursor,
	toCursorPage,
} from "@reloop/db/pagination";
import * as schema from "@reloop/db/schema";
import { API_KEY_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, count, eq, ilike, isNull, or } from "drizzle-orm";
import { createError } from "evlog";

export async function listApiKeysController({
	query,
	organizationId,
}: {
	query: ApiKeyTypes.ApiKeyListQuery;
	organizationId: string;
}): Promise<ApiKeyTypes.ApiKeyListResponse> {
	const { page = 1, limit = 10, enabled, userId, q, sort, cursor } = query;
	const sortRules = parseApiKeySort(sort);
	// Cursors follow (createdAt, id); any other sort keeps offset pagination.
	const cursorSort = isDefaultApiKeySort(sortRules);
	if (cursor && !cursorSort) {
		throw createError({
			status: 400,
			message: "cursor cannot be combined with this sort",
			why: "Cursor pagination only works with the default sort (createdAt:desc).",
			fix: "Omit sort (or use sort=createdAt:desc) when passing cursor, or paginate this sort with page.",
		});
	}
	// With a cursor, pagination is keyset-based and `page` is ignored.
	const position = cursor ? decodeCursor(cursor) : null;
	const offset = position ? 0 : (page - 1) * limit;
	const log = controllerLog();
	log.info("Getting API keys");

	const conditions = [
		eq(schema.apikey.organizationId, organizationId),
		isNull(schema.apikey.deletedAt),
	];
	if (enabled !== undefined)
		conditions.push(eq(schema.apikey.enabled, enabled));
	if (userId !== undefined) conditions.push(eq(schema.apikey.userId, userId));
	if (q !== undefined && q !== "") {
		const searchCondition = or(
			ilike(schema.apikey.name, `%${q}%`),
			ilike(schema.apikey.start, `%${q}%`),
			ilike(schema.apikey.prefix, `%${q}%`),
		);
		if (searchCondition) {
			conditions.push(searchCondition);
		}
	}
	const whereClause = and(...conditions);
	const orderBy = cursorSort
		? cursorOrderBy(schema.apikey)
		: toApiKeyOrderBy(sortRules);

	log.info("Getting API keys and total count in parallel");
	const [totalResult, rows] = await Promise.all([
		db.select({ count: count() }).from(schema.apikey).where(whereClause),
		db.query.apikey.findMany({
			where: position
				? and(whereClause, afterCursor(schema.apikey, position))
				: whereClause,
			orderBy,
			limit: limit + 1,
			offset: offset,
			with: { user: true },
		}),
	]);
	const total = totalResult[0]?.count || 0;
	const {
		items: result,
		hasMore,
		nextCursor: createdAtCursor,
	} = toCursorPage(rows, limit);
	// A cursor only identifies a position in createdAt order.
	const nextCursor = cursorSort ? createdAtCursor : null;
	log.info("API keys retrieved");
	const scopes = await loadScopeViews(result.map((apiKey) => apiKey.id));

	return {
		apiKeys: result.map((apiKey) =>
			toApiKeyResponse(
				apiKey,
				API_KEY_LIST_WEBHOOK_EVENT.id,
				scopes.get(apiKey.id) ?? [],
			),
		),
		total,
		page,
		limit,
		hasMore,
		nextCursor,
		object: "api_key" as const,
		event: API_KEY_LIST_WEBHOOK_EVENT.id,
	};
}
