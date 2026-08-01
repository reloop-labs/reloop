import { toApiKeyResponse } from "@reloop/api-key/mappers/api-key-response";
import type { ApiKeyTypes } from "@reloop/api-key/types/api-key.type";
import {
	parseApiKeySort,
	toApiKeyOrderBy,
} from "@reloop/api-key/utils/api-key-sort";
import { controllerLog } from "@reloop/api-key/utils/controller-log";
import { db } from "@reloop/db/client";
import * as schema from "@reloop/db/schema";
import { API_KEY_LIST_WEBHOOK_EVENT } from "@reloop/webhook-events";
import { and, count, eq, ilike, or } from "drizzle-orm";

export async function listApiKeysController({
	query,
	organizationId,
}: {
	query: ApiKeyTypes.ApiKeyListQuery;
	organizationId: string;
}): Promise<ApiKeyTypes.ApiKeyListResponse> {
	const { page = 1, limit = 10, enabled, userId, q, sort } = query;
	const offset = (page - 1) * limit;
	const log = controllerLog();
	log.info("Getting API keys");

	const conditions = [eq(schema.apikey.organizationId, organizationId)];
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
	const orderBy = toApiKeyOrderBy(parseApiKeySort(sort));

	log.info("Getting API keys and total count in parallel");
	const [totalResult, result] = await Promise.all([
		db.select({ count: count() }).from(schema.apikey).where(whereClause),
		db.query.apikey.findMany({
			where: whereClause,
			orderBy,
			limit: limit,
			offset: offset,
			with: { user: true },
		}),
	]);
	const total = totalResult[0]?.count || 0;
	log.info("API keys retrieved");

	return {
		apiKeys: result.map((apiKey) =>
			toApiKeyResponse(apiKey, API_KEY_LIST_WEBHOOK_EVENT.id),
		),
		total,
		page,
		limit,
		object: "api_key" as const,
		event: API_KEY_LIST_WEBHOOK_EVENT.id,
	};
}
